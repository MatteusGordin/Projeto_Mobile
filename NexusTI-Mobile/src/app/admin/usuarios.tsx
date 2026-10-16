import { useCallback, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import axios from 'axios';
import Cabecalho from '../../componentes/Cabecalho';
import InputPadrao from '../../componentes/InputPadrao';
import BotaoPadrao from '../../componentes/BotaoPadrao';
import SelectPadrao from '../../componentes/SelectPadrao';
import type { OpcaoSelect } from '../../componentes/SelectPadrao';
import { atualizarUsuario, criarUsuario, deletarUsuario, listarUsuarios } from '../../api/usuarios';
import { listarSetores } from '../../api/setores';
import type { Setor, Usuario } from '../../types/models';

type UsuarioEnvio = Partial<Usuario> & { senha?: string; ativo?: boolean };

const OPCOES_PERFIL: OpcaoSelect[] = [
  { id: 'ADMIN', rotulo: 'ADMIN' },
  { id: 'TECNICO', rotulo: 'TECNICO' },
  { id: 'USUARIO', rotulo: 'USUARIO' },
];

const OPCOES_ATIVO: OpcaoSelect[] = [
  { id: 'true', rotulo: 'Sim' },
  { id: 'false', rotulo: 'Nao' },
];

export default function AdminUsuariosScreen() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [confirmacao, setConfirmacao] = useState<string>('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [perfilTexto, setPerfilTexto] = useState<string>('');
  const [idSetorTexto, setIdSetorTexto] = useState<string>('');
  const [ativoTexto, setAtivoTexto] = useState<string>('');
  const [opcoesSetores, setOpcoesSetores] = useState<OpcaoSelect[]>([]);

  const carregarDados = async (): Promise<void> => {
    setCarregando(true);
    setErro('');
    try {
      const resultados = await Promise.all([listarUsuarios(0, 20), listarSetores(0, 50)]);
      const pagina = resultados[0];
      const paginaSetores = resultados[1];
      const conteudo = pagina && pagina.content ? pagina.content : [];
      setUsuarios(conteudo);
      const conteudoSetores = paginaSetores && paginaSetores.content ? paginaSetores.content : [];
      setOpcoesSetores(
        conteudoSetores.map((item: Setor) => ({
          id: String(item.id),
          rotulo: item.nome !== null && item.nome !== undefined && item.nome !== '' ? item.nome : String(item.id),
        }))
      );
      if (conteudo.length === 0) {
        setErro('Nenhum usuario encontrado.');
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
          setErro('Falha ao listar usuarios. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else {
        setErro('Falha ao listar usuarios. Tente novamente.');
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
    setEmail('');
    setSenha('');
    setPerfilTexto('');
    setIdSetorTexto('');
    setAtivoTexto('');
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

  const iniciarEdicao = (item: Usuario): void => {
    setEditandoId(item.id);
    setNome(item.nome);
    setEmail(item.email);
    setPerfilTexto(item.perfil);
    setIdSetorTexto(String(item.idSetor));
    setSenha('');
    setAtivoTexto('');
    setErro('');
    setConfirmacao('');
  };

  const montarPayload = (): UsuarioEnvio | null => {
    const nomeNormalizado = nome.trim();
    const emailNormalizado = email.trim();
    const perfilNormalizado = perfilTexto.trim();
    const setorNormalizado = idSetorTexto.trim();
    const senhaNormalizada = senha.trim();
    const ativoNormalizado = ativoTexto.trim().toLowerCase();
    if (nomeNormalizado.length < 3) {
      setErro('Nome do usuario invalido.');
      return null;
    }
    if (emailNormalizado === '' || emailNormalizado.includes('@') === false) {
      setErro('Email do usuario invalido.');
      return null;
    }
    if (perfilNormalizado !== 'ADMIN' && perfilNormalizado !== 'TECNICO' && perfilNormalizado !== 'USUARIO') {
      setErro('Perfil do usuario invalido. Use ADMIN, TECNICO ou USUARIO.');
      return null;
    }
    const idSetor = Number(setorNormalizado);
    if (setorNormalizado === '' || Number.isNaN(idSetor) === true || idSetor <= 0) {
      setErro('Setor do usuario invalido.');
      return null;
    }
    if (editandoId === null && senhaNormalizada.length < 4) {
      setErro('Senha do usuario invalida.');
      return null;
    }
    if (editandoId !== null && senhaNormalizada !== '' && senhaNormalizada.length < 4) {
      setErro('Senha do usuario invalida.');
      return null;
    }
    const payload: UsuarioEnvio = {
      nome: nomeNormalizado,
      email: emailNormalizado,
      perfil: perfilNormalizado as Usuario['perfil'],
      idSetor: idSetor,
    };
    if (senhaNormalizada !== '') {
      payload.senha = senhaNormalizada;
    }
    if (ativoNormalizado === 'true') {
      payload.ativo = true;
    }
    if (ativoNormalizado === 'false') {
      payload.ativo = false;
    }
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
        const criado = await criarUsuario(payload);
        setConfirmacao('Usuario ' + String(criado.id) + ' criado com sucesso.');
      } else {
        const atualizado = await atualizarUsuario(editandoId, payload);
        setConfirmacao('Usuario ' + String(atualizado.id) + ' atualizado com sucesso.');
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
          setErro('Falha ao criar usuario. Tente novamente.');
        } else {
          setErro('Falha ao atualizar usuario. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else if (editandoId === null) {
        setErro('Falha ao criar usuario. Tente novamente.');
      } else {
        setErro('Falha ao atualizar usuario. Tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = (id: number): void => {
    Alert.alert('Excluir', 'Confirmar exclusao do usuario?', [
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
      await deletarUsuario(id);
      if (editandoId === id) {
        limparFormulario();
      }
      setConfirmacao('Usuario ' + String(id) + ' excluido com sucesso.');
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
          setErro('Falha ao excluir usuario. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else {
        setErro('Falha ao excluir usuario. Tente novamente.');
      }
    }
  };

  return (
    <View style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.container}>
        <Cabecalho titulo="Usuarios" subtitulo="Administracao" />
        <View style={estilos.formulario}>
          <Text style={estilos.tituloForm}>
            {editandoId === null ? 'Novo Usuario' : 'Editar Usuario'}
          </Text>
          <InputPadrao rotulo="Nome" valor={nome} aoMudar={setNome} placeholder="Nome completo" />
          <InputPadrao rotulo="Email" valor={email} aoMudar={setEmail} placeholder="voce@exemplo.com" />
          <InputPadrao
            rotulo="Senha"
            valor={senha}
            aoMudar={setSenha}
            placeholder="Minimo 4 caracteres"
            seguro={true}
          />
          <View style={estilos.selectAlto}>
            <SelectPadrao
              rotulo="Perfil"
              valorTexto={perfilTexto}
              placeholder="Selecione o perfil"
              opcoes={OPCOES_PERFIL}
              aoMudar={setPerfilTexto}
            />
          </View>
          <View style={estilos.selectMedio}>
            <SelectPadrao
              rotulo="Setor"
              valorTexto={idSetorTexto}
              placeholder="Selecione o setor"
              opcoes={opcoesSetores}
              aoMudar={setIdSetorTexto}
            />
          </View>
          <View style={estilos.selectBaixo}>
            <SelectPadrao
              rotulo="Ativo"
              valorTexto={ativoTexto}
              placeholder="Selecione"
              opcoes={OPCOES_ATIVO}
              aoMudar={setAtivoTexto}
            />
          </View>
          <BotaoPadrao
            titulo={salvando === true ? 'Salvando...' : editandoId === null ? 'Criar' : 'Salvar'}
            aoPressionar={submeter}
            desabilitado={salvando}
          />
        </View>
        <View style={estilos.lista}>
          {carregando === true ? (
            <Text style={estilos.carregando}>Carregando usuarios...</Text>
          ) : erro !== '' && usuarios.length === 0 ? (
            <Text style={estilos.erro}>{erro}</Text>
          ) : (
            usuarios.map((item: Usuario) => (
              <View key={String(item.id)} style={estilos.cartao}>
                <Text style={estilos.nome}>{textoDe(item.nome)}</Text>
                <Text style={estilos.linha}>{textoDe(item.email)}</Text>
                <Text style={estilos.linha}>{'Perfil: ' + textoDe(item.perfil)}</Text>
                <Text style={estilos.linha}>{'Setor: ' + numeroDe(item.idSetor)}</Text>
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
        {erro !== '' && usuarios.length > 0 ? <Text style={estilos.erro}>{erro}</Text> : null}
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
  selectAlto: {
    position: 'relative',
    zIndex: 30,
    elevation: 6,
  },
  selectMedio: {
    position: 'relative',
    zIndex: 20,
    elevation: 5,
  },
  selectBaixo: {
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
