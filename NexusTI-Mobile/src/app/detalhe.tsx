import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import Cabecalho from '../componentes/Cabecalho';
import BotaoPadrao from '../componentes/BotaoPadrao';
import { atualizarChamado, buscarChamadoPorId } from '../api/chamados';
import { apagarPerfil, apagarToken, lerPerfil } from '../auth/session';
import type { ChamadoResposta, PerfilResposta } from '../types/models';

export default function DetalheScreen() {
  const router = useRouter();
  const parametros = useLocalSearchParams();
  const [chamado, setChamado] = useState<ChamadoResposta | null>(null);
  const [perfil, setPerfil] = useState<PerfilResposta | null>(null);
  const [idChamado, setIdChamado] = useState<number>(0);
  const [solucao, setSolucao] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [confirmacao, setConfirmacao] = useState<string>('');

  useEffect(() => {
    const bruto = parametros.id;
    const texto = Array.isArray(bruto) ? bruto[0] : bruto;
    const numerico = Number(texto);
    if (texto === undefined || texto === null || Number.isNaN(numerico) === true || numerico <= 0) {
      setErro('Chamado invalido.');
      setCarregando(false);
      return;
    }
    setIdChamado(numerico);
    const carregar = async (): Promise<void> => {
      setCarregando(true);
      setErro('');
      try {
        const resultado = await buscarChamadoPorId(numerico);
        setChamado(resultado);
        const perfilSalvo = await lerPerfil();
        setPerfil(perfilSalvo);
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
            setErro('Sessao expirada. Entre novamente.');
          } else if (status === 404) {
            setErro('Chamado nao encontrado.');
          } else {
            setErro('Falha ao carregar chamado. Tente novamente.');
          }
        } else if (falha instanceof Error) {
          setErro(falha.message);
        } else {
          setErro('Falha ao carregar chamado. Tente novamente.');
        }
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [parametros.id]);

  const concluir = async (): Promise<void> => {
    if (salvando === true || chamado === null || idChamado <= 0) {
      return;
    }
    if (perfil !== null && perfil.perfil === 'USUARIO') {
      setErro('Perfil sem permissao para concluir.');
      return;
    }
    const textoNormalizado = solucao.trim();
    if (textoNormalizado === '') {
      setErro('Informe a solucao.');
      return;
    }
    if (textoNormalizado.length < 5) {
      setErro('Solucao invalida.');
      return;
    }
    setErro('');
    setConfirmacao('');
    setSalvando(true);
    try {
      const atualizado = await atualizarChamado(idChamado, {
        status: 'FECHADO',
        solucao: textoNormalizado,
      });
      setChamado(atualizado);
      setSolucao('');
      setConfirmacao('Chamado ' + String(atualizado.id) + ' concluido com sucesso.');
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
          setErro('Sessao expirada. Entre novamente.');
        } else if (status === 400) {
          setErro('Requisicao invalida. Verifique os dados.');
        } else {
          setErro('Falha ao concluir chamado. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else {
        setErro('Falha ao concluir chamado. Tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const voltar = (): void => {
    router.back();
  };

  const sair = async (): Promise<void> => {
    await apagarToken();
    await apagarPerfil();
    router.replace('/');
  };

  const textoDe = (valor: string | null): string => {
    if (valor !== null && valor !== undefined && valor !== '') {
      return valor;
    }
    return 'Nao informado';
  };

  const numeroDe = (valor: number | null): string => {
    if (valor !== null && valor !== undefined) {
      return String(valor);
    }
    return 'Nao informado';
  };

  return (
    <View style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.container}>
      <Cabecalho titulo="Detalhe Chamado" subtitulo="Informacoes completas" />
      {carregando === true ? (
        <Text style={estilos.carregando}>Carregando chamado...</Text>
      ) : chamado === null ? (
        <Text style={estilos.erro}>{erro !== '' ? erro : 'Chamado nao encontrado.'}</Text>
      ) : (
        <View style={estilos.cartao}>
          <Text style={estilos.titulo}>{textoDe(chamado.titulo)}</Text>
          <Text style={estilos.descricao}>{textoDe(chamado.descricao)}</Text>
          <Text style={estilos.linha}>{'Status: ' + textoDe(chamado.status)}</Text>
          <Text style={estilos.linha}>{'Abertura: ' + textoDe(chamado.dataAbertura)}</Text>
          <Text style={estilos.linha}>{'Prioridade: ' + textoDe(chamado.prioridade)}</Text>
          <Text style={estilos.linha}>{'Equipamento: ' + numeroDe(chamado.idEquipamento)}</Text>
          <Text style={estilos.linha}>{'Solicitante: ' + numeroDe(chamado.idSolicitante)}</Text>
          <Text style={estilos.linha}>{'Tecnico: ' + numeroDe(chamado.idTecnico)}</Text>
          <Text style={estilos.linha}>{'Solucao: ' + textoDe(chamado.solucao)}</Text>
          {chamado.status === 'ABERTO' && (perfil === null || perfil.perfil !== 'USUARIO') ? (
            <View style={estilos.blocoSolucao}>
              <Text style={estilos.rotulo}>Solucao</Text>
              <TextInput
                style={estilos.campo}
                value={solucao}
                onChangeText={setSolucao}
                placeholder="Descreva a solucao"
                placeholderTextColor="#94A3B8"
                multiline={true}
              />
              <BotaoPadrao
                titulo={salvando === true ? 'Concluindo...' : 'Concluir Chamado'}
                aoPressionar={concluir}
                desabilitado={salvando}
              />
            </View>
          ) : null}
        </View>
      )}
      {erro !== '' && chamado !== null ? <Text style={estilos.erro}>{erro}</Text> : null}
      {confirmacao !== '' ? <Text style={estilos.confirmacao}>{confirmacao}</Text> : null}
      <View style={estilos.rodape}>
        <BotaoPadrao titulo="Sair" aoPressionar={sair} desabilitado={salvando} />
        <BotaoPadrao titulo="Voltar" aoPressionar={voltar} desabilitado={salvando} />
      </View>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 24,
    paddingBottom: 48,
    backgroundColor: '#0F172A',
  },
  cartao: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#1E293B',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'left',
  },
  descricao: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  linha: {
    fontSize: 14,
    color: '#F8FAFC',
    marginTop: 8,
  },
  blocoSolucao: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 16,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#F8FAFC',
    backgroundColor: '#1E293B',
    minHeight: 96,
  },
  carregando: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  erro: {
    fontSize: 14,
    color: '#F87171',
    textAlign: 'center',
    marginTop: 12,
  },
  confirmacao: {
    fontSize: 14,
    color: '#4ADE80',
    textAlign: 'center',
    marginTop: 12,
  },
  rodape: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 24,
  },
});
