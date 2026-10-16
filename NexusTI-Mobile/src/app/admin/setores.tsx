import { useCallback, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import axios from 'axios';
import Cabecalho from '../../componentes/Cabecalho';
import InputPadrao from '../../componentes/InputPadrao';
import BotaoPadrao from '../../componentes/BotaoPadrao';
import { atualizarSetor, criarSetor, deletarSetor, listarSetores } from '../../api/setores';
import type { Setor } from '../../types/models';

export default function AdminSetoresScreen() {
  const router = useRouter();
  const [setores, setSetores] = useState<Setor[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [confirmacao, setConfirmacao] = useState<string>('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nome, setNome] = useState<string>('');
  const [sigla, setSigla] = useState<string>('');

  const carregarDados = async (): Promise<void> => {
    setCarregando(true);
    setErro('');
    try {
      const pagina = await listarSetores(0, 20);
      const conteudo = pagina && pagina.content ? pagina.content : [];
      setSetores(conteudo);
      if (conteudo.length === 0) {
        setErro('Nenhum setor encontrado.');
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
          setErro('Falha ao listar setores. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else {
        setErro('Falha ao listar setores. Tente novamente.');
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
    setSigla('');
    setEditandoId(null);
  };

  const textoDe = (valor: string | null): string => {
    if (valor !== null && valor !== undefined && valor !== '') {
      return valor;
    }
    return 'Nao informado';
  };

  const iniciarEdicao = (item: Setor): void => {
    setEditandoId(item.id);
    setNome(item.nome !== null && item.nome !== undefined ? item.nome : '');
    setSigla(item.sigla !== null && item.sigla !== undefined ? item.sigla : '');
    setErro('');
    setConfirmacao('');
  };

  const montarPayload = (): Partial<Setor> | null => {
    const nomeNormalizado = nome.trim();
    const siglaNormalizada = sigla.trim();
    if (nomeNormalizado.length < 3) {
      setErro('Nome do setor invalido.');
      return null;
    }
    if (siglaNormalizada === '') {
      setErro('Sigla do setor invalida.');
      return null;
    }
    const payload: Partial<Setor> = {
      nome: nomeNormalizado,
      sigla: siglaNormalizada,
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
        const criado = await criarSetor(payload);
        setConfirmacao('Setor ' + String(criado.id) + ' criado com sucesso.');
      } else {
        const atualizado = await atualizarSetor(editandoId, payload);
        setConfirmacao('Setor ' + String(atualizado.id) + ' atualizado com sucesso.');
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
          setErro('Falha ao criar setor. Tente novamente.');
        } else {
          setErro('Falha ao atualizar setor. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else if (editandoId === null) {
        setErro('Falha ao criar setor. Tente novamente.');
      } else {
        setErro('Falha ao atualizar setor. Tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = (id: number): void => {
    Alert.alert('Excluir', 'Confirmar exclusao do setor?', [
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
      await deletarSetor(id);
      if (editandoId === id) {
        limparFormulario();
      }
      setConfirmacao('Setor ' + String(id) + ' excluido com sucesso.');
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
          setErro('Falha ao excluir setor. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else {
        setErro('Falha ao excluir setor. Tente novamente.');
      }
    }
  };

  return (
    <View style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.container}>
        <Cabecalho titulo="Setores" subtitulo="Administracao" />
        <View style={estilos.formulario}>
          <Text style={estilos.tituloForm}>{editandoId === null ? 'Novo Setor' : 'Editar Setor'}</Text>
          <InputPadrao rotulo="Nome" valor={nome} aoMudar={setNome} placeholder="Exemplo: Financeiro" />
          <InputPadrao rotulo="Sigla" valor={sigla} aoMudar={setSigla} placeholder="Exemplo: FIN" />
          <BotaoPadrao
            titulo={salvando === true ? 'Salvando...' : editandoId === null ? 'Criar' : 'Salvar'}
            aoPressionar={submeter}
            desabilitado={salvando}
          />
        </View>
        <View style={estilos.lista}>
          {carregando === true ? (
            <Text style={estilos.carregando}>Carregando setores...</Text>
          ) : erro !== '' && setores.length === 0 ? (
            <Text style={estilos.erro}>{erro}</Text>
          ) : (
            setores.map((item: Setor) => (
              <View key={String(item.id)} style={estilos.cartao}>
                <Text style={estilos.nome}>{textoDe(item.nome)}</Text>
                <Text style={estilos.linha}>{'Sigla: ' + textoDe(item.sigla)}</Text>
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
        {erro !== '' && setores.length > 0 ? <Text style={estilos.erro}>{erro}</Text> : null}
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
