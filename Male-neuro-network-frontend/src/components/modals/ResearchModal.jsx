import React, { useEffect } from 'react'
import MaleWatermark from '../common/MaleWatermark'

const res = {
  page: {
    position: 'fixed', inset: 0, zIndex: 10000,
    background: '#020610', fontFamily: "'SF Mono','Fira Code',monospace",
    overflowY: 'auto', WebkitOverflowScrolling: 'touch',
    color: '#ccd6f6', display: 'flex', flexDirection: 'column',
    overflow: 'hidden', isolation: 'isolate',
  },
  topBar: {
    height: 52, flexShrink: 0, borderBottom: '1px solid rgba(0,204,255,0.1)',
    background: 'rgba(4,8,20,0.98)', backdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px',
  },
  topBrand: { fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(0,204,255,0.4)' },
  closeBtn: {
    padding: '6px 18px', background: 'rgba(0,204,255,0.06)', border: '1px solid rgba(0,204,255,0.2)',
    borderRadius: 6, color: 'rgba(0,204,255,0.7)', fontSize: 11, letterSpacing: '1px',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  scroll: { flex: 1, overflowY: 'auto', scrollBehavior: 'smooth' },
  hero: {
    minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center', padding: '60px 40px',
    position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(0,204,255,0.07)',
  },
  heroBadge: {
    fontSize: 9, letterSpacing: '5px', textTransform: 'uppercase', color: '#00ccff',
    border: '1px solid rgba(0,204,255,0.22)', borderRadius: 20, padding: '5px 18px', marginBottom: 28, zIndex: 1,
  },
  heroTitle: {
    fontSize: 'clamp(52px,9vw,110px)', fontWeight: 900, letterSpacing: '6px', textTransform: 'uppercase',
    background: 'linear-gradient(135deg,#fff 0%,#00ccff 40%,#7c4dff 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    margin: '0 0 20px', lineHeight: 1.05, zIndex: 1,
  },
  heroSub: {
    fontSize: 'clamp(11px,1.4vw,14px)', letterSpacing: '3px', textTransform: 'uppercase',
    color: 'rgba(150,180,220,0.5)', fontWeight: 300, margin: '0 0 32px', zIndex: 1,
  },
  heroLine: {
    width: 180, height: 1, zIndex: 1, marginBottom: 32,
    background: 'linear-gradient(to right,transparent,rgba(0,204,255,0.6),transparent)',
  },
  heroDesc: { fontSize: 15, color: '#4a6080', lineHeight: '1.9', maxWidth: 620, zIndex: 1, margin: '0 0 48px' },
  heroStats: { display: 'flex', gap: 48, zIndex: 1 },
  heroStat: { textAlign: 'center' },
  heroStatVal: { fontSize: 'clamp(20px,3vw,32px)', fontWeight: 900, color: '#00ccff', letterSpacing: '1px' },
  heroStatLab: { fontSize: 9, color: '#2a3a50', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 6, maxWidth: 120 },
  section: { padding: '80px 40px', borderBottom: '1px solid rgba(255,255,255,0.03)' },
  inner: { maxWidth: 1200, margin: '0 auto' },
  label: { fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: '#7c4dff', marginBottom: 12 },
  heading: { fontSize: 'clamp(22px,3.5vw,42px)', fontWeight: 800, letterSpacing: '2px', color: '#e2e8f0', margin: '0 0 36px' },
  bodyText: { fontSize: 14, color: '#4a6080', lineHeight: '1.9', margin: 0 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 },
  card4: { padding: '28px 22px', background: 'rgba(6,10,28,0.7)', borderRadius: 14, backdropFilter: 'blur(12px)' },
  cardNum: { fontSize: 32, fontWeight: 900, opacity: 0.25, letterSpacing: '-2px', marginBottom: 14, lineHeight: 1 },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#ccd6f6', marginBottom: 12, lineHeight: 1.3 },
  cardDesc: { fontSize: 12, color: '#3a5070', lineHeight: '1.75', margin: 0 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 },
  circuitCard: {
    padding: '26px 30px', background: 'rgba(4,8,22,0.75)',
    borderRadius: 12, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.03)',
  },
  circuitRegion: { fontSize: 14, fontWeight: 'bold', letterSpacing: '0.5px' },
  circuitFull: { fontSize: 9, color: '#2a3a50', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 },
  circuitFn: {
    fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: '#7c4dff',
    background: 'rgba(124,77,255,0.08)', border: '1px solid rgba(124,77,255,0.18)',
    borderRadius: 10, padding: '3px 10px', whiteSpace: 'nowrap',
  },
  circuitDesc: { fontSize: 12, color: '#3a5070', lineHeight: '1.85', margin: 0 },
  hotspotGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 },
  hotspotRow: {
    display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px',
    background: 'rgba(6,10,28,0.6)', border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: 10, backdropFilter: 'blur(8px)',
  },
  hotspotDot: { width: 7, height: 7, borderRadius: '50%', background: '#00ccff', boxShadow: '0 0 8px #00ccff', flexShrink: 0, marginTop: 4 },
  hotspotLabel: { fontSize: 12, fontWeight: 'bold', color: '#ccd6f6', width: 110, flexShrink: 0 },
  hotspotVal: { fontSize: 12, color: '#3a5070', lineHeight: '1.7' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 },
  aiCard: { padding: '28px 24px', background: 'rgba(6,10,28,0.7)', borderRadius: 14, backdropFilter: 'blur(12px)' },
  aiNum: { fontSize: 30, fontWeight: 900, opacity: 0.22, letterSpacing: '-2px', marginBottom: 12, lineHeight: 1 },
  aiTitle: { fontSize: 13, fontWeight: 'bold', color: '#ccd6f6', marginBottom: 12 },
  aiDesc: { fontSize: 12, color: '#3a5070', lineHeight: '1.8', margin: 0 },
  dbCard: {
    padding: '24px 26px', background: 'rgba(6,10,28,0.7)', borderRadius: 14,
    backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.03)', display: 'block',
  },
  dbName: { fontSize: 13, fontWeight: 'bold', letterSpacing: '0.5px' },
  dbAbbr: {
    fontSize: 9, fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase',
    padding: '2px 8px', border: '1px solid', borderRadius: 4,
  },
  dbDesc: { fontSize: 11, color: '#3a5070', lineHeight: '1.8', margin: '0 0 14px' },
  dbLink: { fontSize: 10, fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' },
  sciGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 },
  sciCard: {
    display: 'flex', gap: 14, alignItems: 'flex-start', textDecoration: 'none',
    padding: '20px 20px', background: 'rgba(4,8,22,0.75)',
    border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, backdropFilter: 'blur(10px)',
  },
  sciAvatar: {
    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg,#00ccff22,#7c4dff33)',
    border: '1px solid rgba(0,204,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 900, color: '#00ccff', letterSpacing: '1px',
  },
  sciInfo: { flex: 1 },
  sciName: { fontSize: 12, fontWeight: 'bold', color: '#ccd6f6', marginBottom: 3 },
  sciInst: { fontSize: 9, color: '#00ccff', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6, opacity: 0.6 },
  sciField: { fontSize: 11, color: '#3a5070', lineHeight: '1.6', marginBottom: 10 },
  sciContact: { fontSize: 9, color: '#00ccff', letterSpacing: '1px', textTransform: 'uppercase' },
  journalGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 },
  journalCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 18px', background: 'rgba(6,10,28,0.6)',
    border: '1px solid rgba(0,204,255,0.07)', borderRadius: 10,
    textDecoration: 'none',
  },
  journalName: { fontSize: 11, color: '#8892b0', fontWeight: 'bold', lineHeight: 1.3 },
  journalIf: { fontSize: 9, color: '#00ccff', letterSpacing: '1px', textTransform: 'uppercase', flexShrink: 0, marginLeft: 8, opacity: 0.55 },
  linkCatGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 },
  linkCat: { padding: '24px 0 0' },
  linkCatTitle: { fontSize: 10, fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 16 },
  linkItem: {
    display: 'flex', alignItems: 'flex-start', padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    fontSize: 11, color: '#4a6080', textDecoration: 'none', lineHeight: '1.5',
    fontFamily: "'SF Mono','Fira Code',monospace",
  },
  pathwayList: { display: 'flex', flexDirection: 'column', gap: 16 },
  pathwayCard: {
    display: 'flex', gap: 40, alignItems: 'flex-start',
    padding: '28px 32px', background: 'rgba(6,10,28,0.6)',
    border: '1px solid rgba(255,255,255,0.03)', borderRadius: 12,
  },
  pathwayLeft: { flexShrink: 0, width: 140 },
  pathwayStep: { fontSize: 36, fontWeight: 900, opacity: 0.2, letterSpacing: '-2px', lineHeight: 1, marginBottom: 6 },
  pathwayTitle: { fontSize: 14, fontWeight: 'bold', color: '#ccd6f6', marginBottom: 4 },
  pathwayTime: { fontSize: 10, color: '#2a3a50', letterSpacing: '1.5px', textTransform: 'uppercase' },
  pathwayRight: { flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' },
  pathwayResource: { display: 'flex', alignItems: 'flex-start', fontSize: 12, color: '#4a6080', lineHeight: '1.5' },
  footer: { padding: '48px 40px', textAlign: 'center', borderTop: '1px solid rgba(0,204,255,0.06)' },
  footerBrand: { fontSize: 11, letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(0,204,255,0.3)', marginBottom: 14 },
  footerDisc: { fontSize: 11, color: '#1a2840', fontStyle: 'italic', lineHeight: '1.7', marginBottom: 12, maxWidth: 700, margin: '0 auto 12px' },
  footerCopy: { fontSize: 10, color: '#1a2535', letterSpacing: '1px' },
}

export default function ResearchModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const overview = [
    { color: '#00ccff', num: '01', title: 'Biological Neural Networks', desc: 'In biological terms, the male neural network refers to brain circuits that govern innate male-specific behaviours — mating, mate-searching, aggression, and reward. These are physically "wired" during development by hormonal and genetic signals.' },
    { color: '#7c4dff', num: '02', title: 'Artificial Neural Networks', desc: 'In AI, male neural networks are computational models trained on male-specific data — brain MRI scans, physiological signals, or behavioural datasets — to classify, predict, or simulate male-specific patterns with high accuracy.' },
    { color: '#00e676', num: '03', title: 'Structural Connectome', desc: 'The human connectome reveals male brains are optimised for intra-hemispheric communication — stronger front-to-back wiring within each hemisphere, supporting coordination between perception and action, alongside greater white matter density.' },
    { color: '#ff3366', num: '04', title: 'Sex-Specific Neurons', desc: 'In model organisms like C. elegans, roughly 25% of the male neural network consists of male-specific neurons, versus only ~1.6% in hermaphrodites. This demonstrates that sex-specific circuitry is a fundamental principle of neural organisation.' },
  ]

  const circuits = [
    { color: '#00ccff', region: 'BNST / POA Circuit', full: 'Bed Nucleus of the Stria Terminalis & Preoptic Area', fn: 'Sexual Behaviour & Mate-Seeking', desc: 'A multisynaptic pathway connects pheromone sensory inputs to BNST and POA neurons in the hypothalamus. This circuit triggers dopamine release, making mate-seeking behaviours inherently rewarding for the male. It is "developmentally wired" — fixed by hormonal exposure during a critical window.' },
    { color: '#7c4dff', region: 'VMHvl Circuit', full: 'Ventrolateral Ventromedial Hypothalamus', fn: 'Aggression & Territorial Behaviour', desc: 'The VMHvl controls reactive male–male attacks in mammals. Optogenetic stimulation of this region can trigger or suppress aggressive episodes. It integrates sensory threat cues with hormonal state (testosterone) to calibrate response intensity.' },
    { color: '#00e676', region: 'Mesolimbic Dopamine', full: 'VTA → Nucleus Accumbens → Prefrontal Cortex', fn: 'Reward, Motivation & Drive', desc: 'Testosterone potentiates dopamine release in the nucleus accumbens, amplifying reward-seeking and competitive motivation. Males show higher baseline dopamine turnover in striatal regions, linked to goal-directed behaviour and drive.' },
    { color: '#ff3366', region: 'Amygdala (Right)', full: 'Lateral & Basolateral Amygdala', fn: 'Emotional Memory & Threat Processing', desc: 'Males show preferential right-hemisphere amygdala activation during emotional memory encoding, with stronger connectivity to motor and action circuits — encoding emotional experience as action-oriented memory rather than internal/verbal memory.' },
    { color: '#64ffda', region: 'Hypothalamus INAH-3', full: 'Interstitial Nuclei of the Anterior Hypothalamus', fn: 'Sexual Orientation & Endocrine Control', desc: 'INAH-3 is 2–3× larger in males than females. This region integrates hormonal signals and governs gonadotropin release, sex drive, and certain aspects of sexual orientation. Differences are established during prenatal testosterone exposure.' },
    { color: '#ffab40', region: 'Cerebellum', full: 'Cerebellar Cortex & Deep Nuclei', fn: 'Motor Coordination & Spatial Processing', desc: 'Males consistently show higher metabolic activity and larger cerebellar volumes relative to other structures. The cerebellum contributes to fine motor control, spatial navigation, and — increasingly — to cognitive processing and emotional regulation.' },
  ]

  const hotspots = [
    { label: 'Amygdala',    value: 'Larger volume in males; linked to emotional memory, threat detection, and social aggression processing.' },
    { label: 'Striatum',    value: 'Higher volume in males; core reward and habit-learning structure, heavily modulated by testosterone.' },
    { label: 'Cerebellum',  value: 'Higher metabolic activity and volume; motor coordination, spatial cognition, and emerging cognitive roles.' },
    { label: 'INAH-3',      value: '2–3× larger in males; hypothalamic nucleus governing sex drive and gonadotropin release.' },
    { label: 'IPL',         value: 'Inferior parietal lobule — proportionally larger in males; linked to spatial task performance and speed judgement.' },
    { label: 'White Matter', value: 'Males have a higher percentage of myelinated axons (white matter) supporting long-distance intra-hemispheric signalling.' },
  ]

  const aiSteps = [
    { num: '01', color: '#00ccff', title: 'Data Collection', desc: 'Gather thousands of 3D fMRI or structural MRI scans from open databases such as the Human Connectome Project, OpenNeuro, or ABIDE. A typical training set requires 5,000–20,000 scans.' },
    { num: '02', color: '#7c4dff', title: 'Architecture: 3D CNN', desc: 'Unlike standard 2D CNNs, a 3D Convolutional Neural Network extracts spatial features across the entire brain volume simultaneously — capturing inter-regional connectivity patterns invisible in 2D slices.' },
    { num: '03', color: '#00e676', title: 'Feature Extraction', desc: 'The model identifies hotspots in the striatum and limbic network (reward systems), the default mode network (self-referential thought), and cerebellar–cortical connectivity patterns.' },
    { num: '04', color: '#ff3366', title: 'Training & Accuracy', desc: 'The network is trained on labelled brain scans. Modern 3D CNN architectures achieve 94–98% sex-classification accuracy, detecting subtle structural patterns that are invisible to the human eye.' },
    { num: '05', color: '#64ffda', title: 'Facial Classification', desc: 'For facial-based models, 2D CNNs (ResNet-50, VGG16) trained on datasets like CelebA analyse jawline, brow, and nose geometry. These typically achieve 90–95% accuracy at biological sex classification.' },
    { num: '06', color: '#ffab40', title: 'RAG Memory Architecture', desc: 'For personalised AI models, Retrieval-Augmented Generation (RAG) stores past user interactions as vectors in Pinecone or Weaviate. Before each response, the model retrieves relevant past context — enabling genuine longitudinal "understanding" of the individual.' },
  ]

  const databases = [
    { color: '#00ccff', name: 'Human Connectome Project', abbr: 'HCP', desc: 'The gold standard for human brain connectivity data. Over 1,200 subjects with high-resolution structural and functional MRI, diffusion imaging, and behavioural measures.', url: 'https://www.humanconnectome.org' },
    { color: '#7c4dff', name: 'PubMed / NCBI',           abbr: 'NIH', desc: 'The primary index of biomedical literature. Over 36 million citations. Essential for locating primary research on male neuroscience, sex differences, and brain structure.', url: 'https://pubmed.ncbi.nlm.nih.gov' },
    { color: '#00e676', name: 'OpenNeuro',                abbr: 'BIDS', desc: 'Free, open platform for neuroimaging data sharing. Thousands of MRI, MEG, and EEG datasets available in BIDS format, ready for computational analysis.', url: 'https://openneuro.org' },
    { color: '#ff3366', name: 'Allen Brain Atlas',        abbr: 'ABA', desc: 'Comprehensive gene expression and neuroanatomy atlas of the human and mouse brain. Critical for understanding molecular sex differences across brain regions.', url: 'https://brain-map.org' },
    { color: '#64ffda', name: 'PMC Full-Text Archive',    abbr: 'PMC', desc: 'Over 9 million full-text biomedical and life science articles available free of charge. The most comprehensive open-access archive for neuroscience papers.', url: 'https://pmc.ncbi.nlm.nih.gov' },
    { color: '#ffab40', name: 'Kaggle Neuroscience',      abbr: 'ML',  desc: 'Open machine-learning datasets including Mental Health in Tech Survey, Men\'s Health Statistics, and EEG signals datasets — ideal for building and benchmarking predictive models.', url: 'https://www.kaggle.com' },
  ]

  const scientists = [
    { name: 'Larry Cahill',       inst: 'UC Irvine',           field: 'Sex differences in memory & emotion',            contact: 'https://www.faculty.uci.edu/profile.cfm?faculty_id=2263' },
    { name: 'Margaret McCarthy',  inst: 'Univ. of Maryland',   field: 'Sex differences in brain development',           contact: 'https://www.medschool.umaryland.edu/profiles/McCarthy-Margaret/' },
    { name: 'Simon Baron-Cohen',  inst: 'Cambridge University', field: 'Male brain theory, empathizing-systemizing',    contact: 'https://www.autismresearchcentre.com' },
    { name: 'Raquel Gur',         inst: 'Univ. of Pennsylvania', field: 'Brain imaging & cognitive sex differences',    contact: 'https://www.med.upenn.edu/apps/faculty/index.php/g275/p15780' },
    { name: 'Nirao Shah',         inst: 'Stanford University',  field: 'Sex-specific neural circuits & behaviour',      contact: 'https://shahlab.stanford.edu' },
    { name: 'Geert De Vries',     inst: 'Georgia State Univ.', field: 'Sexual dimorphism in the mammalian brain',       contact: 'https://neuroscience.gsu.edu/profile/geert-de-vries/' },
    { name: 'David Amaral',       inst: 'UC Davis',             field: 'Amygdala, social behaviour & autism',           contact: 'https://health.ucdavis.edu/mindinstitute/research/amaral/' },
    { name: 'Debra Bangasser',    inst: 'Temple University',    field: 'Sex differences in stress & CRF circuits',      contact: 'https://www.cla.temple.edu/psychology/faculty/debra-bangasser/' },
  ]

  const journals = [
    { name: 'Nature Neuroscience',        if: '28.8', url: 'https://www.nature.com/neuro' },
    { name: 'Nature Reviews Neuroscience', if: '38.8', url: 'https://www.nature.com/nrn' },
    { name: 'PNAS',                        if: '11.1', url: 'https://www.pnas.org' },
    { name: 'eLife',                       if: '7.7',  url: 'https://elifesciences.org' },
    { name: 'Journal of Neuroscience',     if: '5.3',  url: 'https://www.jneurosci.org' },
    { name: 'Cerebral Cortex',             if: '4.9',  url: 'https://academic.oup.com/cercor' },
    { name: 'Hormones and Behavior',       if: '3.8',  url: 'https://www.journals.elsevier.com/hormones-and-behavior' },
    { name: 'Frontiers in Neuroscience',   if: '4.3',  url: 'https://www.frontiersin.org/journals/neuroscience' },
    { name: 'NeuroImage',                  if: '7.4',  url: 'https://www.sciencedirect.com/journal/neuroimage' },
    { name: 'Science',                     if: '56.9', url: 'https://www.science.org' },
    { name: 'Cell',                        if: '64.5', url: 'https://www.cell.com' },
    { name: 'Scientific American',         if: 'N/A',  url: 'https://www.scientificamerican.com' },
  ]

  const extLinks = [
    { cat: 'Primary Research',   color: '#00ccff', links: [
      { label: 'eLife Sciences',                url: 'https://elifesciences.org' },
      { label: 'PubMed (NIH)',                  url: 'https://pubmed.ncbi.nlm.nih.gov' },
      { label: 'PMC Full-Text Archive',         url: 'https://pmc.ncbi.nlm.nih.gov' },
      { label: 'PNAS',                          url: 'https://www.pnas.org' },
      { label: 'Science.org',                   url: 'https://www.science.org' },
      { label: 'Cell Press',                    url: 'https://www.cell.com' },
      { label: 'ScienceDirect',                 url: 'https://www.sciencedirect.com' },
      { label: 'ResearchGate',                  url: 'https://www.researchgate.net' },
    ]},
    { cat: 'Medical & Clinical',  color: '#7c4dff', links: [
      { label: 'Stanford Medicine',             url: 'https://med.stanford.edu' },
      { label: 'Stanford Medicine Magazine',    url: 'https://stanmed.stanford.edu' },
      { label: 'Endeavor Health',               url: 'https://www.endeavorhealth.org' },
      { label: 'Bentham Open Archives',         url: 'https://benthamopenarchives.com' },
      { label: 'Springer Link',                 url: 'https://link.springer.com' },
      { label: 'MDPI Open Access',              url: 'https://www.mdpi.com' },
    ]},
    { cat: 'AI & Technology',     color: '#00e676', links: [
      { label: 'Frontiers in Neuroscience (AI)', url: 'https://www.frontiersin.org' },
      { label: 'MDPI — Neuro AI Papers',         url: 'https://www.mdpi.com' },
      { label: 'Tech With Shadab (Medium)',       url: 'https://techwithshadab.medium.com' },
      { label: 'Medium — Neuroscience & AI',     url: 'https://medium.com' },
      { label: 'Spring.io — Spring AI Docs',     url: 'https://spring.io' },
    ]},
    { cat: 'General Education',   color: '#ff3366', links: [
      { label: 'Brain Facts (Society for Neuroscience)', url: 'https://www.brainfacts.org' },
      { label: 'Scientific American — Brain',   url: 'https://www.scientificamerican.com' },
      { label: 'Down to Earth — Science',       url: 'https://www.downtoearth.org.in' },
    ]},
  ]

  const pathway = [
    { step: '01', color: '#00ccff', title: 'Foundations',    time: '4–8 weeks', resources: ['Neuroscience by Purves et al. (Sinauer)', 'Khan Academy — Nervous System', 'MIT OpenCourseWare 9.01 Neuroscience' ] },
    { step: '02', color: '#7c4dff', title: 'Sex Differences', time: '4–6 weeks', resources: ['Cahill (2006) — Nature Reviews Neuroscience', 'Ingalhalikar (2014) — PNAS', 'McCarthy & Arnold (2011) — Science'] },
    { step: '03', color: '#00e676', title: 'Primary Literature', time: 'Ongoing', resources: ['Journal of Neuroscience (weekly)', 'Hormones and Behavior', 'eLife Neuroscience section'] },
    { step: '04', color: '#ff3366', title: 'Computational Methods', time: '6–10 weeks', resources: ['fast.ai Practical Deep Learning', 'Kaggle — Brain MRI datasets', 'arXiv cs.LG — NeuroAI papers'] },
    { step: '05', color: '#64ffda', title: 'Applied Projects', time: 'Ongoing', resources: ['Human Connectome Project — HCP500', 'OpenNeuro — BIDS datasets', 'Spring AI + React Three Fiber (this platform)'] },
  ]

  return (
    <div style={res.page}>
      <div style={res.topBar}>
        <div style={res.topBrand}>MALE NEURO NETWORK &nbsp;·&nbsp; RESEARCH HUB</div>
        <button style={res.closeBtn} onClick={onClose}>← Back to App</button>
      </div>

      <div style={res.scroll}>

        {/* ── HERO ── */}
        <section style={res.hero}>
          <MaleWatermark />
          <div style={res.heroBadge}>Neuroscience Research &amp; Education</div>
          <h1 style={res.heroTitle}>Research Hub</h1>
          <p style={res.heroSub}>Male Neural Networks — Biology, Circuitry &amp; Artificial Intelligence</p>
          <div style={res.heroLine} />
          <p style={res.heroDesc}>
            A comprehensive reference for understanding the male neural network across biological,
            computational, and clinical dimensions. Includes key circuits, primary literature,
            AI methodologies, open databases, and direct links to researchers and journals.
          </p>
          <div style={res.heroStats}>
            {[['25%','Male-specific neurons in C. elegans'],['94–98%','AI sex-classification accuracy'],['2–3×','INAH-3 size difference in males'],['3D CNN','State-of-the-art model architecture']].map(([v, l]) => (
              <div key={v} style={res.heroStat}>
                <div style={res.heroStatVal}>{v}</div>
                <div style={res.heroStatLab}>{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── OVERVIEW ── */}
        <section style={res.section}>
          <div style={res.inner}>
            <div style={res.label}>What Is It</div>
            <h2 style={res.heading}>Understanding the Male Neural Network</h2>
            <div style={res.grid4}>
              {overview.map(o => (
                <div key={o.num} style={{ ...res.card4, borderTop: `3px solid ${o.color}` }}>
                  <div style={{ ...res.cardNum, color: o.color }}>{o.num}</div>
                  <div style={res.cardTitle}>{o.title}</div>
                  <p style={res.cardDesc}>{o.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── KEY CIRCUITS ── */}
        <section style={{ ...res.section, background: 'rgba(0,204,255,0.015)' }}>
          <div style={res.inner}>
            <div style={res.label}>Neural Architecture</div>
            <h2 style={res.heading}>Male-Specific Brain Circuits</h2>
            <div style={res.grid2}>
              {circuits.map(c => (
                <div key={c.region} style={{ ...res.circuitCard, borderLeft: `3px solid ${c.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ ...res.circuitRegion, color: c.color }}>{c.region}</div>
                    <div style={res.circuitFn}>{c.fn}</div>
                  </div>
                  <div style={res.circuitFull}>{c.full}</div>
                  <p style={res.circuitDesc}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ANATOMICAL HOTSPOTS ── */}
        <section style={res.section}>
          <div style={res.inner}>
            <div style={res.label}>Structural Differences</div>
            <h2 style={res.heading}>Anatomical Hotspots in the Male Brain</h2>
            <p style={{ ...res.bodyText, maxWidth: 700, marginBottom: 32 }}>
              When adjusted for total brain volume, specific regions show consistent volumetric
              and metabolic differences in males across large population studies.
            </p>
            <div style={res.hotspotGrid}>
              {hotspots.map(h => (
                <div key={h.label} style={res.hotspotRow}>
                  <div style={res.hotspotDot} />
                  <div style={res.hotspotLabel}>{h.label}</div>
                  <div style={res.hotspotVal}>{h.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI MODELS ── */}
        <section style={{ ...res.section, background: 'rgba(124,77,255,0.015)' }}>
          <div style={res.inner}>
            <div style={res.label}>Computational Neuroscience</div>
            <h2 style={res.heading}>Building AI Models for Male Neural Patterns</h2>
            <div style={res.grid3}>
              {aiSteps.map(s => (
                <div key={s.num} style={{ ...res.aiCard, borderTop: `3px solid ${s.color}` }}>
                  <div style={{ ...res.aiNum, color: s.color }}>{s.num}</div>
                  <div style={res.aiTitle}>{s.title}</div>
                  <p style={res.aiDesc}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DATABASES ── */}
        <section style={res.section}>
          <div style={res.inner}>
            <div style={res.label}>Open Data Resources</div>
            <h2 style={res.heading}>Research Databases &amp; Datasets</h2>
            <div style={res.grid3}>
              {databases.map(d => (
                <a key={d.name} href={d.url} target="_blank" rel="noopener noreferrer" style={{ ...res.dbCard, borderTop: `3px solid ${d.color}`, textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ ...res.dbName, color: d.color }}>{d.name}</div>
                    <div style={{ ...res.dbAbbr, borderColor: d.color, color: d.color }}>{d.abbr}</div>
                  </div>
                  <p style={res.dbDesc}>{d.desc}</p>
                  <div style={{ ...res.dbLink, color: d.color }}>Visit Database →</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCIENTISTS ── */}
        <section style={{ ...res.section, background: 'rgba(0,204,255,0.015)' }}>
          <div style={res.inner}>
            <div style={res.label}>Key Researchers</div>
            <h2 style={res.heading}>Scientists &amp; Contacts</h2>
            <div style={res.sciGrid}>
              {scientists.map(s => (
                <a key={s.name} href={s.contact} target="_blank" rel="noopener noreferrer" style={res.sciCard}>
                  <div style={res.sciAvatar}>{s.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
                  <div style={res.sciInfo}>
                    <div style={res.sciName}>{s.name}</div>
                    <div style={res.sciInst}>{s.inst}</div>
                    <div style={res.sciField}>{s.field}</div>
                    <div style={res.sciContact}>Profile &amp; Contact →</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── JOURNALS ── */}
        <section style={res.section}>
          <div style={res.inner}>
            <div style={res.label}>Academic Publishing</div>
            <h2 style={res.heading}>Key Journals &amp; Publications</h2>
            <div style={res.journalGrid}>
              {journals.map(j => (
                <a key={j.name} href={j.url} target="_blank" rel="noopener noreferrer" style={res.journalCard}>
                  <div style={res.journalName}>{j.name}</div>
                  <div style={res.journalIf}>IF {j.if}</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── EXTERNAL LINKS ── */}
        <section style={{ ...res.section, background: 'rgba(0,204,255,0.015)' }}>
          <div style={res.inner}>
            <div style={res.label}>External Resources</div>
            <h2 style={res.heading}>Reference Links by Category</h2>
            <div style={res.linkCatGrid}>
              {extLinks.map(cat => (
                <div key={cat.cat} style={{ ...res.linkCat, borderTop: `3px solid ${cat.color}` }}>
                  <div style={{ ...res.linkCatTitle, color: cat.color }}>{cat.cat}</div>
                  {cat.links.map(l => (
                    <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={res.linkItem}>
                      <span style={{ color: cat.color, marginRight: 8 }}>→</span>{l.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LEARNING PATHWAY ── */}
        <section style={res.section}>
          <div style={res.inner}>
            <div style={res.label}>Structured Learning</div>
            <h2 style={res.heading}>How to Study Male Neuroscience</h2>
            <div style={res.pathwayList}>
              {pathway.map(p => (
                <div key={p.step} style={{ ...res.pathwayCard, borderLeft: `3px solid ${p.color}` }}>
                  <div style={res.pathwayLeft}>
                    <div style={{ ...res.pathwayStep, color: p.color }}>{p.step}</div>
                    <div style={res.pathwayTitle}>{p.title}</div>
                    <div style={res.pathwayTime}>{p.time}</div>
                  </div>
                  <div style={res.pathwayRight}>
                    {p.resources.map(r => (
                      <div key={r} style={res.pathwayResource}>
                        <span style={{ color: p.color, marginRight: 8, flexShrink: 0 }}>·</span>{r}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={res.footer}>
          <div style={res.footerBrand}>MALE NEURO NETWORK — RESEARCH HUB</div>
          <div style={res.footerDisc}>
            All external links lead to third-party websites. Content accuracy is the responsibility of the respective publishers.
            Research findings represent population-level statistics; individual variation is substantial.
            This platform is for educational purposes and does not constitute medical advice.
          </div>
          <div style={res.footerCopy}>© {new Date().getFullYear()} Gauri Langote. All rights reserved.</div>
        </footer>

      </div>
    </div>
  )
}
