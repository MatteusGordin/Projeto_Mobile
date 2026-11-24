import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Cabecalho from '../componentes/Cabecalho';
import InputPadrao from '../componentes/InputPadrao';
import BotaoPadrao from '../componentes/BotaoPadrao';
import EstadoCarregando from '../componentes/EstadoCarregando';
import api from '../api/client';
import { apagarPerfil, apagarToken, lerToken, salvarPerfil, salvarToken } from '../auth/session';
import { CORES, ESPACAMENTO } from '../tema/cores';
import type { CredenciaisLogin, LoginResposta, PerfilResposta } from '../types/models';

function mensagemErro(falha: unknown): string {
  if (axios.isAxiosError(falha)) {
    const dados = falha.response ? (falha.response.data as { mensagem?: string }) : undefined;
    if (dados !== undefined && typeof dados.mensagem === 'string' && dados.mensagem !== '') {
      return dados.mensagem;
    }
    const status = falha.response ? falha.response.status : 0;
    if (status === 401) {
      return 'E-mail ou senha inválidos.';
    }
    if (status === 400) {
      return 'Requisição inválida. Verifique os dados.';
    }
  }
  return 'Falha na autenticação. Tente novamente.';
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [tentativa, setTentativa] = useState<boolean>(false);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [verificando, setVerificando] = useState<boolean>(true);

  useEffect(() => {
    let montado = true;
    const validarSessao = async (): Promise<void> => {
      try {
        const token = await lerToken();
        if (token === null || token === '') {
          return;
        }
        const respostaPerfil = await api.get<PerfilResposta>('/auth/perfil');
        await salvarPerfil(respostaPerfil.data);
        if (montado === true) {
          router.replace('/painel');
        }
      } catch (falha) {
        if (axios.isAxiosError(falha)) {
          const status = falha.response ? falha.response.status : 0;
          if (status === 401) {
            await apagarToken();
            await apagarPerfil();
          }
        }
      } finally {
        if (montado === true) {
          setVerificando(false);
        }
      }
    };
    void validarSessao();
    return () => {
      montado = false;
    };
  }, []);

  const entrar = async (): Promise<void> => {
    if (carregando === true) {
      return;
    }
    setTentativa(true);
    const emailNormalizado = email.trim();
    const senhaNormalizada = senha.trim();
    if (emailNormalizado === '' || senhaNormalizada === '') {
      setErro('Informe e-mail e senha.');
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
        setErro('Falha na autenticação. Tente novamente.');
        return;
      }
      await salvarToken(token);
      const respostaPerfil = await api.get<PerfilResposta>('/auth/perfil');
      await salvarPerfil(respostaPerfil.data);
      router.replace('/painel');
    } catch (falha) {
      setErro(mensagemErro(falha));
    } finally {
      setCarregando(false);
    }
  };

  const erroEmail = tentativa === true && email.trim() === '' ? 'Informe o e-mail.' : undefined;
  const erroSenha = tentativa === true && senha.trim() === '' ? 'Informe a senha.' : undefined;

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={24}
    >
      <ScrollView contentContainerStyle={estilos.container} keyboardShouldPersistTaps="handled">
        <Cabecalho titulo="Nexus TI" subtitulo="HelpDesk Municipal" />
        {verificando === true ? (
          <EstadoCarregando mensagem="Verificando sessão..." />
        ) : (
          <View style={estilos.formulario}>
            <InputPadrao
              rotulo="E-mail"
              valor={email}
              aoMudar={setEmail}
              placeholder="voce@exemplo.com"
              erro={erroEmail}
            />
            <InputPadrao
              rotulo="Senha"
              valor={senha}
              aoMudar={setSenha}
              placeholder="Digite a senha"
              alternarSenha={true}
              erro={erroSenha}
            />
            {erro !== '' ? <Text style={estilos.erro}>{erro}</Text> : null}
            <BotaoPadrao
              titulo={carregando === true ? 'Entrando...' : 'Entrar'}
              aoPressionar={() => void entrar()}
              carregando={carregando}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: ESPACAMENTO.xl,
    paddingBottom: ESPACAMENTO.xxl + ESPACAMENTO.lg,
    backgroundColor: CORES.fundo,
  },
  formulario: {
    gap: ESPACAMENTO.sm,
  },
  erro: {
    fontSize: 14,
    color: CORES.perigo,
    textAlign: 'center',
    marginTop: ESPACAMENTO.md,
  },
});
