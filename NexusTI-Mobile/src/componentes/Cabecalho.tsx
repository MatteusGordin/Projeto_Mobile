import { Image, StyleSheet, Text, View } from 'react-native';

interface CabecalhoProps {
  titulo: string;
  subtitulo: string;
}

export default function Cabecalho({ titulo, subtitulo }: CabecalhoProps) {
  return (
    <View style={estilos.topo}>
      <Image source={require('../../assets/images/icon.png')} style={estilos.logo} />
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.subtitulo}>{subtitulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  topo: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});
