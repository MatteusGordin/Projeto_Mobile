import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMenu } from './MenuLateral';
import { CORES, ESPACAMENTO } from '../tema/cores';

export default function BotaoMenu() {
  const { abrir } = useMenu();
  return (
    <Pressable
      style={estilos.botao}
      onPress={abrir}
      accessibilityRole="button"
      accessibilityLabel="Abrir menu lateral"
    >
      <Ionicons name="menu-outline" size={24} color={CORES.texto} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    paddingHorizontal: ESPACAMENTO.sm,
    paddingVertical: ESPACAMENTO.xs,
    marginLeft: ESPACAMENTO.xs,
  },
});
