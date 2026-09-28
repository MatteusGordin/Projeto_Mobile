import axios from 'axios';
import { apagarToken, lerToken } from '../auth/session';

const PROTOCOLO = 'https:';
const BARRA = '/';
const HOSPEDEIRO = 'nexusti-api.squareweb.app';
const ROTA_BASE = '/api';
const FALLBACK = PROTOCOLO + BARRA + BARRA + HOSPEDEIRO + ROTA_BASE;
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? FALLBACK;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await lerToken();
  if (token !== null && token !== '') {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

api.interceptors.response.use(
  (resposta) => resposta,
  async (falha) => {
    const status = falha && falha.response ? falha.response.status : 0;
    const url = falha && falha.config && falha.config.url ? String(falha.config.url) : '';
    const rotaPublica = url.includes('/auth/login') || url.includes('/auth/bootstrap');
    if (status === 401 && rotaPublica === false) {
      await apagarToken();
    }
    return Promise.reject(falha);
  }
);

export default api;
