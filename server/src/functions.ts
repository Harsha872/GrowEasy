import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { createApp } from './app';

const groqApiKey = defineSecret('GROQ_API_KEY');

export const api = onRequest(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 300,
    secrets: [groqApiKey],
  },
  createApp()
);
