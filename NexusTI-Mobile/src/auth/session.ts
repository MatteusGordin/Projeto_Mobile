import * as SecureStore from 'expo-secure-store';

export const CHAVE_TOKEN = 'nexusti.token';

export async function salvarToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(CHAVE_TOKEN, token);
}

export async function lerToken(): Promise<string | null> {
  return SecureStore.getItemAsync(CHAVE_TOKEN);
}

export async function apagarToken(): Promise<void> {
  await SecureStore.deleteItemAsync(CHAVE_TOKEN);
}
