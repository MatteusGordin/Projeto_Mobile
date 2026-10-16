import * as SecureStore from 'expo-secure-store';
import type { PerfilResposta } from '../types/models';

export const CHAVE_TOKEN = 'nexusti.token';
export const CHAVE_PERFIL = 'nexusti.perfil';

export async function salvarToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(CHAVE_TOKEN, token);
}

export async function lerToken(): Promise<string | null> {
  return SecureStore.getItemAsync(CHAVE_TOKEN);
}

export async function apagarToken(): Promise<void> {
  await SecureStore.deleteItemAsync(CHAVE_TOKEN);
}

export async function salvarPerfil(perfil: PerfilResposta): Promise<void> {
  const texto = JSON.stringify(perfil);
  await SecureStore.setItemAsync(CHAVE_PERFIL, texto);
}

export async function lerPerfil(): Promise<PerfilResposta | null> {
  const texto = await SecureStore.getItemAsync(CHAVE_PERFIL);
  if (texto === null || texto === '') {
    return null;
  }
  try {
    const valor = JSON.parse(texto) as PerfilResposta;
    if (valor !== null && typeof valor.id === 'number' && typeof valor.perfil === 'string') {
      return valor;
    }
    return null;
  } catch (falha) {
    if (falha instanceof Error) {
      return null;
    }
    return null;
  }
}

export async function apagarPerfil(): Promise<void> {
  await SecureStore.deleteItemAsync(CHAVE_PERFIL);
}
