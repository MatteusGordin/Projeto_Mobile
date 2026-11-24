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
import SelectPadrao from '../../componentes/SelectPadrao';
import type { OpcaoSelect } from '../../componentes/SelectPadrao';
import BadgeStatus from '../../componentes/BadgeStatus';
import EstadoCarregando from '../../componentes/EstadoCarregando';
import EstadoErro from '../../componentes/EstadoErro';
import EstadoVazio from '../../componentes/EstadoVazio';
import { atualizarPrioridade, criarPrioridade, deletarPrioridade, listarPrioridades } from '../../api/prioridades';
import { mensagemErroApi } from '../../utils/errosApi';
import { validarCorHex } from '../../utils/formatacao';
import { CORES, ESPACAMENTO, RAIO } from '../../tema/cores';
import type { Prioridade } from '../../types/models';

const OPCOES_ATIVA: OpcaoSelect[] = [
  { id: 'true', rotulo: 'Sim' },
  { id: 'false', rotulo: 'Não' },
];

const PALETA_CORES: { rotulo: string; valor: string }[] = [
  { rotulo: 'Vermelho', valor: '#EF4444' },
  { rotulo: 'Laranja', valor: '#F97316' },
  { rotulo: 'Amarelo', valor: '#EAB308' },
  { rotulo: 'Verde', valor: '#22C55E' },
  { rotulo: 'Azul', valor: '#3B82F6' },
  { rotulo: 'Cinza', valor: '#64748B' },
];

