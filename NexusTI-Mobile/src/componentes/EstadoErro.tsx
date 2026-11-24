import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BotaoPadrao from './BotaoPadrao';
import { CORES, ESPACAMENTO, RAIO } from '../tema/cores';

interface EstadoErroProps {
  mensagem: string;
  aoTentarNovamente?: () => void;
}

export default function EstadoErro({ mensagem, aoTentarNovamente }: EstadoErroProps) {
  return (
    <View style={estilos.container} accessibilityRole="alert">
      <View style={[estilos.circulo, { borderColor: CORES.perigo }]}>
        <Ionicons name="alert-circle-outline" size={40} color={CORES.perigo} />
      </View>
      <Text style={estilos.mensagem}>{mensagem}</Text>
      {aoTentarNovamente !== undefined ? (
        <View style={estilos.acao}>
          <BotaoPadrao
            titulo="Tentar novamente"
            aoPressionar={aoTentarNovamente}
            variante="secundario"
            icone="refresh-outline"
          />
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTO.xl,
    gap: ESPACAMENTO.md,
  },
  circulo: {
    width: 80,
    height: 80,
    borderRadius: RAIO.circular,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CORES.superficie,
    borderWidth: 1,
  },
  mensagem: {
    fontSize: 14,
    color: CORES.perigo,
    textAlign: 'center',
  },
  acao: {
    alignSelf: 'stretch',
    marginTop: ESPACAMENTO.sm,
  },
});
