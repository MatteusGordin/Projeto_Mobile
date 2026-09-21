import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Cabecalho from '../componentes/Cabecalho';
import InputPadrao from '../componentes/InputPadrao';
import BotaoPadrao from '../componentes/BotaoPadrao';
import { autenticar } from '../servicos/api';
import type { Credenciais } from '../servicos/api';

export default function LoginScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  const entrarComoUsuario = async (): Promise<void> => {
    if (carregando === true) {
      return;
    }
    setCarregando(true);
    try {
      const credenciais: Credenciais = {
        usuario: usuario,
        senha: senha,
      };
      await autenticar(credenciais);
      router.push('/novo-chamado');
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Falha na autenticacao';
      Alert.alert('Erro de login', mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const entrarComoTecnico = async (): Promise<void> => {
    if (carregando === true) {
      return;
    }
    setCarregando(true);
    try {
      const credenciais: Credenciais = {
        usuario: usuario,
        senha: senha,
      };
      await autenticar(credenciais);
      router.push('/painel');
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Falha na autenticacao';
      Alert.alert('Erro de login', mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={estilos.container}>
      <Cabecalho titulo="Nexus TI" subtitulo="HelpDesk Municipal" />
      <View style={estilos.formulario}>
        <InputPadrao
          rotulo="Usuario"
          valor={usuario}
          aoMudar={setUsuario}
          placeholder="Digite o usuario"
        />
        <InputPadrao
          rotulo="Senha"
          valor={senha}
          aoMudar={setSenha}
          placeholder="Digite a senha"
          seguro={true}
        />
        <BotaoPadrao
          titulo={carregando === true ? 'Entrando...' : 'Entrar como Usuario'}
          aoPressionar={entrarComoUsuario}
          desabilitado={carregando}
        />
        <BotaoPadrao
          titulo={carregando === true ? 'Entrando...' : 'Entrar como Tecnico'}
          aoPressionar={entrarComoTecnico}
          desabilitado={carregando}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  formulario: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
});
