package com.maleneuro.config;

public final class ExternalApis {

    private ExternalApis() {}

    public static final class Groq {
        public static final String CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
        public static final String DEFAULT_MODEL = "llama-3.3-70b-versatile";
        private Groq() {}
    }

    public static final class Resend {
        public static final String EMAILS_URL = "https://api.resend.com/emails";
        private Resend() {}
    }

    public static final class ElevenLabs {
        public static final String BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech/";
        // Adam — professional male voice on the free tier
        public static final String DEFAULT_VOICE_ID = "TUlcnUIOBqEFnmlLvlAL";
        public static final String DEFAULT_MODEL = "eleven_turbo_v2";
        public static final String AUDIO_MIME = "audio/mpeg";

        public static String ttsUrl(String voiceId) {
            return BASE_URL + voiceId;
        }

        private ElevenLabs() {}
    }
}
