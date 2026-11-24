import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import BadgeStatus from './BadgeStatus';
import BotaoPadrao from './BotaoPadrao';
import { CORES, ESPACAMENTO, RAIO } from '../tema/cores';
import type { PerfilResposta } from '../types/models';

interface ModalPerfilProps {
  visivel: boolean;
  perfil: PerfilResposta | null;
  aoFechar: () => void;
  aoSair: () => void;
}

export default function ModalPerfil({ visivel, perfil, aoFechar, aoSair }: ModalPerfilProps) {
  const versao = Constants.expoConfig?.version ?? '1.0.0';
  const confirmarSaida = (): void => {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: aoSair },
    ]);
  };
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar}>
      <Pressable style={estilos.fundo} onPress={aoFechar}>
        <Pressable style={estilos.cartao} onPress={() => undefined} accessibilityLabel="Perfil do usuário">
          <ScrollView contentContainerStyle={estilos.conteudo}>
            <View style={estilos.cabecalho}>
              <View style={estilos.icone}>
                <Ionicons name="person-circle-outline" size={44} color={CORES.primario} />
              </View>
              <Pressable
                style={estilos.fechar}
                onPress={aoFechar}
                accessibilityRole="button"
                accessibilityLabel="Fechar perfil"
              >
                <Ionicons name="close" size={20} color={CORES.texto} />
              </Pressable>
            </View>
            <Text style={estilos.titulo}>Perfil do usuário</Text>
            <View style={estilos.campo}>
              <Text style={estilos.rotulo}>Nome</Text>
              <Text style={estilos.valor}>{perfil !== null && perfil.nome !== '' ? perfil.nome : 'Não informado'}</Text>
            </View>
            <View style={estilos.campo}>
              <Text style={estilos.rotulo}>E-mail</Text>
              <Text style={estilos.valor}>{perfil !== null && perfil.email !== '' ? perfil.email : 'Não informado'}</Text>
            </View>
            <View style={estilos.campo}>
              <Text style={estilos.rotulo}>Perfil de acesso</Text>
              {perfil !== null ? <BadgeStatus tipo="perfil" valor={perfil.perfil} /> : <Text style={estilos.valor}>Não informado</Text>}
            </View>
            <View style={estilos.campo}>
              <Text style={estilos.rotulo}>Versão do aplicativo</Text>
              <Text style={estilos.valor}>{versao}</Text>
            </View>
            <BotaoPadrao titulo="Sair" aoPressionar={confirmarSaida} variante="perigo" icone="log-out-outline" />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: ESPACAMENTO.xl,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  cartao: {
    maxHeight: '85%',
    borderRadius: RAIO.grande,
    borderWidth: 1,
    borderColor: CORES.borda,
    backgroundColor: CORES.superficie,
  },
  conteudo: {
    padding: ESPACAMENTO.xl,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icone: {
    width: 64,
    height: 64,
    borderRadius: RAIO.circular,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CORES.superficieElevada,
  },
  fechar: {
    padding: ESPACAMENTO.sm,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CORES.texto,
    marginTop: ESPACAMENTO.md,
    marginBottom: ESPACAMENTO.lg,
  },
  campo: {
    paddingVertical: ESPACAMENTO.md,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
    gap: ESPACAMENTO.xs,
  },
  rotulo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: CORES.textoSecundario,
  },
  valor: {
    fontSize: 15,
    color: CORES.texto,
  },
});
