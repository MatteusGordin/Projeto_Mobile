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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Cabecalho from '../../componentes/Cabecalho';
import InputPadrao from '../../componentes/InputPadrao';
import BotaoPadrao from '../../componentes/BotaoPadrao';
import SelectPadrao from '../../componentes/SelectPadrao';
import type { OpcaoSelect } from '../../componentes/SelectPadrao';
import BadgeStatus from '../../componentes/BadgeStatus';
import EstadoCarregando from '../../componentes/EstadoCarregando';
import EstadoErro from '../../componentes/EstadoErro';
import EstadoVazio from '../../componentes/EstadoVazio';
import { atualizarUsuario, criarUsuario, deletarUsuario, listarUsuarios } from '../../api/usuarios';
import { listarOpcoesSetores } from '../../api/setores';
import { mensagemErroApi } from '../../utils/errosApi';
import { CORES, ESPACAMENTO, RAIO } from '../../tema/cores';
import type { Setor, Usuario } from '../../types/models';

type UsuarioEnvio = Partial<Usuario> & { senha?: string };

const OPCOES_PERFIL: OpcaoSelect[] = [
  { id: 'ADMIN', rotulo: 'Administrador' },
  { id: 'TECNICO', rotulo: 'Técnico' },
  { id: 'USUARIO', rotulo: 'Usuário' },
];

const OPCOES_ATIVO: OpcaoSelect[] = [
  { id: 'true', rotulo: 'Sim' },
  { id: 'false', rotulo: 'Não' },
];

