import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Cabecalho from '../componentes/Cabecalho';
import InputPadrao from '../componentes/InputPadrao';
import BotaoPadrao from '../componentes/BotaoPadrao';
import api from '../api/client';
import { salvarToken } from '../auth/session';
import type { CredenciaisLogin, LoginResposta, PerfilResposta } from '../types/models';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  const entrar = async (): Promise<void> => {
    if (carregando === true) {
      return;
    }
    const emailNormalizado = email.trim();
    const senhaNormalizada = senha.trim();
    if (emailNormalizado === '' || senhaNormalizada === '') {
      setErro('Informe email e senha.');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      const credenciais: CredenciaisLogin = {
        email: emailNormalizado,
        senha: senhaNormalizada,
      };
      const respostaLogin = await api.post<LoginResposta>('/auth/login', credenciais);
      const token = respostaLogin.data && respostaLogin.data.token ? respostaLogin.data.token : '';
      if (token === '') {
        setErro('Falha na autenticacao. Tente novamente.');
        return;
      }
      await salvarToken(token);
      await api.get<PerfilResposta>('/auth/perfil');
      router.replace('/painel');
    } catch (falha) {
      if (axios.isAxiosError(falha)) {
        const status = falha.response ? falha.response.status : 0;
        const dados = falha.response
          ? (falha.response.data as { mensagem?: string; message?: string })
          : undefined;
        const mensagemApi =
          dados && dados.mensagem ? dados.mensagem : dados && dados.message ? dados.message : '';
        if (mensagemApi !== '') {
          setErro(mensagemApi);
        } else if (status === 401) {
          setErro('Email ou senha invalidos.');
        } else if (status === 400) {
          setErro('Requisicao invalida. Verifique os dados.');
        } else {
          setErro('Falha na autenticacao. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else {
        setErro('Falha na autenticacao. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={estilos.container}>
      <Cabecalho titulo="Nexus TI" subtitulo="HelpDesk Municipal" />
      <View style={estilos.formulario}>
        <InputPadrao
          rotulo="Email"
          valor={email}
          aoMudar={setEmail}
          placeholder="voce@exemplo.com"
        />
        <InputPadrao
          rotulo="Senha"
          valor={senha}
          aoMudar={setSenha}
          placeholder="Digite a senha"
          seguro={true}
        />
        {erro !== '' ? <Text style={estilos.erro}>{erro}</Text> : null}
        <BotaoPadrao
          titulo={carregando === true ? 'Entrando...' : 'Entrar'}
          aoPressionar={entrar}
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
  erro: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 12,
  },
});
