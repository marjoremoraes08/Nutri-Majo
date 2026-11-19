import { createClient } from '@neon/neon-js';
import { BetterAuthReactAdapter } from '@neon/neon-js/auth/react/adapters';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL;

if (!authUrl) {
  throw new Error('Variável de ambiente VITE_NEON_AUTH_URL não configurada.');
}

if (!dataApiUrl) {
  throw new Error('Variável de ambiente VITE_NEON_DATA_API_URL não configurada.');
}

export const neon = createClient({
  auth: {
    url: authUrl,
    adapter: BetterAuthReactAdapter(),
  },
  dataApi: {
    url: dataApiUrl,
  },
});

