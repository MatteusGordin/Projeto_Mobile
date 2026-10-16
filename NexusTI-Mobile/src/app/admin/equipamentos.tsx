import { useCallback, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import axios from 'axios';
import Cabecalho from '../../componentes/Cabecalho';
import InputPadrao from '../../componentes/InputPadrao';
import BotaoPadrao from '../../componentes/BotaoPadrao';
import SelectPadrao from '../../componentes/SelectPadrao';
import type { OpcaoSelect } from '../../componentes/SelectPadrao';
import { listarSetores } from '../../api/setores';
import type { Setor } from '../../types/models';
import {
  atualizarEquipamento,
  criarEquipamento,
  deletarEquipamento,
  listarEquipamentos,
} from '../../api/equipamentos';
import type { Equipamento } from '../../types/models';

const OPCOES_STATUS: OpcaoSelect[] = [
  { id: 'ATIVO', rotulo: 'ATIVO' },
  { id: 'INATIVO', rotulo: 'INATIVO' },
  { id: 'MANUTENCAO', rotulo: 'MANUTENCAO' },
];

export default function AdminEquipamentosScreen() {
  const router = useRouter();
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');
  const [confirmacao, setConfirmacao] = useState<string>('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [patrimonio, setPatrimonio] = useState<string>('');
  const [marca, setMarca] = useState<string>('');
  const [modelo, setModelo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [idSetorTexto, setIdSetorTexto] = useState<string>('');
  const [statusTexto, setStatusTexto] = useState<string>('');
  const [opcoesSetores, setOpcoesSetores] = useState<OpcaoSelect[]>([]);

  const carregarDados = async (): Promise<void> => {
    setCarregando(true);
    setErro('');
    try {
      const resultados = await Promise.all([listarEquipamentos(0, 20), listarSetores(0, 50)]);
      const pagina = resultados[0];
      const paginaSetores = resultados[1];
      const conteudo = pagina && pagina.content ? pagina.content : [];
      setEquipamentos(conteudo);
      const conteudoSetores = paginaSetores && paginaSetores.content ? paginaSetores.content : [];
      setOpcoesSetores(
        conteudoSetores.map((item: Setor) => ({
          id: String(item.id),
          rotulo: item.nome !== null && item.nome !== undefined && item.nome !== '' ? item.nome : String(item.id),
        }))
      );
      if (conteudo.length === 0) {
        setErro('Nenhum equipamento encontrado.');
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
          setErro('Falha ao listar equipamentos. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else {
        setErro('Falha ao listar equipamentos. Tente novamente.');
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
    setPatrimonio('');
    setMarca('');
    setModelo('');
    setDescricao('');
    setIdSetorTexto('');
    setStatusTexto('');
    setEditandoId(null);
  };

  const textoDe = (valor: string | null): string => {
    if (valor !== null && valor !== undefined && valor !== '') {
      return valor;
    }
    return 'Nao informado';
  };

  const nuloSeVazio = (valor: string): string | null => {
    const normalizado = valor.trim();
    if (normalizado === '') {
      return null;
    }
    return normalizado;
  };

  const iniciarEdicao = (item: Equipamento): void => {
    setEditandoId(item.id);
    setPatrimonio(item.patrimonio !== null && item.patrimonio !== undefined ? item.patrimonio : '');
    setMarca(item.marca !== null && item.marca !== undefined ? item.marca : '');
    setModelo(item.modelo !== null && item.modelo !== undefined ? item.modelo : '');
    setDescricao(item.descricao !== null && item.descricao !== undefined ? item.descricao : '');
    setIdSetorTexto(item.idSetor !== null && item.idSetor !== undefined ? String(item.idSetor) : '');
    setStatusTexto(item.status !== null && item.status !== undefined ? item.status : '');
    setErro('');
    setConfirmacao('');
  };

  const montarPayload = (): Partial<Equipamento> | null => {
    const patrimonioNormalizado = patrimonio.trim();
    const marcaNormalizada = marca.trim();
    const modeloNormalizado = modelo.trim();
    const setorNormalizado = idSetorTexto.trim();
    if (patrimonioNormalizado.length < 3) {
      setErro('Patrimonio do equipamento invalido.');
      return null;
    }
    if (marcaNormalizada === '') {
      setErro('Marca do equipamento invalida.');
      return null;
    }
    if (modeloNormalizado === '') {
      setErro('Modelo do equipamento invalido.');
      return null;
    }
    let idSetor: number | null = null;
    if (setorNormalizado !== '') {
      const numerico = Number(setorNormalizado);
      if (Number.isNaN(numerico) === true || numerico <= 0) {
        setErro('Setor do equipamento invalido.');
        return null;
      }
      idSetor = numerico;
    }
    const payload: Partial<Equipamento> = {
      patrimonio: patrimonioNormalizado,
      marca: marcaNormalizada,
      modelo: modeloNormalizado,
      descricao: nuloSeVazio(descricao),
      idSetor: idSetor,
      status: nuloSeVazio(statusTexto),
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
        const criado = await criarEquipamento(payload);
        setConfirmacao('Equipamento ' + String(criado.id) + ' criado com sucesso.');
      } else {
        const atualizado = await atualizarEquipamento(editandoId, payload);
        setConfirmacao('Equipamento ' + String(atualizado.id) + ' atualizado com sucesso.');
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
          setErro('Falha ao criar equipamento. Tente novamente.');
        } else {
          setErro('Falha ao atualizar equipamento. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else if (editandoId === null) {
        setErro('Falha ao criar equipamento. Tente novamente.');
      } else {
        setErro('Falha ao atualizar equipamento. Tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = (id: number): void => {
    Alert.alert('Excluir', 'Confirmar exclusao do equipamento?', [
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
      await deletarEquipamento(id);
      if (editandoId === id) {
        limparFormulario();
      }
      setConfirmacao('Equipamento ' + String(id) + ' excluido com sucesso.');
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
          setErro('Falha ao excluir equipamento. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else {
        setErro('Falha ao excluir equipamento. Tente novamente.');
      }
    }
  };

  return (
    <View style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.container}>
        <Cabecalho titulo="Equipamentos" subtitulo="Administracao" />
        <View style={estilos.formulario}>
          <Text style={estilos.tituloForm}>
            {editandoId === null ? 'Novo Equipamento' : 'Editar Equipamento'}
          </Text>
          <InputPadrao rotulo="Patrimonio" valor={patrimonio} aoMudar={setPatrimonio} placeholder="Exemplo: NB-001" />
          <InputPadrao rotulo="Marca" valor={marca} aoMudar={setMarca} placeholder="Exemplo: Dell" />
          <InputPadrao rotulo="Modelo" valor={modelo} aoMudar={setModelo} placeholder="Exemplo: Latitude" />
          <InputPadrao rotulo="Descricao" valor={descricao} aoMudar={setDescricao} placeholder="Descricao opcional" />
          <View style={estilos.selectAlto}>
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
              rotulo="Status"
              valorTexto={statusTexto}
              placeholder="Selecione o status"
              opcoes={OPCOES_STATUS}
              aoMudar={setStatusTexto}
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
            <Text style={estilos.carregando}>Carregando equipamentos...</Text>
          ) : erro !== '' && equipamentos.length === 0 ? (
            <Text style={estilos.erro}>{erro}</Text>
          ) : (
            equipamentos.map((item: Equipamento) => (
              <View key={String(item.id)} style={estilos.cartao}>
                <Text style={estilos.patrimonio}>{textoDe(item.patrimonio)}</Text>
                <Text style={estilos.linha}>{'Marca: ' + textoDe(item.marca)}</Text>
                <Text style={estilos.linha}>{'Modelo: ' + textoDe(item.modelo)}</Text>
                <Text style={estilos.linha}>{'Status: ' + textoDe(item.status)}</Text>
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
        {erro !== '' && equipamentos.length > 0 ? <Text style={estilos.erro}>{erro}</Text> : null}
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
  patrimonio: {
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
