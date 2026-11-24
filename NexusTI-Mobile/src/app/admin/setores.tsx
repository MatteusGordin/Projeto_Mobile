import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Cabecalho from '../../componentes/Cabecalho';
import InputPadrao from '../../componentes/InputPadrao';
import BotaoPadrao from '../../componentes/BotaoPadrao';
import EstadoCarregando from '../../componentes/EstadoCarregando';
import EstadoErro from '../../componentes/EstadoErro';
import EstadoVazio from '../../componentes/EstadoVazio';
import { atualizarSetor, criarSetor, deletarSetor, listarSetores } from '../../api/setores';
import { mensagemErroApi } from '../../utils/errosApi';
import { CORES, ESPACAMENTO, RAIO } from '../../tema/cores';
import type { Setor } from '../../types/models';

export default function AdminSetoresScreen() {
  const router = useRouter();
  const [setores, setSetores] = useState<Setor[]>([]);
  const [busca, setBusca] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [confirmacao, setConfirmacao] = useState<string>('');
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nome, setNome] = useState<string>('');
  const [sigla, setSigla] = useState<string>('');
  const [tentativa, setTentativa] = useState<boolean>(false);

  const carregarDados = useCallback(async (): Promise<void> => {
    setCarregando(true);
    try {
      const pagina = await listarSetores(0, 200);
      setSetores(pagina && Array.isArray(pagina.content) ? pagina.content : []);
      setErro('');
    } catch (falha) {
      setErro(mensagemErroApi(falha));
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void carregarDados();
    }, [carregarDados])
  );

  const termo = busca.trim().toLowerCase();
  const filtrados = setores.filter((item: Setor) => {
    if (termo === '') {
      return true;
    }
    return (String(item.nome ?? '') + ' ' + String(item.sigla ?? '')).toLowerCase().includes(termo);
  });

  const abrirNovo = (): void => {
    setEditandoId(null);
    setNome('');
    setSigla('');
    setTentativa(false);
    setErro('');
    setModalAberto(true);
  };

  const iniciarEdicao = (item: Setor): void => {
    setEditandoId(item.id);
    setNome(item.nome ?? '');
    setSigla(item.sigla ?? '');
    setTentativa(false);
    setErro('');
    setModalAberto(true);
  };

  const fecharModal = (): void => {
    setModalAberto(false);
  };

  const erroNome = tentativa === true && nome.trim().length < 2 ? 'Informe um nome com pelo menos 2 caracteres.' : undefined;
  const errosigla = tentativa === true && sigla.trim().length < 2 ? 'Informe uma sigla com pelo menos 2 caracteres.' : undefined;

  const submeter = async (): Promise<void> => {
    if (salvando === true) {
      return;
    }
    setTentativa(true);
    if (nome.trim().length < 2 || sigla.trim().length < 2) {
      return;
    }
    const dados: Partial<Setor> = {
      nome: nome.trim(),
      sigla: sigla.trim(),
    };
    setSalvando(true);
    setErro('');
    try {
      if (editandoId === null) {
        await criarSetor(dados);
        setConfirmacao('Setor criado com sucesso.');
      } else {
        await atualizarSetor(editandoId, dados);
        setConfirmacao('Setor atualizado com sucesso.');
      }
      fecharModal();
      await carregarDados();
    } catch (falha) {
      setErro(mensagemErroApi(falha));
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id: number): Promise<void> => {
    setErro('');
    try {
      await deletarSetor(id);
      setConfirmacao('Setor excluído com sucesso.');
      await carregarDados();
    } catch (falha) {
      setErro(mensagemErroApi(falha));
    }
  };

  const confirmarExclusao = (item: Setor): void => {
    Alert.alert('Excluir setor', 'Deseja excluir o setor ' + String(item.nome ?? '') + '?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => void excluir(item.id) },
    ]);
  };

  const voltar = (): void => {
    router.back();
  };

  const cabecalhoLista = (
    <View style={estilos.cabecalhoLista}>
      <Cabecalho titulo="Setores" subtitulo="Administração" />
      <BotaoPadrao titulo="+ Novo setor" aoPressionar={abrirNovo} icone="add-outline" />
      <InputPadrao rotulo="Buscar" valor={busca} aoMudar={setBusca} placeholder="Nome ou sigla" />
      {erro !== '' ? <Text style={estilos.erro}>{erro}</Text> : null}
      {confirmacao !== '' ? <Text style={estilos.confirmacao}>{confirmacao}</Text> : null}
      <Text style={estilos.tituloSecao}>Cadastrados ({String(filtrados.length)})</Text>
    </View>
  );

  return (
    <>
      <FlatList
        style={estilos.tela}
        contentContainerStyle={estilos.container}
        data={filtrados}
        keyExtractor={(item: Setor) => String(item.id)}
        renderItem={({ item }: { item: Setor }) => (
          <View style={estilos.cartao}>
            <Text style={estilos.titulo}>{item.nome ?? 'Sem nome'}</Text>
            <Text style={estilos.linha}>{'Sigla: ' + (item.sigla ?? 'Não informada')}</Text>
            <View style={estilos.acoes}>
              <View style={estilos.acao}>
                <BotaoPadrao titulo="Editar" aoPressionar={() => iniciarEdicao(item)} icone="create-outline" variante="fantasma" />
              </View>
              <View style={estilos.acao}>
                <BotaoPadrao titulo="Excluir" aoPressionar={() => confirmarExclusao(item)} icone="trash-outline" variante="perigo" />
              </View>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={estilos.separador} />}
        ListHeaderComponent={cabecalhoLista}
        ListEmptyComponent={
          carregando === true ? (
            <EstadoCarregando mensagem="Carregando setores..." />
          ) : erro !== '' ? (
            <EstadoErro mensagem={erro} aoTentarNovamente={() => void carregarDados()} />
          ) : (
            <EstadoVazio titulo="Nenhum setor encontrado" subtitulo="Cadastre um setor para começar." />
          )
        }
        ListFooterComponent={<BotaoPadrao titulo="Voltar" aoPressionar={voltar} variante="fantasma" />}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={() => void carregarDados()} tintColor={CORES.primario} colors={[CORES.primario]} />}
      />
      <Modal visible={modalAberto} transparent animationType="slide" onRequestClose={fecharModal} statusBarTranslucent>
        <KeyboardAvoidingView style={estilos.modalTela} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={estilos.fundo} onPress={fecharModal}>
            <Pressable style={estilos.modalCartao} onPress={() => undefined} accessibilityLabel="Formulário de setor">
              <ScrollView contentContainerStyle={estilos.modalConteudo} keyboardShouldPersistTaps="handled">
                <Text style={estilos.modalTitulo}>{editandoId === null ? 'Novo setor' : 'Editar setor'}</Text>
                <InputPadrao rotulo="Nome" valor={nome} aoMudar={setNome} placeholder="Exemplo: Financeiro" erro={erroNome} />
                <InputPadrao rotulo="Sigla" valor={sigla} aoMudar={setSigla} placeholder="Exemplo: FIN" erro={errosigla} />
                <BotaoPadrao titulo={salvando === true ? 'Salvando...' : 'Salvar'} aoPressionar={() => void submeter()} carregando={salvando} />
                <BotaoPadrao titulo="Cancelar" aoPressionar={fecharModal} variante="fantasma" />
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: CORES.fundo },
  container: { padding: ESPACAMENTO.xl, paddingBottom: ESPACAMENTO.xxl, backgroundColor: CORES.fundo },
  cabecalhoLista: { gap: ESPACAMENTO.sm, marginBottom: ESPACAMENTO.lg },
  tituloSecao: { fontSize: 15, fontWeight: 'bold', color: CORES.texto, marginTop: ESPACAMENTO.sm },
  cartao: {
    padding: ESPACAMENTO.lg,
    borderRadius: RAIO.medio,
    borderWidth: 1,
    borderColor: CORES.borda,
    backgroundColor: CORES.superficie,
    gap: ESPACAMENTO.sm,
    alignItems: 'flex-start',
  },
  titulo: { fontSize: 16, fontWeight: 'bold', color: CORES.texto },
  linha: { fontSize: 13, color: CORES.textoSecundario },
  acoes: { flexDirection: 'row', gap: ESPACAMENTO.sm, alignSelf: 'stretch' },
  acao: { flex: 1 },
  separador: { height: ESPACAMENTO.md },
  erro: { fontSize: 13, color: CORES.perigo, textAlign: 'center' },
  confirmacao: { fontSize: 13, color: CORES.sucesso, textAlign: 'center' },
  modalTela: { flex: 1 },
  fundo: { flex: 1, justifyContent: 'center', padding: ESPACAMENTO.lg, backgroundColor: 'rgba(15, 23, 42, 0.85)' },
  modalCartao: { maxHeight: '88%', borderRadius: RAIO.grande, borderWidth: 1, borderColor: CORES.borda, backgroundColor: CORES.superficie },
  modalConteudo: { padding: ESPACAMENTO.xl },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: CORES.texto, marginBottom: ESPACAMENTO.sm },
});
