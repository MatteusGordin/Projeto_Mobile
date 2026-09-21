import { Button, StyleSheet, View } from 'react-native';

interface BotaoPadraoProps {
  titulo: string;
  aoPressionar: () => void;
  desabilitado?: boolean;
}

export default function BotaoPadrao({ titulo, aoPressionar, desabilitado }: BotaoPadraoProps) {
  return (
    <View style={estilos.envoltura}>
      <Button title={titulo} onPress={aoPressionar} disabled={desabilitado === true} />
    </View>
  );
}

const estilos = StyleSheet.create({
  envoltura: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 12,
  },
});
