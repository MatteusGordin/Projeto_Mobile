import { StyleSheet, Text, View, Image } from 'react-native';

export default function Produto(props) {
  return (
    <View style={styles.card}>
      <Image source={props.imagem} style={styles.imagem} />
      <View style={styles.info}>
        <Text style={styles.nome}>{props.nome}</Text>
        <Text style={styles.preco}>{props.preco}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    width: 300,
  },
  imagem: {
    width: 80,
    height: 80,
    marginRight: 10,
  },
  info: {
    justifyContent: 'center',
  },
  nome: {
    fontSize: 18,
    marginBottom: 5,
  },
  preco: {
    fontSize: 16,
    color: '#008000',
  },
});
