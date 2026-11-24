import { useCallback, useMemo, useState } from 'react';
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
import SelectPadrao from '../../componentes/SelectPadrao';
import type { OpcaoSelect } from '../../componentes/SelectPadrao';
import BadgeStatus from '../../componentes/BadgeStatus';
import EstadoCarregando from '../../componentes/EstadoCarregando';
import EstadoErro from '../../componentes/EstadoErro';
import EstadoVazio from '../../componentes/EstadoVazio';
import {
  atualizarEquipamento,
  criarEquipamento,
  deletarEquipamento,
  listarEquipamentos,
} from '../../api/equipamentos';
import { listarOpcoesSetores } from '../../api/setores';
import { mensagemErroApi } from '../../utils/errosApi';
import { CORES, ESPACAMENTO, RAIO } from '../../tema/cores';
import type { Equipamento, Setor } from '../../types/models';

const OPCOES_TIPO: OpcaoSelect[] = [
  { id: 'Notebook', rotulo: 'Notebook' },
  { id: 'Desktop', rotulo: 'Desktop' },
  { id: 'Impressora', rotulo: 'Impressora' },
  { id: 'Monitor', rotulo: 'Monitor' },
  { id: 'Rede', rotulo: 'Rede' },
];

export default function AdminEquipamentosScreen() {
  const router = useRouter();
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [opcoesSetores, setOpcoesSetores] = useState<OpcaoSelect[]>([]);
  const [busca, setBusca] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [confirmacao, setConfirmacao] = useState<string>('');
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [patrimonio, setPatrimonio] = useState<string>('');
  const [tipo, setTipo] = useState<string>('');
  const [marca, setMarca] = useState<string>('');
  const [modelo, setModelo] = useState<string>('');
  const [idSetorTexto, setIdSetorTexto] = useState<string>('');
  const [tentativa, setTentativa] = useState<boolean>(false);

  const carregarDados = useCallback(async (): Promise<void> => {
    setCarregando(true);
    try {
      const [pagina, opcoes] = await Promise.all([listarEquipamentos(0, 200), listarOpcoesSetores()]);
      setEquipamentos(pagina && Array.isArray(pagina.content) ? pagina.content : []);
      setOpcoesSetores(
        opcoes.map((item: Setor) => ({
          id: String(item.id),
          rotulo: item.nome !== null && item.nome !== '' ? item.nome : 'Setor #' + String(item.id),
        }))
      );
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

  const nomesSetores = useMemo(() => new Map(opcoesSetores.map((opcao: OpcaoSelect) => [opcao.id, opcao.rotulo])), [opcoesSetores]);
  const termo = busca.trim().toLowerCase();
  const filtrados = equipamentos.filter((item: Equipamento) => {
    if (termo === '') {
      return true;
    }
    const nomeSetor = nomesSetores.get(String(item.idSetor)) ?? '';
    return (item.patrimonio + ' ' + item.tipo + ' ' + item.marca + ' ' + item.modelo + ' ' + nomeSetor)
      .toLowerCase()
      .includes(termo);
  });

  const abrirNovo = (): void => {
    setEditandoId(null);
    setPatrimonio('');
    setTipo('');
    setMarca('');
    setModelo('');
    setIdSetorTexto('');
    setTentativa(false);
    setErro('');
    setModalAberto(true);
  };

  const iniciarEdicao = (item: Equipamento): void => {
    setEditandoId(item.id);
    setPatrimonio(item.patrimonio);
    setTipo(item.tipo);
    setMarca(item.marca);
    setModelo(item.modelo);
    setIdSetorTexto(String(item.idSetor));
    setTentativa(false);
    setErro('');
    setModalAberto(true);
  };

  const fecharModal = (): void => {
    setModalAberto(false);
  };

  const erroPatrimonio = tentativa === true && patrimonio.trim().length < 3 ? 'Informe um patrimônio com pelo menos 3 caracteres.' : undefined;
  const erroTipo = tentativa === true && tipo.trim() === '' ? 'Selecione o tipo.' : undefined;
  const erroMarca = tentativa === true && marca.trim() === '' ? 'Informe a marca.' : undefined;
  const erroModelo = tentativa === true && modelo.trim() === '' ? 'Informe o modelo.' : undefined;
  const erroSetor = tentativa === true && Number(idSetorTexto) <= 0 ? 'Selecione o setor.' : undefined;

  const submeter = async (): Promise<void> => {
    if (salvando === true) {
      return;
    }
    setTentativa(true);
    const idSetor = Number(idSetorTexto);
    if (
      patrimonio.trim().length < 3 ||
      tipo.trim() === '' ||
      marca.trim() === '' ||
      modelo.trim() === '' ||
      Number.isNaN(idSetor) === true ||
      idSetor <= 0
    ) {
      return;
    }
    const dados: Partial<Equipamento> = {
      patrimonio: patrimonio.trim(),
      tipo: tipo.trim(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      idSetor: idSetor,
    };
    setSalvando(true);
    setErro('');
    try {
      if (editandoId === null) {
        await criarEquipamento(dados);
        setConfirmacao('Equipamento criado com sucesso.');
      } else {
        await atualizarEquipamento(editandoId, dados);
        setConfirmacao('Equipamento atualizado com sucesso.');
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
      await deletarEquipamento(id);
      setConfirmacao('Equipamento excluído com sucesso.');
      await carregarDados();
    } catch (falha) {
      setErro(mensagemErroApi(falha));
    }
  };

  const confirmarExclusao = (item: Equipamento): void => {
    Alert.alert('Excluir equipamento', 'Deseja excluir o equipamento ' + item.patrimonio + '?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => void excluir(item.id) },
    ]);
  };

  const voltar = (): void => {
    router.back();
  };

  const cabecalhoLista = (
    <View style={estilos.cabecalhoLista}>
      <Cabecalho titulo="Equipamentos" subtitulo="Administração" />
      <BotaoPadrao titulo="+ Novo equipamento" aoPressionar={abrirNovo} icone="add-outline" />
      <InputPadrao rotulo="Buscar" valor={busca} aoMudar={setBusca} placeholder="Patrimônio, tipo, marca ou setor" />
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
        keyExtractor={(item: Equipamento) => String(item.id)}
        renderItem={({ item }: { item: Equipamento }) => (
          <View style={estilos.cartao}>
            <Text style={estilos.titulo}>{item.patrimonio}</Text>
            <BadgeStatus rotulo={item.tipo} />
            <Text style={estilos.linha}>{'Marca/modelo: ' + item.marca + ' ' + item.modelo}</Text>
            <Text style={estilos.linha}>{'Setor: ' + (nomesSetores.get(String(item.idSetor)) ?? 'Não informado')}</Text>
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
            <EstadoCarregando mensagem="Carregando equipamentos..." />
          ) : erro !== '' ? (
            <EstadoErro mensagem={erro} aoTentarNovamente={() => void carregarDados()} />
          ) : (
            <EstadoVazio titulo="Nenhum equipamento encontrado" subtitulo="Cadastre um equipamento para começar." />
          )
        }
        ListFooterComponent={<BotaoPadrao titulo="Voltar" aoPressionar={voltar} variante="fantasma" />}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={() => void carregarDados()} tintColor={CORES.primario} colors={[CORES.primario]} />}
      />
      <Modal visible={modalAberto} transparent animationType="slide" onRequestClose={fecharModal} statusBarTranslucent>
        <KeyboardAvoidingView style={estilos.modalTela} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={estilos.fundo} onPress={fecharModal}>
            <Pressable style={estilos.modalCartao} onPress={() => undefined} accessibilityLabel="Formulário de equipamento">
              <ScrollView contentContainerStyle={estilos.modalConteudo} keyboardShouldPersistTaps="handled">
                <Text style={estilos.modalTitulo}>{editandoId === null ? 'Novo equipamento' : 'Editar equipamento'}</Text>
                <InputPadrao rotulo="Patrimônio" valor={patrimonio} aoMudar={setPatrimonio} placeholder="Exemplo: NB-001" erro={erroPatrimonio} />
                <SelectPadrao rotulo="Tipo" valorTexto={tipo} placeholder="Selecione o tipo" opcoes={OPCOES_TIPO} aoMudar={setTipo} mensagemVazia="Nenhum tipo disponível." />
                {erroTipo !== undefined ? <Text style={estilos.erroCampo}>{erroTipo}</Text> : null}
                <InputPadrao rotulo="Marca" valor={marca} aoMudar={setMarca} placeholder="Exemplo: Dell" erro={erroMarca} />
                <InputPadrao rotulo="Modelo" valor={modelo} aoMudar={setModelo} placeholder="Exemplo: Latitude" erro={erroModelo} />
                <SelectPadrao rotulo="Setor" valorTexto={idSetorTexto} placeholder="Selecione o setor" opcoes={opcoesSetores} aoMudar={setIdSetorTexto} mensagemVazia="Nenhum setor cadastrado." />
                {erroSetor !== undefined ? <Text style={estilos.erroCampo}>{erroSetor}</Text> : null}
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
  erroCampo: { fontSize: 12, color: CORES.perigo, marginTop: ESPACAMENTO.xs },
  confirmacao: { fontSize: 13, color: CORES.sucesso, textAlign: 'center' },
  modalTela: { flex: 1 },
  fundo: { flex: 1, justifyContent: 'center', padding: ESPACAMENTO.lg, backgroundColor: 'rgba(15, 23, 42, 0.85)' },
  modalCartao: { maxHeight: '88%', borderRadius: RAIO.grande, borderWidth: 1, borderColor: CORES.borda, backgroundColor: CORES.superficie },
  modalConteudo: { padding: ESPACAMENTO.xl },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: CORES.texto, marginBottom: ESPACAMENTO.sm },
});