export default function AdminUsuariosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [opcoesSetores, setOpcoesSetores] = useState<OpcaoSelect[]>([]);
  const [busca, setBusca] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [confirmacao, setConfirmacao] = useState<string>('');
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [perfilTexto, setPerfilTexto] = useState<string>('');
  const [idSetorTexto, setIdSetorTexto] = useState<string>('');
  const [ativoTexto, setAtivoTexto] = useState<string>('true');
  const [tentativa, setTentativa] = useState<boolean>(false);

  const carregarDados = useCallback(async (): Promise<void> => {
    setCarregando(true);
    try {
      const [pagina, opcoes] = await Promise.all([listarUsuarios(0, 200), listarOpcoesSetores()]);
      setUsuarios(pagina && Array.isArray(pagina.content) ? pagina.content : []);
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
  const filtrados = usuarios.filter((item: Usuario) => {
    if (termo === '') {
      return true;
    }
    const nomeSetor = nomesSetores.get(String(item.idSetor)) ?? '';
    return (item.nome + ' ' + item.email + ' ' + item.perfil + ' ' + nomeSetor).toLowerCase().includes(termo);
  });

  const abrirNovo = (): void => {
    setEditandoId(null);
    setNome('');
    setEmail('');
    setSenha('');
    setPerfilTexto('');
    setIdSetorTexto('');
    setAtivoTexto('true');
    setTentativa(false);
    setErro('');
    setModalAberto(true);
  };

  const iniciarEdicao = (item: Usuario): void => {
    setEditandoId(item.id);
    setNome(item.nome);
    setEmail(item.email);
    setSenha('');
    setPerfilTexto(item.perfil);
    setIdSetorTexto(String(item.idSetor));
    setAtivoTexto(item.ativo === false ? 'false' : 'true');
    setTentativa(false);
    setErro('');
    setModalAberto(true);
  };

  const fecharModal = (): void => {
    setModalAberto(false);
  };

  const erroNome = tentativa === true && nome.trim().length < 3 ? 'Informe um nome com pelo menos 3 caracteres.' : undefined;
  const erroEmail = tentativa === true && !email.includes('@') ? 'Informe um e-mail válido.' : undefined;
  const erroSenha = tentativa === true && (editandoId === null || senha.trim() !== '') && senha.trim().length < 4 ? 'A senha deve ter pelo menos 4 caracteres.' : undefined;
  const erroPerfil = tentativa === true && perfilTexto === '' ? 'Selecione o perfil.' : undefined;
  const erroSetor = tentativa === true && Number(idSetorTexto) <= 0 ? 'Selecione o setor.' : undefined;

  const submeter = async (): Promise<void> => {
    if (salvando === true) {
      return;
    }
    setTentativa(true);
    const idSetor = Number(idSetorTexto);
    const senhaNormalizada = senha.trim();
    if (
      nome.trim().length < 3 ||
      !email.includes('@') ||
      !['ADMIN', 'TECNICO', 'USUARIO'].includes(perfilTexto) ||
      Number.isNaN(idSetor) === true ||
      idSetor <= 0 ||
      (editandoId === null || senhaNormalizada !== '') && senhaNormalizada.length < 4
    ) {
      return;
    }
    const dados: UsuarioEnvio = {
      nome: nome.trim(),
      email: email.trim(),
      perfil: perfilTexto as Usuario['perfil'],
      idSetor: idSetor,
      ativo: ativoTexto === 'true',
    };
    if (senhaNormalizada !== '') {
      dados.senha = senhaNormalizada;
    }
    setSalvando(true);
    setErro('');
    try {
      if (editandoId === null) {
        await criarUsuario(dados);
        setConfirmacao('Usuário criado com sucesso.');
      } else {
        await atualizarUsuario(editandoId, dados);
        setConfirmacao('Usuário atualizado com sucesso.');
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
      await deletarUsuario(id);
      setConfirmacao('Usuário excluído com sucesso.');
      await carregarDados();
    } catch (falha) {
      setErro(mensagemErroApi(falha));
    }
  };

  const confirmarExclusao = (item: Usuario): void => {
    Alert.alert('Excluir usuário', 'Deseja excluir o usuário ' + item.nome + '?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => void excluir(item.id) },
    ]);
  };

  const voltar = (): void => {
    router.back();
  };

  const cabecalhoLista = (
    <View style={estilos.cabecalhoLista}>
      <Cabecalho titulo="Usuários" subtitulo="Administração" />
      <BotaoPadrao titulo="+ Novo usuário" aoPressionar={abrirNovo} icone="add-outline" />
      <InputPadrao rotulo="Buscar" valor={busca} aoMudar={setBusca} placeholder="Nome, e-mail, perfil ou setor" />
      {erro !== '' ? <Text style={estilos.erro}>{erro}</Text> : null}
      {confirmacao !== '' ? <Text style={estilos.confirmacao}>{confirmacao}</Text> : null}
      <Text style={estilos.tituloSecao}>Cadastrados ({String(filtrados.length)})</Text>
    </View>
  );

  return (
    <>
      <FlatList
        style={estilos.tela}
        contentContainerStyle={[estilos.container, { paddingBottom: insets.bottom + ESPACAMENTO.xl }]}
        data={filtrados}
        keyExtractor={(item: Usuario) => String(item.id)}
        renderItem={({ item }: { item: Usuario }) => (
          <View style={estilos.cartao}>
            <Text style={estilos.titulo}>{item.nome}</Text>
            <Text style={estilos.linha}>{item.email}</Text>
            <View style={estilos.selos}>
              <BadgeStatus tipo="perfil" valor={item.perfil} />
              <BadgeStatus tipo="prioridade" rotulo={item.ativo === false ? 'Inativo' : 'Ativo'} cor={item.ativo === false ? CORES.textoSecundario : CORES.sucesso} />
            </View>
            <Text style={estilos.linha}>{'Setor: ' + (nomesSetores.get(String(item.idSetor)) ?? 'Não informado')}</Text>
            <View style={estilos.acoes}>
              <View style={estilos.acao}>
                <BotaoPadrao titulo="Editar" aoPressionar={() => iniciarEdicao(item)} icone="create-outline" variante="fantasma" tamanho="compacto" />
              </View>
              <View style={estilos.acao}>
                <BotaoPadrao titulo="Excluir" aoPressionar={() => confirmarExclusao(item)} icone="trash-outline" variante="perigo" tamanho="compacto" />
              </View>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={estilos.separador} />}
        ListHeaderComponent={cabecalhoLista}
        ListEmptyComponent={
          carregando === true ? (
            <EstadoCarregando mensagem="Carregando usuários..." />
          ) : erro !== '' ? (
            <EstadoErro mensagem={erro} aoTentarNovamente={() => void carregarDados()} />
          ) : (
            <EstadoVazio titulo="Nenhum usuário encontrado" subtitulo="Cadastre um usuário para começar." />
          )
        }
        ListFooterComponent={<BotaoPadrao titulo="Voltar" aoPressionar={voltar} variante="fantasma" />}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={() => void carregarDados()} tintColor={CORES.primario} colors={[CORES.primario]} />}
      />
      <Modal visible={modalAberto} transparent animationType="slide" onRequestClose={fecharModal} statusBarTranslucent>
        <KeyboardAvoidingView style={estilos.modalTela} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={estilos.fundo} onPress={fecharModal}>
            <Pressable style={estilos.modalCartao} onPress={() => undefined} accessibilityLabel="Formulário de usuário">
              <ScrollView contentContainerStyle={estilos.modalConteudo} keyboardShouldPersistTaps="handled">
                <Text style={estilos.modalTitulo}>{editandoId === null ? 'Novo usuário' : 'Editar usuário'}</Text>
                <InputPadrao rotulo="Nome" valor={nome} aoMudar={setNome} placeholder="Nome completo" erro={erroNome} />
                <InputPadrao rotulo="E-mail" valor={email} aoMudar={setEmail} placeholder="voce@exemplo.com" erro={erroEmail} />
                <InputPadrao rotulo="Senha" valor={senha} aoMudar={setSenha} placeholder={editandoId === null ? 'Mínimo 4 caracteres' : 'Deixe em branco para manter'} alternarSenha={true} erro={erroSenha} />
                <SelectPadrao rotulo="Perfil" valorTexto={perfilTexto} placeholder="Selecione o perfil" opcoes={OPCOES_PERFIL} aoMudar={setPerfilTexto} mensagemVazia="Nenhum perfil disponível." />
                {erroPerfil !== undefined ? <Text style={estilos.erroCampo}>{erroPerfil}</Text> : null}
                <SelectPadrao rotulo="Setor" valorTexto={idSetorTexto} placeholder="Selecione o setor" opcoes={opcoesSetores} aoMudar={setIdSetorTexto} mensagemVazia="Nenhum setor cadastrado." />
                {erroSetor !== undefined ? <Text style={estilos.erroCampo}>{erroSetor}</Text> : null}
                <SelectPadrao rotulo="Ativo" valorTexto={ativoTexto} placeholder="Selecione" opcoes={OPCOES_ATIVO} aoMudar={setAtivoTexto} mensagemVazia="Nenhuma opção disponível." />
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
  selos: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACAMENTO.sm },
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
