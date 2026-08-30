import { StyleSheet, Text, View, Image, Button, Alert } from 'react-native';
import Produto from './Componentes/Produto';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mercado Express</Text>

      <Image
        source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
        style={styles.logo}
      />

      <View style={styles.listaProdutos}>
        <Produto
          nome="Leite Integral"
          preco="R$ 5,50"
          imagem={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
        />
        <Produto
          nome="Arroz 5kg"
          preco="R$ 24,90"
          imagem={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
        />
        <Produto
          nome="Café 500g"
          preco="R$ 18,75"
          imagem={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
        />
      </View>

      <View style={styles.areaBotoes}>
        <Button
          title="Meus Pedidos"
          onPress={() => Alert.alert('Menu', 'Você selecionou: Meus Pedidos')}
        />
        <Button
          title="Ver Produtos"
          onPress={() => Alert.alert('Menu', 'Você selecionou: Ver Produtos')}
        />
        <Button
          title="Configurações"
          onPress={() => Alert.alert('Menu', 'Você selecionou: Configurações')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 28,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  listaProdutos: {
    marginBottom: 30,
  },
  areaBotoes: {
    width: 200,
  },
});
