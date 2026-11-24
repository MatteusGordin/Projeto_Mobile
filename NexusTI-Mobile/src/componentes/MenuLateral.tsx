import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BadgeStatus from './BadgeStatus';
import BotaoPadrao from './BotaoPadrao';
import ModalPerfil from './ModalPerfil';
import { apagarPerfil, apagarToken, lerPerfil } from '../auth/session';
import { CORES, ESPACAMENTO, RAIO } from '../tema/cores';
import type { PerfilResposta } from '../types/models';

type RotaMenu =
  | '/painel'
  | '/chamados'
  | '/novo-chamado'
  | '/admin/usuarios'
  | '/admin/equipamentos'
  | '/admin/setores'
  | '/admin/prioridades';

interface MenuContexto {
  aberto: boolean;
  abrir: () => void;
  fechar: () => void;
}

interface ItemMenu {
  rota: RotaMenu;
  rotulo: string;
  icone: keyof typeof Ionicons.glyphMap;
}

const ContextoMenu = createContext<MenuContexto | null>(null);

const ITENS_OPERACIONAIS: ItemMenu[] = [
  { rota: '/painel', rotulo: 'Painel Geral', icone: 'grid-outline' },
  { rota: '/chamados', rotulo: 'Chamados', icone: 'list-outline' },
  { rota: '/novo-chamado', rotulo: 'Novo Chamado', icone: 'add-circle-outline' },
];

const ITENS_ADMIN: ItemMenu[] = [
  { rota: '/admin/usuarios', rotulo: 'Usuários', icone: 'people-outline' },
  { rota: '/admin/equipamentos', rotulo: 'Equipamentos', icone: 'hardware-chip-outline' },
  { rota: '/admin/setores', rotulo: 'Setores', icone: 'business-outline' },
  { rota: '/admin/prioridades', rotulo: 'Prioridades', icone: 'flag-outline' },
];

const LARGURA_MENU = 300;

