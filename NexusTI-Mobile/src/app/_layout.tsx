import { useEffect, useRef } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registrarSessaoExpirada } from '../api/client';
import { CORES } from '../tema/cores';

export default function RootLayout() {
  const router = useRouter();
  const caminho = usePathname();
  const caminhoAtual = useRef<string>(caminho);

  useEffect(() => {
    caminhoAtual.current = caminho;
  }, [caminho]);

  useEffect(() => {
    return registrarSessaoExpirada(() => {
      if (caminhoAtual.current !== '/') {
        router.replace('/');
      }
    });
  }, [router]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: CORES.fundo },
          headerTintColor: CORES.texto,
          headerTitleStyle: { color: CORES.texto, fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: CORES.fundo },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Login' }} />
        <Stack.Screen name="novo-chamado" options={{ title: 'Novo Chamado' }} />
        <Stack.Screen name="painel" options={{ title: 'Painel Tecnico' }} />
        <Stack.Screen name="chamados" options={{ title: 'Gerenciar Chamados' }} />
        <Stack.Screen name="detalhe" options={{ title: 'Detalhe Chamado' }} />
        <Stack.Screen name="admin/usuarios" options={{ title: 'Usuarios' }} />
        <Stack.Screen name="admin/equipamentos" options={{ title: 'Equipamentos' }} />
        <Stack.Screen name="admin/setores" options={{ title: 'Setores' }} />
        <Stack.Screen name="admin/prioridades" options={{ title: 'Prioridades' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
