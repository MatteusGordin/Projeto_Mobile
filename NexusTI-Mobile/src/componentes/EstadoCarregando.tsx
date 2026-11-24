import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { CORES, ESPACAMENTO } from '../tema/cores';

interface EstadoCarregandoProps {
  mensagem?: string;
}

export default function EstadoCarregando({ mensagem = 'Carregando...' }: EstadoCarregandoProps) {
  return (
    <View style={estilos.container} accessibilityRole="progressbar" accessibilityLabel={mensagem}>
      <ActivityIndicator size="large" color={CORES.primario} />
      <Text style={estilos.mensagem}>{mensagem}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTO.xl,
    gap: ESPACAMENTO.md,
  },
  mensagem: {
    fontSize: 14,
    color: CORES.textoSecundario,
    textAlign: 'center',
  },
});
