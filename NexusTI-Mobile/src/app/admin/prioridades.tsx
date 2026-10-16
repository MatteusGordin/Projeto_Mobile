import { useCallback, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import axios from 'axios';
import Cabecalho from '../../componentes/Cabecalho';
import InputPadrao from '../../componentes/InputPadrao';
import BotaoPadrao from '../../componentes/BotaoPadrao';
import SelectPadrao from '../../componentes/SelectPadrao';
import type { OpcaoSelect } from '../../componentes/SelectPadrao';
import {
  atualizarPrioridade,
  criarPrioridade,
  deletarPrioridade,
  listarPrioridades,
} from '../../api/prioridades';
import type { Prioridade } from '../../types/models';

const OPCOES_ATIVA: OpcaoSelect[] = [
  { id: 'true', rotulo: 'Sim' },
  { id: 'false', rotulo: 'Nao' },
];

export default function AdminPrioridadesScreen() {
  const router = useRouter();
  const [prioridades, setPrioridades] = useState<Prioridade[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [confirmacao, setConfirmacao] = useState<string>('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nome, setNome] = useState<string>('');
  const [cor, setCor] = useState<string>('');
  const [ordemTexto, setOrdemTexto] = useState<string>('');
  const [ativaTexto, setAtivaTexto] = useState<string>('');
  const [slaHorasTexto, setSlaHorasTexto] = useState<string>('');

  const carregarDados = async (): Promise<void> => {
    setCarregando(true);
    setErro('');
    try {
      const pagina = await listarPrioridades(0, 20);
      const conteudo = pagina && pagina.content ? pagina.content : [];
      setPrioridades(conteudo);
      if (conteudo.length === 0) {
        setErro('Nenhuma prioridade encontrada.');
      }
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
        } else if (status === 403) {
          setErro('Acesso negado. Perfil sem permissao.');
        } else {
          setErro('Falha ao listar prioridades. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else {
        setErro('Falha ao listar prioridades. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      const executar = async (): Promise<void> => {
        if (ativo === true) {
          await carregarDados();
        }
      };
      executar();
      return () => {
        ativo = false;
      };
    }, [])
  );

  const voltar = (): void => {
    router.back();
  };

  const limparFormulario = (): void => {
    setNome('');
    setCor('');
    setOrdemTexto('');
    setAtivaTexto('');
    setSlaHorasTexto('');
    setEditandoId(null);
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

  const ativaDe = (valor: boolean | null): string => {
    if (valor === true) {
      return 'Sim';
    }
    if (valor === false) {
      return 'Nao';
    }
    return 'Nao informado';
  };

  const converterNumero = (texto: string, rotulo: string): number | null | undefined => {
    const normalizado = texto.trim();
    if (normalizado === '') {
      return null;
    }
    const numerico = Number(normalizado);
    if (Number.isNaN(numerico) === true || numerico < 0) {
      setErro(rotulo + ' invalido.');
      return undefined;
    }
    return numerico;
  };

  const converterAtiva = (texto: string): boolean | null | undefined => {
    const normalizado = texto.trim().toLowerCase();
    if (normalizado === '') {
      return null;
    }
    if (normalizado === 'true' || normalizado === 'sim' || normalizado === '1') {
      return true;
    }
    if (normalizado === 'false' || normalizado === 'nao' || normalizado === '0') {
      return false;
    }
    setErro('Ativa invalida. Use true ou false.');
    return undefined;
  };

  const iniciarEdicao = (item: Prioridade): void => {
    setEditandoId(item.id);
    setNome(item.nome !== null && item.nome !== undefined ? item.nome : '');
    setCor(item.cor !== null && item.cor !== undefined ? item.cor : '');
    setOrdemTexto(item.ordem !== null && item.ordem !== undefined ? String(item.ordem) : '');
    setAtivaTexto(item.ativa === true ? 'true' : item.ativa === false ? 'false' : '');
    setSlaHorasTexto(item.slaHoras !== null && item.slaHoras !== undefined ? String(item.slaHoras) : '');
    setErro('');
    setConfirmacao('');
  };

  const montarPayload = (): Partial<Prioridade> | null => {
    const nomeNormalizado = nome.trim();
    const corNormalizada = cor.trim();
    if (nomeNormalizado.length < 3) {
      setErro('Nome da prioridade invalido.');
      return null;
    }
    if (corNormalizada === '') {
      setErro('Cor da prioridade invalida.');
      return null;
    }
    const ordem = converterNumero(ordemTexto, 'Ordem da prioridade');
    if (ordem === undefined) {
      return null;
    }
    const ativa = converterAtiva(ativaTexto);
    if (ativa === undefined) {
      return null;
    }
    const slaHoras = converterNumero(slaHorasTexto, 'SLA da prioridade');
    if (slaHoras === undefined) {
      return null;
    }
    const payload: Partial<Prioridade> = {
      nome: nomeNormalizado,
      cor: corNormalizada,
      ordem: ordem,
      ativa: ativa,
      slaHoras: slaHoras,
    };
    return payload;
  };

  const submeter = async (): Promise<void> => {
    if (salvando === true) {
      return;
    }
    const payload = montarPayload();
    if (payload === null) {
      return;
    }
    setErro('');
    setConfirmacao('');
    setSalvando(true);
    try {
      if (editandoId === null) {
        const criado = await criarPrioridade(payload);
        setConfirmacao('Prioridade ' + String(criado.id) + ' criada com sucesso.');
      } else {
        const atualizado = await atualizarPrioridade(editandoId, payload);
        setConfirmacao('Prioridade ' + String(atualizado.id) + ' atualizada com sucesso.');
      }
      limparFormulario();
      await carregarDados();
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
        } else if (status === 403) {
          setErro('Acesso negado. Perfil sem permissao.');
        } else if (status === 400) {
          setErro('Requisicao invalida. Verifique os dados.');
        } else if (editandoId === null) {
          setErro('Falha ao criar prioridade. Tente novamente.');
        } else {
          setErro('Falha ao atualizar prioridade. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else if (editandoId === null) {
        setErro('Falha ao criar prioridade. Tente novamente.');
      } else {
        setErro('Falha ao atualizar prioridade. Tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = (id: number): void => {
    Alert.alert('Excluir', 'Confirmar exclusao da prioridade?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          excluir(id);
        },
      },
    ]);
  };

  const excluir = async (id: number): Promise<void> => {
    setErro('');
    setConfirmacao('');
    try {
      await deletarPrioridade(id);
      if (editandoId === id) {
        limparFormulario();
      }
      setConfirmacao('Prioridade ' + String(id) + ' excluida com sucesso.');
      await carregarDados();
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
        } else if (status === 403) {
          setErro('Acesso negado. Perfil sem permissao.');
        } else {
          setErro('Falha ao excluir prioridade. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else {
        setErro('Falha ao excluir prioridade. Tente novamente.');
      }
    }
  };

  return (
    <View style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.container}>
        <Cabecalho titulo="Prioridades" subtitulo="Administracao" />
        <View style={estilos.formulario}>
          <Text style={estilos.tituloForm}>
            {editandoId === null ? 'Nova Prioridade' : 'Editar Prioridade'}
          </Text>
          <InputPadrao rotulo="Nome" valor={nome} aoMudar={setNome} placeholder="Exemplo: Alta" />
          <InputPadrao rotulo="Cor" valor={cor} aoMudar={setCor} placeholder="Exemplo: #EF4444" />
          <InputPadrao rotulo="Ordem" valor={ordemTexto} aoMudar={setOrdemTexto} placeholder="Exemplo: 1" />
          <View style={estilos.selectZona}>
            <SelectPadrao
              rotulo="Ativa"
              valorTexto={ativaTexto}
              placeholder="Selecione"
              opcoes={OPCOES_ATIVA}
              aoMudar={setAtivaTexto}
            />
          </View>
          <InputPadrao rotulo="SLA Horas" valor={slaHorasTexto} aoMudar={setSlaHorasTexto} placeholder="Exemplo: 24" />
          <BotaoPadrao
            titulo={salvando === true ? 'Salvando...' : editandoId === null ? 'Criar' : 'Salvar'}
            aoPressionar={submeter}
            desabilitado={salvando}
          />
        </View>
        <View style={estilos.lista}>
          {carregando === true ? (
            <Text style={estilos.carregando}>Carregando prioridades...</Text>
          ) : erro !== '' && prioridades.length === 0 ? (
            <Text style={estilos.erro}>{erro}</Text>
          ) : (
            prioridades.map((item: Prioridade) => (
              <View key={String(item.id)} style={estilos.cartao}>
                <Text style={estilos.nome}>{textoDe(item.nome)}</Text>
                <Text style={estilos.linha}>{'Cor: ' + textoDe(item.cor)}</Text>
                <Text style={estilos.linha}>{'Ordem: ' + numeroDe(item.ordem)}</Text>
                <Text style={estilos.linha}>{'Ativa: ' + ativaDe(item.ativa)}</Text>
                <View style={estilos.acoes}>
                  <View style={estilos.botaoAcao}>
                    <Button title="Editar" color="#3B82F6" onPress={() => iniciarEdicao(item)} />
                  </View>
                  <View style={estilos.botaoAcao}>
                    <Button title="Excluir" color="#EF4444" onPress={() => confirmarExclusao(item.id)} />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
        {erro !== '' && prioridades.length > 0 ? <Text style={estilos.erro}>{erro}</Text> : null}
        {confirmacao !== '' ? <Text style={estilos.confirmacao}>{confirmacao}</Text> : null}
        <View style={estilos.rodape}>
          <BotaoPadrao titulo="Voltar" aoPressionar={voltar} desabilitado={carregando || salvando} />
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
  formulario: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#1E293B',
    marginBottom: 12,
    position: 'relative',
    zIndex: 10,
    elevation: 4,
  },
  selectZona: {
    position: 'relative',
    zIndex: 10,
    elevation: 4,
  },
  tituloForm: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  lista: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: 12,
    position: 'relative',
    zIndex: 0,
    elevation: 0,
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
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  linha: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  acoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  botaoAcao: {
    flex: 1,
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
