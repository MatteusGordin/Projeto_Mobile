import { StyleSheet, Text, View } from 'react-native';

interface CardChamadoProps {
  equipamento: string;
  descricao: string;
  status: string;
}

export default function CardChamado({ equipamento, descricao, status }: CardChamadoProps) {
  return (
    <View style={estilos.cartao}>
      <Text style={estilos.equipamento}>{equipamento}</Text>
      <Text style={estilos.descricao}>{descricao}</Text>
      <Text style={estilos.status}>{status}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  equipamento: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  descricao: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginTop: 8,
  },
});
