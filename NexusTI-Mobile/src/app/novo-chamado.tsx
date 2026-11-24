import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import Cabecalho from '../componentes/Cabecalho';
import InputPadrao from '../componentes/InputPadrao';
import BotaoPadrao from '../componentes/BotaoPadrao';
import SelectPadrao from '../componentes/SelectPadrao';
import type { OpcaoSelect } from '../componentes/SelectPadrao';
import api from '../api/client';
import { listarOpcoesEquipamentos } from '../api/equipamentos';
import { listarOpcoesPrioridades } from '../api/prioridades';
import { criarChamado } from '../api/chamados';
import { lerPerfil, salvarPerfil } from '../auth/session';
import { CORES, ESPACAMENTO, RAIO } from '../tema/cores';
import type { ChamadoResposta, Equipamento, PerfilResposta, Prioridade } from '../types/models';

function mensagemErro(falha: unknown): string {
  if (axios.isAxiosError(falha)) {
    const dados = falha.response ? (falha.response.data as { mensagem?: string }) : undefined;
    if (dados !== undefined && typeof dados.mensagem === 'string' && dados.mensagem !== '') {
      return dados.mensagem;
    }
    const status = falha.response ? falha.response.status : 0;
    if (status === 401) {
      return 'Sessão expirada. Entre novamente.';
    }
    if (status === 400) {
      return 'Requisição inválida. Verifique os dados.';
    }
  }
  return 'Falha ao abrir o chamado. Tente novamente.';
}