export default function AdminPrioridadesScreen() {
  const router = useRouter();
  const [prioridades, setPrioridades] = useState<Prioridade[]>([]);
  const [busca, setBusca] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [confirmacao, setConfirmacao] = useState<string>('');
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nome, setNome] = useState<string>('');
  const [cor, setCor] = useState<string>('#64748B');
  const [ordemTexto, setOrdemTexto] = useState<string>('');
  const [ativaTexto, setAtivaTexto] = useState<string>('true');
  const [tentativa, setTentativa] = useState<boolean>(false);

  const carregarDados = useCallback(async (): Promise<void> => {
    setCarregando(true);
    try {
      const pagina = await listarPrioridades(0, 200);
      setPrioridades(pagina && Array.isArray(pagina.content) ? pagina.content : []);
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
  const filtrados = prioridades.filter((item: Prioridade) => {
    if (termo === '') {
      return true;
    }
    return (String(item.nome ?? '') + ' ' + String(item.cor ?? '')).toLowerCase().includes(termo);
  });

  const abrirNovo = (): void => {
    setEditandoId(null);
    setNome('');
    setCor('#64748B');
    setOrdemTexto('');
    setAtivaTexto('true');
    setTentativa(false);
    setErro('');
    setModalAberto(true);
  };

  const iniciarEdicao = (item: Prioridade): void => {
    setEditandoId(item.id);
    setNome(item.nome ?? '');
    setCor(validarCorHex(item.cor, '#64748B'));
    setOrdemTexto(item.ordem !== null && item.ordem !== undefined ? String(item.ordem) : '');
    setAtivaTexto(item.ativa === false ? 'false' : 'true');
    setTentativa(false);
    setErro('');
    setModalAberto(true);
  };

  const fecharModal = (): void => {
    setModalAberto(false);
  };

  const erroNome = tentativa === true && nome.trim().length < 2 ? 'Informe um nome com pelo menos 2 caracteres.' : undefined;
  const erroOrdem = tentativa === true && ordemTexto !== '' && Number.isNaN(Number(ordemTexto)) ? 'Informe uma ordem válida.' : undefined;
  const corSegura = validarCorHex(cor, '#64748B');

  const submeter = async (): Promise<void> => {
    if (salvando === true) {
      return;
    }
    setTentativa(true);
    if (nome.trim().length < 2 || (ordemTexto !== '' && Number.isNaN(Number(ordemTexto)))) {
      return;
    }
    const dados: Partial<Prioridade> = {
      nome: nome.trim(),
      cor: corSegura,
      ordem: ordemTexto === '' ? null : Number(ordemTexto),
      ativa: ativaTexto === 'true',
    };
    setSalvando(true);
    setErro('');
    try {
      if (editandoId === null) {
        await criarPrioridade(dados);
        setConfirmacao('Prioridade criada com sucesso.');
      } else {
        await atualizarPrioridade(editandoId, dados);
        setConfirmacao('Prioridade atualizada com sucesso.');
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
      await deletarPrioridade(id);
      setConfirmacao('Prioridade excluída com sucesso.');
      await carregarDados();
    } catch (falha) {
      setErro(mensagemErroApi(falha));
    }
  };

  const confirmarExclusao = (item: Prioridade): void => {
    Alert.alert('Excluir prioridade', 'Deseja excluir a prioridade ' + String(item.nome ?? '') + '?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => void excluir(item.id) },
    ]);
  };

  const voltar = (): void => {
    router.back();
  };

  const cabecalhoLista = (
    <View style={estilos.cabecalhoLista}>
      <Cabecalho titulo="Prioridades" subtitulo="Administração" />
      <BotaoPadrao titulo="+ Nova prioridade" aoPressionar={abrirNovo} icone="add-outline" />
      <InputPadrao rotulo="Buscar" valor={busca} aoMudar={setBusca} placeholder="Nome ou cor" />
      {erro !== '' ? <Text style={estilos.erro}>{erro}</Text> : null}
      {confirmacao !== '' ? <Text style={estilos.confirmacao}>{confirmacao}</Text> : null}
      <Text style={estilos.tituloSecao}>Cadastradas ({String(filtrados.length)})</Text>
    </View>
  );

  return (
    <>
      <FlatList
        style={estilos.tela}
        contentContainerStyle={estilos.container}
        data={filtrados}
        keyExtractor={(item: Prioridade) => String(item.id)}
        renderItem={({ item }: { item: Prioridade }) => (
          <View style={estilos.cartao}>
            <BadgeStatus tipo="prioridade" valor={item.nome} cor={item.cor} rotulo={item.nome ?? 'Sem nome'} />
            <View style={estilos.selos}>
              <BadgeStatus tipo="prioridade" rotulo={item.ativa === false ? 'Inativa' : 'Ativa'} cor={item.ativa === false ? CORES.textoSecundario : CORES.sucesso} />
              <Text style={estilos.linha}>{'Ordem: ' + (item.ordem !== null && item.ordem !== undefined ? String(item.ordem) : '0')}</Text>
            </View>
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
            <EstadoCarregando mensagem="Carregando prioridades..." />
          ) : erro !== '' ? (
            <EstadoErro mensagem={erro} aoTentarNovamente={() => void carregarDados()} />
          ) : (
            <EstadoVazio titulo="Nenhuma prioridade encontrada" subtitulo="Cadastre uma prioridade para começar." />
          )
        }
        ListFooterComponent={<BotaoPadrao titulo="Voltar" aoPressionar={voltar} variante="fantasma" />}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={() => void carregarDados()} tintColor={CORES.primario} colors={[CORES.primario]} />}
      />
      <Modal visible={modalAberto} transparent animationType="slide" onRequestClose={fecharModal} statusBarTranslucent>
        <KeyboardAvoidingView style={estilos.modalTela} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={estilos.fundo} onPress={fecharModal}>
            <Pressable style={estilos.modalCartao} onPress={() => undefined} accessibilityLabel="Formulário de prioridade">
              <ScrollView contentContainerStyle={estilos.modalConteudo} keyboardShouldPersistTaps="handled">
                <Text style={estilos.modalTitulo}>{editandoId === null ? 'Nova prioridade' : 'Editar prioridade'}</Text>
                <InputPadrao rotulo="Nome" valor={nome} aoMudar={setNome} placeholder="Exemplo: Alta" erro={erroNome} />
                <Text style={estilos.rotulo}>Cor da prioridade</Text>
                <View style={estilos.paleta}>
                  {PALETA_CORES.map((opcao: { rotulo: string; valor: string }) => (
                    <Pressable
                      key={opcao.valor}
                      style={[estilos.cor, { backgroundColor: opcao.valor }, corSegura.toUpperCase() === opcao.valor ? estilos.corSelecionada : null]}
                      onPress={() => setCor(opcao.valor)}
                      accessibilityRole="button"
                      accessibilityLabel={opcao.rotulo}
                    />
                  ))}
                </View>
                <BadgeStatus tipo="prioridade" valor={nome} cor={corSegura} rotulo="Prévia da cor" />
                <InputPadrao rotulo="Ordem" valor={ordemTexto} aoMudar={setOrdemTexto} placeholder="Exemplo: 1" erro={erroOrdem} />
                <SelectPadrao rotulo="Ativa" valorTexto={ativaTexto} placeholder="Selecione" opcoes={OPCOES_ATIVA} aoMudar={setAtivaTexto} mensagemVazia="Nenhuma opção disponível." />
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
  selos: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: ESPACAMENTO.sm },
  linha: { fontSize: 13, color: CORES.textoSecundario },
  acoes: { flexDirection: 'row', gap: ESPACAMENTO.sm, alignSelf: 'stretch' },
  acao: { flex: 1 },
  separador: { height: ESPACAMENTO.md },
  erro: { fontSize: 13, color: CORES.perigo, textAlign: 'center' },
  erroCampo: { fontSize: 12, color: CORES.perigo },
  confirmacao: { fontSize: 13, color: CORES.sucesso, textAlign: 'center' },
  rotulo: { fontSize: 14, fontWeight: 'bold', color: CORES.texto, marginTop: ESPACAMENTO.lg, marginBottom: ESPACAMENTO.sm },
  paleta: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACAMENTO.md, marginBottom: ESPACAMENTO.md },
  cor: { width: 38, height: 38, borderRadius: RAIO.circular, borderWidth: 2, borderColor: 'transparent' },
  corSelecionada: { borderColor: CORES.texto },
  modalTela: { flex: 1 },
  fundo: { flex: 1, justifyContent: 'center', padding: ESPACAMENTO.lg, backgroundColor: 'rgba(15, 23, 42, 0.85)' },
  modalCartao: { maxHeight: '88%', borderRadius: RAIO.grande, borderWidth: 1, borderColor: CORES.borda, backgroundColor: CORES.superficie },
  modalConteudo: { padding: ESPACAMENTO.xl },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: CORES.texto, marginBottom: ESPACAMENTO.sm },
});
