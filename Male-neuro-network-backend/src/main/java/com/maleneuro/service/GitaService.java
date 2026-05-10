package com.maleneuro.service;

import com.maleneuro.model.NeuralProfile;
import com.maleneuro.model.ScorecardLevel;
import com.maleneuro.service.llm.LlmClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GitaService {

    private static final Logger log = LoggerFactory.getLogger(GitaService.class);

    private static final Pattern DEVANAGARI = Pattern.compile("[\\u0900-\\u097F]");
    private static final Pattern SHLOKA_BLOCK = Pattern.compile(
        "SHLOKA_SANSKRIT:\\s*(.*?)(?=\\nSHLOKA_TRANSLITERATION:|\\nMEANING_ENGLISH:|\\n---|$)",
        Pattern.DOTALL
    );

    private final LlmClient llmClient;

    public GitaService(LlmClient llmClient) {
        this.llmClient = llmClient;
    }

    /**
     * Generates Bhagavad Gita guidance tailored to the profile's weakest neural metrics.
     * Returns a structured payload with one shloka card per area that needs work,
     * plus a brief overall reading of the user's coherence score.
     */
    public Map<String, Object> generateGuidance(NeuralProfile profile) {
        try {
            String prompt = buildGuidancePrompt(profile);
            // Each card carries Sanskrit + IAST + 3 prose blocks; with multiple weaknesses
            // and an overall reading we need plenty of room or the response gets truncated mid-card.
            String content = llmClient.chatComplete(LlmClient.LlmRequest.singleUser(prompt, 0.6, 4000));

            // The model occasionally puts IAST in the SHLOKA_SANSKRIT field.
            // Detect that and retry once with a stricter, lower-temperature instruction.
            if (!sanskritIsDevanagari(content)) {
                log.warn("Gita response had non-Devanagari Sanskrit for profile {}, retrying", profile.getId());
                String stricter = prompt + """

                    CRITICAL CORRECTION: SHLOKA_SANSKRIT MUST be in Devanagari script (देवनागरी).
                    Do NOT put Roman/IAST text in SHLOKA_SANSKRIT — IAST belongs ONLY in SHLOKA_TRANSLITERATION.
                    Example of correct SHLOKA_SANSKRIT format:
                    SHLOKA_SANSKRIT: कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।
                    मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥
                    """;
                content = llmClient.chatComplete(LlmClient.LlmRequest.singleUser(stricter, 0.3, 4000));
            }

            return Map.of(
                "coherenceScore", Math.round(profile.getCoherenceScore() * 100),
                "name", nvl(profile.getName(), "seeker"),
                "guidance", content
            );
        } catch (Exception e) {
            log.error("Gita guidance generation failed for profile {}: {}", profile.getId(), e.getMessage(), e);
            return Map.of(
                "coherenceScore", Math.round(profile.getCoherenceScore() * 100),
                "name", nvl(profile.getName(), "seeker"),
                "guidance", buildFallbackGuidance(profile)
            );
        }
    }

    /**
     * Translates an English passage into the target language. The shloka stays in Sanskrit;
     * only the meaning and impact text are translated.
     */
    public String translate(String text, String targetLanguage) {
        if (text == null || text.isBlank()) return "";
        if (targetLanguage == null || targetLanguage.isBlank() || "english".equalsIgnoreCase(targetLanguage)) {
            return text;
        }
        try {
            String prompt = String.format("""
                Translate the following text into %s. Preserve any Sanskrit shloka lines exactly as written —
                do NOT translate Sanskrit. Translate only the English prose. Return only the translated text,
                no preface, no quotes, no explanation.

                Text:
                %s
                """, targetLanguage, text);
            return llmClient.chatComplete(LlmClient.LlmRequest.singleUser(prompt, 0.3, 1200));
        } catch (Exception e) {
            log.error("Gita translation failed: {}", e.getMessage(), e);
            return text;
        }
    }

    // ---- Prompt construction ----

    /** Returns true if every SHLOKA_SANSKRIT block in the model output contains Devanagari characters. */
    private boolean sanskritIsDevanagari(String content) {
        if (content == null) return false;
        Matcher m = SHLOKA_BLOCK.matcher(content);
        boolean foundAny = false;
        while (m.find()) {
            foundAny = true;
            String shloka = m.group(1);
            if (shloka == null || !DEVANAGARI.matcher(shloka).find()) return false;
        }
        return foundAny;
    }

    /** Pretty label and current percentage for the prompt's "areas that need work" list. */
    private Map<String, Object> describeWeakness(String key, NeuralProfile p) {
        Map<String, double[]> table = new LinkedHashMap<>();
        // value, isInverse (true => high is bad)
        table.put("sleepQuality",       new double[]{ p.getSleepQuality(),       0 });
        table.put("stressLevel",        new double[]{ p.getStressLevel(),        1 });
        table.put("focusIndex",         new double[]{ p.getFocusIndex(),         0 });
        table.put("emotionalBalance",   new double[]{ p.getEmotionalBalance(),   0 });
        table.put("creativity",         new double[]{ p.getCreativity(),         0 });
        table.put("analyticalThinking", new double[]{ p.getAnalyticalThinking(), 0 });
        table.put("socialEngagement",   new double[]{ p.getSocialEngagement(),   0 });
        table.put("physicalActivity",   new double[]{ p.getPhysicalActivity(),   0 });
        table.put("mindfulness",        new double[]{ p.getMindfulness(),        0 });
        table.put("cognitiveLoad",      new double[]{ p.getCognitiveLoad(),      1 });

        double[] entry = table.getOrDefault(key, new double[]{ 0.5, 0 });
        int pct = (int) Math.round(entry[0] * 100);
        boolean inverse = entry[1] == 1;
        String label = key.replaceAll("([a-z])([A-Z])", "$1 $2");
        label = Character.toUpperCase(label.charAt(0)) + label.substring(1);
        return Map.of(
            "key", key,
            "label", label,
            "pct", pct,
            "phrase", inverse
                ? String.format("%s at %d%% (elevated — lower is better)", label, pct)
                : String.format("%s at %d%% (low — higher is better)", label, pct)
        );
    }

    /**
     * Decide which metric keys count as weaknesses for this profile.
     * First trust the scorecard (the canonical "needs work" signal); if that's empty
     * (older profiles, or a profile created before scorecard generation ran), derive
     * weaknesses from raw thresholds so we always have something to advise on.
     */
    private List<String> computeWeaknesses(NeuralProfile p) {
        Map<String, String> sc = p.getScorecard() != null ? p.getScorecard() : Map.of();
        List<String> weaknesses = new ArrayList<>();
        sc.forEach((k, v) -> { if (ScorecardLevel.WEAKNESS.equals(v)) weaknesses.add(k); });

        if (weaknesses.isEmpty()) {
            if (p.getMindfulness() < 0.5)        weaknesses.add("mindfulness");
            if (p.getStressLevel() > 0.6)        weaknesses.add("stressLevel");
            if (p.getEmotionalBalance() < 0.5)   weaknesses.add("emotionalBalance");
            if (p.getFocusIndex() < 0.5)         weaknesses.add("focusIndex");
            if (p.getCreativity() < 0.5)         weaknesses.add("creativity");
            if (weaknesses.isEmpty()) weaknesses.add("mindfulness");
        }
        return weaknesses;
    }

    private String buildGuidancePrompt(NeuralProfile p) {
        List<String> weaknesses = computeWeaknesses(p);

        StringBuilder weaknessLines = new StringBuilder();
        for (String w : weaknesses) {
            Map<String, Object> d = describeWeakness(w, p);
            weaknessLines.append("- ").append(d.get("key"))
                .append(" → ").append(d.get("phrase")).append('\n');
        }

        return String.format("""
            You are a Bhagavad Gita scholar AND a neuroscience-informed wellness coach.
            The user's name is %s. Their overall Neural Coherence is %.0f%%.

            Their neural metrics (0.0 to 1.0; for stressLevel and cognitiveLoad LOW is better, for the rest HIGH is better):
            - Sleep Quality:       %.2f
            - Stress Level:        %.2f
            - Focus Index:         %.2f
            - Emotional Balance:   %.2f
            - Creativity:          %.2f
            - Analytical Thinking: %.2f
            - Social Engagement:   %.2f
            - Physical Activity:   %.2f
            - Mindfulness:         %.2f
            - Cognitive Load:      %.2f

            Areas that need work — each line shows the metric key, the current score, and which direction is healthy.
            Map each one to an appropriate Bhagavad Gita situation (anger, fear, depression, lust, pride, greed,
            laziness, confusion, uncontrolled mind, loneliness, demotivated, losing hope, seeking peace,
            forgetfulness, temptation, envy, etc.):
            %s

            For EACH weakness above, output a card with this EXACT structure (use --- as a separator between cards):

            METRIC: <camelCase metric key, e.g. mindfulness>
            TITLE: <human-readable title, e.g. "Mindfulness">
            SCORE_LINE: Your <Title> is at <X>%% — <one short sentence in plain English explaining why this is a concern, and naming the Gita situation it maps to>. That's why the Gita's teaching below applies.
            SITUATION: <Gita situation category — one of: Anger, Fear, Depression, Lust, Pride, Greed, Laziness, Confusion, Uncontrolled Mind, Loneliness, Demotivated, Losing Hope, Seeking Peace, Forgetfulness, Temptation, Envy, Discrimination, Death of a Loved One, Feeling Sinful, Practising Forgiveness, Dealing with Envy>
            REFERENCE: Chapter X, Verse Y
            SHLOKA_SANSKRIT: <the actual Sanskrit shloka in DEVANAGARI SCRIPT ONLY, on 2 lines. Never use Roman/IAST here. Example: कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।>
            SHLOKA_TRANSLITERATION: <IAST/Roman transliteration of the same shloka, 2 lines>
            MEANING_ENGLISH: <2-4 sentence plain English translation of the verse>
            IMPACT: <2-3 sentences on the neuroscience / life impact of having this metric out of balance — what happens to the brain and behavior>
            GITA_ADVICE: <3-5 sentences explaining what the Gita teaches to fulfil/improve this area, tying the verse back to a concrete daily practice. Begin by referring back to the score (e.g. "With your Mindfulness at 20%%, the Gita's prescription is...")>
            ---

            After all cards, add ONE final card (not separated by ---, just appended after the last ---):

            OVERALL_READING: <3-4 sentences synthesising their coherence score and weaknesses into a single Gita-flavoured reflection>

            HARD CONSTRAINTS:
            - Use real Bhagavad Gita verses. Do not invent verses. If unsure, pick a well-known one for that situation.
            - SHLOKA_SANSKRIT MUST be Devanagari (देवनागरी). SHLOKA_TRANSLITERATION MUST be IAST/Roman. Never swap them.
            - SCORE_LINE MUST contain the literal percentage you were given for that metric.
            - No markdown formatting (no **bold**, no #headers). Just the labelled fields above.
            - Do not add any preface or closing remark — start with the first METRIC line.
            """,
            nvl(p.getName(), "seeker"),
            p.getCoherenceScore() * 100,
            p.getSleepQuality(),
            p.getStressLevel(),
            p.getFocusIndex(),
            p.getEmotionalBalance(),
            p.getCreativity(),
            p.getAnalyticalThinking(),
            p.getSocialEngagement(),
            p.getPhysicalActivity(),
            p.getMindfulness(),
            p.getCognitiveLoad(),
            weaknessLines.toString().trim()
        );
    }

    // ---- Fallback ----

    /**
     * Static library of canonical Bhagavad Gita verses, one entry per metric.
     * Used by {@link #buildFallbackGuidance} when the LLM call fails so the
     * served fallback still reflects the user's actual weaknesses instead of
     * always defaulting to a single hardcoded "Mindfulness" card.
     */
    private record FallbackVerse(
            String title,
            String situation,
            String reference,
            String shlokaSanskrit,            // 2 lines, Devanagari
            String shlokaTransliteration,     // 2 lines, IAST
            String meaningEnglish,
            String impactNeuro,
            String adviceTemplate             // contains one %d for the metric pct
    ) {}

    private static final Map<String, FallbackVerse> FALLBACK_LIBRARY = createFallbackLibrary();

    private static Map<String, FallbackVerse> createFallbackLibrary() {
        Map<String, FallbackVerse> m = new LinkedHashMap<>();
        m.put("sleepQuality", new FallbackVerse(
                "Sleep Quality",
                "Seeking Peace",
                "Chapter 6, Verse 17",
                "युक्ताहारविहारस्य युक्तचेष्टस्य कर्मसु।\nयुक्तस्वप्नावबोधस्य योगो भवति दुःखहा॥",
                "yuktāhāra-vihārasya yukta-ceṣṭasya karmasu\nyukta-svapnāvabodhasya yogo bhavati duḥkha-hā",
                "He who is regulated in his eating and recreation, balanced in his actions, and disciplined in his sleep and wakefulness, attains the yoga that destroys all sorrow.",
                "Poor sleep compromises memory consolidation in the hippocampus, weakens prefrontal regulation, and elevates cortisol — driving anxiety and reactive emotion the next day.",
                "With your Sleep Quality at %d%%, the Gita's prescription is regulated rhythm. Sleep at the same hour, wake at the same hour, eat with discipline. Yoga as the Gita defines it begins with the body's clock."
        ));
        m.put("stressLevel", new FallbackVerse(
                "Stress Level",
                "Anger",
                "Chapter 2, Verse 47",
                "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
                "karmaṇy evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo'stv akarmaṇi",
                "You have a right to perform your duties, but never to the fruits of action. Do not let the results be your motive, nor let attachment to inaction grow.",
                "Chronic stress activates the HPA axis, drives the amygdala into over-firing, and shrinks hippocampal volume — directly impairing memory and emotional regulation.",
                "With your Stress Level at %d%%, the Gita's prescription is action without attachment to outcome. Do the work; release the result. The amygdala quiets when control is surrendered to the act itself."
        ));
        m.put("focusIndex", new FallbackVerse(
                "Focus Index",
                "Uncontrolled Mind",
                "Chapter 6, Verse 35",
                "असंशयं महाबाहो मनो दुर्निग्रहं चलम्।\nअभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते॥",
                "asaṁśayaṁ mahā-bāho mano durnigrahaṁ calam\nabhyāsena tu kaunteya vairāgyeṇa ca gṛhyate",
                "Without doubt the mind is restless and difficult to restrain, but it can be controlled through steady practice and through detachment.",
                "Low focus correlates with weak prefrontal-cortex top-down control over the default mode network. Attention is a trainable circuit, not a fixed trait.",
                "With your Focus Index at %d%%, the Gita's prescription is abhyāsa — repeated training. Pick one task, hold it for an extended block, return to it when the mind drifts. Each return strengthens the circuit."
        ));
        m.put("emotionalBalance", new FallbackVerse(
                "Emotional Balance",
                "Depression",
                "Chapter 2, Verse 14",
                "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः।\nआगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत॥",
                "mātrā-sparśās tu kaunteya śītoṣṇa-sukha-duḥkha-dāḥ\nāgamāpāyino'nityās tāṁs titikṣasva bhārata",
                "The contact of the senses with their objects produces heat and cold, pleasure and pain. They come and go, never permanent. Endure them, O Bharata.",
                "Emotional imbalance reflects amygdala–prefrontal dysregulation. Mood is felt as fact, but the Gita reminds us it is sensory weather, not the self.",
                "With your Emotional Balance at %d%%, the Gita's prescription is titikṣā — patient endurance. Mood is impermanent. Watch it pass without reorganising your day around it."
        ));
        m.put("creativity", new FallbackVerse(
                "Creativity",
                "Confusion",
                "Chapter 3, Verse 8",
                "नियतं कुरु कर्म त्वं कर्म ज्यायो ह्यकर्मणः।\nशरीरयात्रापि च ते न प्रसिद्ध्येदकर्मणः॥",
                "niyataṁ kuru karma tvaṁ karma jyāyo hy akarmaṇaḥ\nśarīra-yātrāpi ca te na prasiddhyed akarmaṇaḥ",
                "Perform your prescribed duty; for action is better than inaction. Even your bodily existence cannot be maintained without action.",
                "Creative output trains the temporal lobe and the imaginative networks. Pure consumption flattens originality; sustained making sharpens it.",
                "With your Creativity at %d%%, the Gita's prescription is to act before you feel ready. Make something every day, even badly. Action precedes inspiration."
        ));
        m.put("analyticalThinking", new FallbackVerse(
                "Analytical Thinking",
                "Confusion",
                "Chapter 4, Verse 38",
                "न हि ज्ञानेन सदृशं पवित्रमिह विद्यते।\nतत्स्वयं योगसंसिद्धः कालेनात्मनि विन्दति॥",
                "na hi jñānena sadṛśaṁ pavitram iha vidyate\ntat svayaṁ yoga-saṁsiddhaḥ kālenātmani vindati",
                "There is nothing as purifying as knowledge in this world. He who is perfected in yoga finds it within himself in time.",
                "Analytical reasoning is a parietal–prefrontal pattern, sharpened by demanding problems and dulled by passive intake.",
                "With your Analytical Thinking at %d%%, the Gita's prescription is sustained pursuit of knowledge. Solve hard problems, read demanding text. The circuit grows under load."
        ));
        m.put("socialEngagement", new FallbackVerse(
                "Social Engagement",
                "Loneliness",
                "Chapter 6, Verse 32",
                "आत्मौपम्येन सर्वत्र समं पश्यति योऽर्जुन।\nसुखं वा यदि वा दुःखं स योगी परमो मतः॥",
                "ātmaupamyena sarvatra samaṁ paśyati yo'rjuna\nsukhaṁ vā yadi vā duḥkhaṁ sa yogī paramo mataḥ",
                "He is the perfect yogi who, by comparison to himself, sees the equality of all beings, in both their happiness and their distress.",
                "Social isolation drives the same neural inflammation pattern as physical pain. Connection releases oxytocin and serotonin, stabilising mood.",
                "With your Social Engagement at %d%%, the Gita's prescription is to see yourself in others. Reach out to one person today, recognising their joy and pain as your own."
        ));
        m.put("physicalActivity", new FallbackVerse(
                "Physical Activity",
                "Laziness",
                "Chapter 18, Verse 39",
                "यदग्रे चानुबन्धे च सुखं मोहनमात्मनः।\nनिद्रालस्यप्रमादोत्थं तत्तामसमुदाहृतम्॥",
                "yad agre cānubandhe ca sukhaṁ mohanam ātmanaḥ\nnidrālasya-pramādotthaṁ tat tāmasam udāhṛtam",
                "That happiness which from beginning to end deludes the self, born of sleep, laziness, and negligence — that is declared to be of the mode of darkness.",
                "Physical inactivity downregulates BDNF, weakens dopamine signalling, and shrinks executive function. Movement is medicine for the brain.",
                "With your Physical Activity at %d%%, the Gita's prescription is to rise out of tāmas. Walk, lift, stretch — daily, before motivation. The body must move before the mind clears."
        ));
        m.put("mindfulness", new FallbackVerse(
                "Mindfulness",
                "Seeking Peace",
                "Chapter 6, Verse 5",
                "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
                "uddhared ātmanātmānaṁ nātmānam avasādayet\nātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ",
                "One must elevate oneself by one's own mind, and not degrade oneself. The mind is the friend of the conditioned soul, and also its enemy.",
                "Low mindfulness scores correlate with default-mode-network overactivity — the brain's wandering mind circuit. This drives rumination, anxiety, and weaker emotional regulation in the prefrontal cortex.",
                "With your Mindfulness at %d%%, the Gita's prescription is steady, daily training of the mind. Begin with five minutes of breath observation each morning. Treat your mind as a student, not a tyrant."
        ));
        m.put("cognitiveLoad", new FallbackVerse(
                "Cognitive Load",
                "Confusion",
                "Chapter 2, Verse 70",
                "आपूर्यमाणमचलप्रतिष्ठं समुद्रमापः प्रविशन्ति यद्वत्।\nतद्वत्कामा यं प्रविशन्ति सर्वे स शान्तिमाप्नोति न कामकामी॥",
                "āpūryamāṇam acala-pratiṣṭhaṁ samudram āpaḥ praviśanti yadvat\ntadvat kāmā yaṁ praviśanti sarve sa śāntim āpnoti na kāma-kāmī",
                "As waters enter the ever-being-filled, ever-still ocean, so do all desires enter the one who is steady — that one attains peace, not the desire-filled one.",
                "Excess cognitive load fragments the prefrontal cortex's working-memory budget. The brain processes one thing well, not many things badly.",
                "With your Cognitive Load at %d%%, the Gita's prescription is to become the still ocean. Reduce inputs, finish what you start. Peace comes from depth, not from juggling demands."
        ));
        return Collections.unmodifiableMap(m);
    }

    /**
     * Render a deterministic fallback guidance payload that mirrors the LLM
     * output shape: one card per detected weakness, separated by ---, plus a
     * closing OVERALL_READING. Because we walk {@link #computeWeaknesses}, the
     * fallback always reflects the profile's actual weak metrics rather than a
     * single hardcoded card.
     */
    private String buildFallbackGuidance(NeuralProfile p) {
        List<String> weaknesses = computeWeaknesses(p);

        StringBuilder sb = new StringBuilder();
        for (String key : weaknesses) {
            FallbackVerse v = FALLBACK_LIBRARY.getOrDefault(key, FALLBACK_LIBRARY.get("mindfulness"));
            int pct = metricPercentage(p, key);
            sb.append("METRIC: ").append(key).append('\n');
            sb.append("TITLE: ").append(v.title()).append('\n');
            sb.append("SCORE_LINE: Your ").append(v.title()).append(" is at ").append(pct)
                    .append("% — the AI guide is briefly resting; the Gita's verse below still applies to this area.\n");
            sb.append("SITUATION: ").append(v.situation()).append('\n');
            sb.append("REFERENCE: ").append(v.reference()).append('\n');
            sb.append("SHLOKA_SANSKRIT: ").append(v.shlokaSanskrit()).append('\n');
            sb.append("SHLOKA_TRANSLITERATION: ").append(v.shlokaTransliteration()).append('\n');
            sb.append("MEANING_ENGLISH: ").append(v.meaningEnglish()).append('\n');
            sb.append("IMPACT: ").append(v.impactNeuro()).append('\n');
            sb.append("GITA_ADVICE: ").append(String.format(v.adviceTemplate(), pct)).append('\n');
            sb.append("---\n");
        }
        sb.append("OVERALL_READING: The AI guide is briefly resting. The verses above are drawn from the Bhagavad Gita's own prescriptions for the areas your profile flagged as weak — sit with them while the guide returns.\n");
        return sb.toString();
    }

    private int metricPercentage(NeuralProfile p, String key) {
        return switch (key) {
            case "sleepQuality"       -> (int) Math.round(p.getSleepQuality() * 100);
            case "stressLevel"        -> (int) Math.round(p.getStressLevel() * 100);
            case "focusIndex"         -> (int) Math.round(p.getFocusIndex() * 100);
            case "emotionalBalance"   -> (int) Math.round(p.getEmotionalBalance() * 100);
            case "creativity"         -> (int) Math.round(p.getCreativity() * 100);
            case "analyticalThinking" -> (int) Math.round(p.getAnalyticalThinking() * 100);
            case "socialEngagement"   -> (int) Math.round(p.getSocialEngagement() * 100);
            case "physicalActivity"   -> (int) Math.round(p.getPhysicalActivity() * 100);
            case "mindfulness"        -> (int) Math.round(p.getMindfulness() * 100);
            case "cognitiveLoad"      -> (int) Math.round(p.getCognitiveLoad() * 100);
            default                   -> 50;
        };
    }

    private String nvl(String value, String fallback) {
        return value != null && !value.isBlank() ? value : fallback;
    }
}