export default function NovoChamadoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [titulo, setTitulo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [idEquipamentoTexto, setIdEquipamentoTexto] = useState<string>('');
  const [prioridadeTexto, setPrioridadeTexto] = useState<string>('');
  const [opcoesEquipamentos, setOpcoesEquipamentos] = useState<OpcaoSelect[]>([]);
  const [opcoesPrioridades, setOpcoesPrioridades] = useState<OpcaoSelect[]>([]);
  const [idSolicitante, setIdSolicitante] = useState<number>(0);
  const [erro, setErro] = useState<string>('');
  const [tentativa, setTentativa] = useState<boolean>(false);
  const [carregando, setCarregando] = useState<boolean>(false);

  useEffect(() => {
    let ativo = true;
    const carregar = async (): Promise<void> => {
      try {
        const [equipamentos, prioridades] = await Promise.all([
          listarOpcoesEquipamentos(),
          listarOpcoesPrioridades(),
        ]);
        if (ativo === false) {
          return;
        }
        setOpcoesEquipamentos(
          equipamentos.map((item: Equipamento) => {
            const patrimonio =
              item.patrimonio !== null && item.patrimonio !== '' ? item.patrimonio : 'Sem patrimônio';
            const marca = item.marca !== null ? item.marca : '';
            const modelo = item.modelo !== null ? item.modelo : '';
            const complemento = (marca + ' ' + modelo).trim();
            return {
              id: String(item.id),
              rotulo: complemento !== '' ? patrimonio + ' - ' + complemento : patrimonio,
            };
          })
        );
        setOpcoesPrioridades(
          prioridades
            .filter((item: Prioridade) => item.nome !== null && item.nome !== '')
            .map((item: Prioridade) => ({ id: String(item.nome), rotulo: String(item.nome) }))
        );
        const perfilLocal = await lerPerfil().catch(() => null);
        if (perfilLocal !== null && perfilLocal.id > 0) {
          setIdSolicitante(perfilLocal.id);
          return;
        }
        const respostaPerfil = await api.get<PerfilResposta>('/auth/perfil');
        await salvarPerfil(respostaPerfil.data);
        if (ativo === true) {
          setIdSolicitante(respostaPerfil.data.id);
        }
      } catch (falha) {
        if (ativo === true) {
          setErro(mensagemErro(falha));
        }
      }
    };
    void carregar();
    return () => {
      ativo = false;
    };
  }, []);

  const enviarChamado = async (): Promise<void> => {
    if (carregando === true) {
      return;
    }
    setTentativa(true);
    const tituloNormalizado = titulo.trim();
    const descricaoNormalizada = descricao.trim();
    const equipamentoNormalizado = idEquipamentoTexto.trim();
    const prioridadeNormalizada = prioridadeTexto.trim();
    if (tituloNormalizado.length < 3 || descricaoNormalizada.length < 5 || equipamentoNormalizado === '') {
      setErro('Preencha os campos obrigatórios.');
      return;
    }
    const idEquipamento = Number(equipamentoNormalizado);
    if (Number.isNaN(idEquipamento) === true || idEquipamento <= 0) {
      setErro('Selecione um equipamento válido.');
      return;
    }
    if (idSolicitante <= 0) {
      setErro('Não foi possível identificar o solicitante.');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      const dados: Partial<ChamadoResposta> = {
        titulo: tituloNormalizado,
        descricao: descricaoNormalizada,
        idSolicitante: idSolicitante,
        idEquipamento: idEquipamento,
      };
      if (prioridadeNormalizada !== '') {
        dados.prioridade = prioridadeNormalizada;
      }
      const criado = await criarChamado(dados);
      router.replace({ pathname: '/detalhe', params: { id: String(criado.id) } } as never);
    } catch (falha) {
      setErro(mensagemErro(falha));
    } finally {
      setCarregando(false);
    }
  };

  const voltar = (): void => {
    router.back();
  };

  const erroTitulo = tentativa === true && titulo.trim().length < 3 ? 'Informe um título com pelo menos 3 caracteres.' : undefined;
  const erroDescricao = tentativa === true && descricao.trim().length < 5 ? 'Descreva o problema com pelo menos 5 caracteres.' : undefined;
  const erroEquipamento = tentativa === true && idEquipamentoTexto === '' ? 'Selecione o equipamento.' : undefined;

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={24}
    >
      <ScrollView
        contentContainerStyle={[estilos.container, { paddingBottom: insets.bottom + ESPACAMENTO.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Cabecalho titulo="Novo chamado" subtitulo="Informe o equipamento e o problema" />
        <View style={estilos.formulario}>
          <InputPadrao
            rotulo="Título"
            valor={titulo}
            aoMudar={setTitulo}
            placeholder="Exemplo: Impressora da recepção"
            erro={erroTitulo}
          />
          <InputPadrao
            rotulo="Descrição do problema"
            valor={descricao}
            aoMudar={setDescricao}
            placeholder="Descreva o problema"
            multilinha={true}
            erro={erroDescricao}
          />
          <SelectPadrao
            rotulo="Equipamento"
            valorTexto={idEquipamentoTexto}
            placeholder="Selecione o equipamento"
            opcoes={opcoesEquipamentos}
            aoMudar={setIdEquipamentoTexto}
            mensagemVazia="Nenhum equipamento disponível."
          />
          {erroEquipamento !== undefined ? <Text style={estilos.erroCampo}>{erroEquipamento}</Text> : null}
          <SelectPadrao
            rotulo="Prioridade"
            valorTexto={prioridadeTexto}
            placeholder="Selecione a prioridade (opcional)"
            opcoes={opcoesPrioridades}
            aoMudar={setPrioridadeTexto}
            mensagemVazia="Nenhuma prioridade ativa."
          />
          {erro !== '' ? <Text style={estilos.erro}>{erro}</Text> : null}
          <BotaoPadrao
            titulo={carregando === true ? 'Enviando...' : 'Abrir chamado'}
            aoPressionar={() => void enviarChamado()}
            carregando={carregando}
          />
          <BotaoPadrao titulo="Voltar" aoPressionar={voltar} variante="fantasma" />
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
  formulario: {
    padding: ESPACAMENTO.lg,
    borderRadius: RAIO.medio,
    borderWidth: 1,
    borderColor: CORES.borda,
    backgroundColor: CORES.superficie,
  },
  erro: {
    fontSize: 14,
    color: CORES.perigo,
    textAlign: 'center',
    marginTop: ESPACAMENTO.md,
  },
  erroCampo: {
    fontSize: 12,
    color: CORES.perigo,
    marginTop: ESPACAMENTO.xs,
  },
});