export function MenuProvider({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState<boolean>(false);
  const abrir = useCallback(() => setAberto(true), []);
  const fechar = useCallback(() => setAberto(false), []);
  const valor = useMemo<MenuContexto>(() => ({ aberto, abrir, fechar }), [aberto, abrir, fechar]);
  return <ContextoMenu.Provider value={valor}>{children}</ContextoMenu.Provider>;
}

export function useMenu(): MenuContexto {
  const contexto = useContext(ContextoMenu);
  if (contexto === null) {
    throw new Error('useMenu precisa ser usado dentro de MenuProvider');
  }
  return contexto;
}

export default function MenuLateral() {
  const { aberto, fechar } = useMenu();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [perfil, setPerfil] = useState<PerfilResposta | null>(null);
  const [perfilAberto, setPerfilAberto] = useState<boolean>(false);
  const deslocamento = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (aberto === false) {
      return;
    }
    let ativo = true;
    const atualizarPerfil = async (): Promise<void> => {
      try {
        const salvo = await lerPerfil();
        if (ativo === true) {
          setPerfil(salvo);
        }
      } catch (falha) {
        if (ativo === true) {
          setPerfil(null);
        }
      }
    };
    void atualizarPerfil();
    return () => {
      ativo = false;
    };
  }, [aberto, pathname]);

  useEffect(() => {
    Animated.timing(deslocamento, {
      toValue: aberto === true ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [aberto, deslocamento]);

  const irPara = (destino: RotaMenu): void => {
    if (pathname === destino) {
      fechar();
      return;
    }
    if (destino === '/novo-chamado') {
      router.push('/novo-chamado');
    } else {
      router.replace(destino);
    }
    fechar();
  };

  const sair = async (): Promise<void> => {
    await apagarToken();
    await apagarPerfil();
    fechar();
    router.replace('/');
  };

  const confirmarSaida = (): void => {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => void sair() },
    ]);
  };

  const ehEquipe = perfil !== null && (perfil.perfil === 'ADMIN' || perfil.perfil === 'TECNICO');
  const traduzir = (item: ItemMenu): ReactNode => (
    <Pressable
      key={item.rota}
      style={[estilos.item, pathname === item.rota ? estilos.itemAtivo : null]}
      onPress={() => irPara(item.rota)}
      accessibilityRole="button"
      accessibilityLabel={item.rotulo}
    >
      <View style={[estilos.indicador, pathname === item.rota ? estilos.indicadorAtivo : null]} />
      <Ionicons
        name={item.icone}
        size={20}
        color={pathname === item.rota ? CORES.primario : CORES.textoSecundario}
      />
      <Text style={[estilos.textoItem, pathname === item.rota ? estilos.textoItemAtivo : null]}>
        {item.rotulo}
      </Text>
    </Pressable>
  );

  const translateX = deslocamento.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -LARGURA_MENU],
  });

  return (
    <>
      <Modal
        visible={aberto}
        transparent
        animationType="fade"
        onRequestClose={fechar}
        statusBarTranslucent
      >
        <View style={estilos.raiz}>
          <Pressable style={estilos.fundo} onPress={fechar} accessibilityLabel="Fechar menu" />
          <Animated.View style={[estilos.painel, { width: LARGURA_MENU, transform: [{ translateX }] }]}>
            <View
              style={[
                estilos.conteudo,
                { paddingTop: insets.top + ESPACAMENTO.md, paddingBottom: insets.bottom + ESPACAMENTO.md },
              ]}
            >
              <View style={estilos.cabecalho}>
                <View style={estilos.marca}>
                  <View style={estilos.logo}>
                    <Ionicons name="sparkles-outline" size={22} color={CORES.primario} />
                  </View>
                  <View style={estilos.identidade}>
                    <Text style={estilos.nomeApp}>Nexus TI</Text>
                    <Text style={estilos.subtituloApp}>HelpDesk Municipal</Text>
                  </View>
                </View>
                <Pressable
                  style={estilos.fechar}
                  onPress={fechar}
                  accessibilityRole="button"
                  accessibilityLabel="Fechar menu"
                >
                  <Ionicons name="close" size={20} color={CORES.textoSecundario} />
                </Pressable>
              </View>
              <View style={estilos.usuario}>
                <Text style={estilos.nomeUsuario} numberOfLines={1}>
                  {perfil !== null && perfil.nome !== '' ? perfil.nome : 'Usuário'}
                </Text>
                <Text style={estilos.emailUsuario} numberOfLines={1}>
                  {perfil !== null && perfil.email !== '' ? perfil.email : 'Não informado'}
                </Text>
                {perfil !== null ? <BadgeStatus tipo="perfil" valor={perfil.perfil} /> : null}
              </View>
              <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
                <Text style={estilos.tituloSecao}>Operacional</Text>
                {ITENS_OPERACIONAIS.map(traduzir)}
                {ehEquipe === true ? (
                  <>
                    <View style={estilos.separador} />
                    <Text style={estilos.tituloSecao}>Administração</Text>
                    {perfil !== null && perfil.perfil === 'ADMIN' ? traduzir(ITENS_ADMIN[0]) : null}
                    {ITENS_ADMIN.slice(1).map(traduzir)}
                  </>
                ) : null}
              </ScrollView>
              <View style={estilos.rodape}>
                <BotaoPadrao
                  titulo="Meu Perfil"
                  aoPressionar={() => setPerfilAberto(true)}
                  icone="person-outline"
                  variante="fantasma"
                  tamanho="compacto"
                />
                <BotaoPadrao
                  titulo="Sair"
                  aoPressionar={confirmarSaida}
                  icone="log-out-outline"
                  variante="perigo"
                  tamanho="compacto"
                />
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
      <ModalPerfil
        visivel={perfilAberto}
        perfil={perfil}
        aoFechar={() => setPerfilAberto(false)}
        aoSair={() => void sair()}
      />
    </>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, flexDirection: 'row' },
  fundo: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)' },
  painel: {
    height: '100%',
    borderRightWidth: 1,
    borderColor: CORES.borda,
    backgroundColor: CORES.fundo,
  },
  conteudo: { flex: 1, paddingHorizontal: ESPACAMENTO.lg },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marca: { flexDirection: 'row', alignItems: 'center', gap: ESPACAMENTO.sm },
  logo: {
    width: 40,
    height: 40,
    borderRadius: RAIO.medio,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CORES.superficie,
  },
  identidade: { gap: 2 },
  nomeApp: { fontSize: 17, fontWeight: 'bold', color: CORES.texto },
  subtituloApp: { fontSize: 11, color: CORES.textoSecundario },
  fechar: { padding: ESPACAMENTO.xs },
  usuario: {
    gap: ESPACAMENTO.xs,
    alignItems: 'flex-start',
    padding: ESPACAMENTO.md,
    marginTop: ESPACAMENTO.lg,
    borderRadius: RAIO.medio,
    borderWidth: 1,
    borderColor: CORES.borda,
    backgroundColor: CORES.superficie,
  },
  nomeUsuario: { fontSize: 14, fontWeight: 'bold', color: CORES.texto },
  emailUsuario: { fontSize: 12, color: CORES.textoSecundario },
  rolagem: { paddingTop: ESPACAMENTO.lg, paddingBottom: ESPACAMENTO.md },
  tituloSecao: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: CORES.textoSecundario,
    marginBottom: ESPACAMENTO.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACAMENTO.md,
    minHeight: 48,
    paddingHorizontal: ESPACAMENTO.md,
    borderRadius: RAIO.medio,
    marginBottom: ESPACAMENTO.xs,
  },
  itemAtivo: { backgroundColor: '#3B82F620' },
  indicador: { width: 3, height: 20, borderRadius: 2, backgroundColor: 'transparent' },
  indicadorAtivo: { backgroundColor: CORES.primario },
  textoItem: { flex: 1, fontSize: 14, color: CORES.textoSecundario },
  textoItemAtivo: { color: CORES.texto, fontWeight: '600' },
  separador: { height: 1, backgroundColor: CORES.borda, marginVertical: ESPACAMENTO.md },
  rodape: {
    gap: ESPACAMENTO.xs,
    paddingTop: ESPACAMENTO.md,
    borderTopWidth: 1,
    borderTopColor: CORES.borda,
  },
});
