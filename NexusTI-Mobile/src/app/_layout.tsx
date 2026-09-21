import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Login' }} />
      <Stack.Screen name="novo-chamado" options={{ title: 'Novo Chamado' }} />
      <Stack.Screen name="painel" options={{ title: 'Painel Tecnico' }} />
    </Stack>
  );
}
