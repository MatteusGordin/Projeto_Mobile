import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import Cabecalho from '../componentes/Cabecalho';
import InputPadrao from '../componentes/InputPadrao';
import BotaoPadrao from '../componentes/BotaoPadrao';
import BadgeStatus from '../componentes/BadgeStatus';
import EstadoCarregando from '../componentes/EstadoCarregando';
import EstadoErro from '../componentes/EstadoErro';
import { buscarChamadoPorId, concluirChamado, excluirChamado } from '../api/chamados';
import { lerPerfil } from '../auth/session';
import { CORES, ESPACAMENTO, RAIO } from '../tema/cores';
import { formatarDataIso } from '../utils/formatacao';
import type { ChamadoResposta, PerfilResposta } from '../types/models';

type AcaoChamado = 'concluir' | 'excluir';

function mensagemErro(falha: unknown, acao: AcaoChamado, padrao: string): string {
  if (axios.isAxiosError(falha)) {
    const dados = falha.response ? (falha.response.data as { mensagem?: string }) : undefined;
    if (dados !== undefined && typeof dados.mensagem === 'string' && dados.mensagem !== '') {
      return dados.mensagem;
    }
    const status = falha.response ? falha.response.status : 0;
    if (status === 403) {
      return acao === 'concluir'
        ? 'Apenas administradores e técnicos podem concluir chamados.'
        : 'Você não tem permissão para excluir este chamado.';
    }
    if (status === 404) {
      return 'Chamado não encontrado.';
    }
    if (status === 401) {
      return 'Sessão expirada. Entre novamente.';
    }
    if (status === 400) {
      return acao === 'concluir'
        ? 'Informe a solução com pelo menos 5 caracteres.'
        : 'Não foi possível excluir o chamado.';
    }
  }
  return padrao;
}

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
      setErro('Chamado inválido.');
      setCarregando(false);
      return;
    }
    setIdChamado(numerico);
    let ativo = true;
    const carregar = async (): Promise<void> => {
      setCarregando(true);
      setErro('');
      try {
        const [resposta, perfilSalvo] = await Promise.all([
          buscarChamadoPorId(numerico),
          lerPerfil().catch(() => null),
        ]);
        if (ativo === false) {
          return;
        }
        setChamado(resposta);
        setPerfil(perfilSalvo);
        if (resposta.solucao !== null && resposta.solucao !== '') {
          setSolucao(resposta.solucao);
        }
      } catch (falha) {
        if (ativo === true) {
          setErro(mensagemErro(falha, 'concluir', 'Falha ao carregar o chamado. Tente novamente.'));
        }
      } finally {
        if (ativo === true) {
          setCarregando(false);
        }
      }
    };
    void carregar();
    return () => {
      ativo = false;
    };
  }, [parametros.id]);

  const concluir = async (): Promise<void> => {
    if (salvando === true || chamado === null || idChamado <= 0) {
      return;
    }
    const textoNormalizado = solucao.trim();
    if (textoNormalizado.length < 5) {
      setErro('Informe a solução com pelo menos 5 caracteres.');
      return;
    }
    setErro('');
    setConfirmacao('');
    setSalvando(true);
    try {
      const atualizado = await concluirChamado(idChamado, textoNormalizado);
      setChamado(atualizado);
      setSolucao('');
      setConfirmacao('Chamado concluído com sucesso.');
    } catch (falha) {
      setErro(mensagemErro(falha, 'concluir', 'Falha ao concluir o chamado. Tente novamente.'));
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (): Promise<void> => {
    if (idChamado <= 0) {
      return;
    }
    setErro('');
    setSalvando(true);
    try {
      await excluirChamado(idChamado);
      router.back();
    } catch (falha) {
      setErro(mensagemErro(falha, 'excluir', 'Falha ao excluir o chamado. Tente novamente.'));
      setSalvando(false);
    }
  };

  const confirmarExclusao = (): void => {
    Alert.alert('Excluir chamado', 'Deseja excluir este chamado?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => void excluir() },
    ]);
  };

  const voltar = (): void => {
    router.back();
  };

  const equipe = perfil !== null && (perfil.perfil === 'ADMIN' || perfil.perfil === 'TECNICO');
  const podeConcluir = chamado !== null && chamado.status === 'ABERTO' && equipe;
  const podeExcluir =
    chamado !== null &&
    perfil !== null &&
    (equipe === true || chamado.idSolicitante === perfil.id);
  const nomeSetor =
    chamado !== null && chamado.nomeSetorSolicitante !== null && chamado.nomeSetorSolicitante !== ''
      ? chamado.nomeSetorSolicitante +
        (chamado.siglaSetorSolicitante !== null && chamado.siglaSetorSolicitante !== ''
          ? ' (' + chamado.siglaSetorSolicitante + ')'
          : '')
      : 'Não informado';

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={24}
    >
      <ScrollView contentContainerStyle={estilos.container} keyboardShouldPersistTaps="handled">
        <Cabecalho titulo="Detalhe do chamado" subtitulo="Informações completas" />
        {carregando === true ? (
          <EstadoCarregando mensagem="Carregando chamado..." />
        ) : chamado === null ? (
          <EstadoErro
            mensagem={erro !== '' ? erro : 'Chamado não encontrado.'}
            aoTentarNovamente={voltar}
          />
        ) : (
          <View style={estilos.cartao}>
            <Text style={estilos.titulo}>{chamado.titulo}</Text>
            <View style={estilos.selos}>
              <BadgeStatus valor={chamado.status} />
              <BadgeStatus tipo="prioridade" valor={chamado.prioridade} cor={chamado.corPrioridade} />
            </View>
            <Text style={estilos.descricao}>{chamado.descricao}</Text>
            <View style={estilos.linha}>
              <Text style={estilos.rotulo}>Solicitante</Text>
              <Text style={estilos.valor}>
                {chamado.nomeSolicitante !== null && chamado.nomeSolicitante !== ''
                  ? chamado.nomeSolicitante
                  : 'Não informado'}
              </Text>
            </View>
            <View style={estilos.linha}>
              <Text style={estilos.rotulo}>Setor</Text>
              <Text style={estilos.valor}>{nomeSetor}</Text>
            </View>
            <View style={estilos.linha}>
              <Text style={estilos.rotulo}>Equipamento</Text>
              <Text style={estilos.valor}>
                {chamado.idEquipamento !== null ? '#' + String(chamado.idEquipamento) : 'Não informado'}
              </Text>
            </View>
            <View style={estilos.linha}>
              <Text style={estilos.rotulo}>Abertura</Text>
              <Text style={estilos.valor}>{formatarDataIso(chamado.dataAbertura)}</Text>
            </View>
            <View style={estilos.linha}>
              <Text style={estilos.rotulo}>Fechamento</Text>
              <Text style={estilos.valor}>{formatarDataIso(chamado.dataFechamento)}</Text>
            </View>
            <View style={estilos.linha}>
              <Text style={estilos.rotulo}>Solução</Text>
              <Text style={estilos.valor}>
                {chamado.solucao !== null && chamado.solucao !== '' ? chamado.solucao : 'Não informada'}
              </Text>
            </View>
            {podeConcluir === true ? (
              <View style={estilos.blocoSolucao}>
                <InputPadrao
                  rotulo="Solução"
                  valor={solucao}
                  aoMudar={setSolucao}
                  placeholder="Descreva a solução"
                  multilinha={true}
                  erro={erro !== '' ? erro : undefined}
                />
                <BotaoPadrao
                  titulo={salvando === true ? 'Concluindo...' : 'Concluir chamado'}
                  aoPressionar={() => void concluir()}
                  carregando={salvando}
                />
              </View>
            ) : null}
          </View>
        )}
        {erro !== '' && chamado !== null && podeConcluir === false ? (
          <Text style={estilos.erro}>{erro}</Text>
        ) : null}
        {confirmacao !== '' ? <Text style={estilos.confirmacao}>{confirmacao}</Text> : null}
        <View style={estilos.rodape}>
          <BotaoPadrao titulo="Voltar" aoPressionar={voltar} variante="fantasma" />
          {podeExcluir === true ? (
            <BotaoPadrao
              titulo="Excluir chamado"
              aoPressionar={confirmarExclusao}
              variante="perigo"
              desabilitado={salvando}
            />
          ) : null}
        </View>
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
    padding: ESPACAMENTO.xl,
    paddingBottom: ESPACAMENTO.xxl,
    backgroundColor: CORES.fundo,
  },
  cartao: {
    padding: ESPACAMENTO.lg,
    borderRadius: RAIO.medio,
    borderWidth: 1,
    borderColor: CORES.borda,
    backgroundColor: CORES.superficie,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CORES.texto,
  },
  selos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ESPACAMENTO.sm,
    marginTop: ESPACAMENTO.md,
  },
  descricao: {
    fontSize: 14,
    color: CORES.textoSecundario,
    marginTop: ESPACAMENTO.md,
  },
  linha: {
    marginTop: ESPACAMENTO.md,
  },
  rotulo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: CORES.textoSecundario,
  },
  valor: {
    fontSize: 14,
    color: CORES.texto,
    marginTop: ESPACAMENTO.xs,
  },
  blocoSolucao: {
    marginTop: ESPACAMENTO.xl,
    gap: ESPACAMENTO.sm,
  },
  erro: {
    fontSize: 14,
    color: CORES.perigo,
    textAlign: 'center',
    marginTop: ESPACAMENTO.md,
  },
  confirmacao: {
    fontSize: 14,
    color: CORES.sucesso,
    textAlign: 'center',
    marginTop: ESPACAMENTO.md,
  },
  rodape: {
    gap: ESPACAMENTO.sm,
    marginTop: ESPACAMENTO.xl,
  },
});
