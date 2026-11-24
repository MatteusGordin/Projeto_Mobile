import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import axios from 'axios';
import Cabecalho from '../componentes/Cabecalho';
import CardChamado from '../componentes/CardChamado';
import BotaoPadrao from '../componentes/BotaoPadrao';
import InputPadrao from '../componentes/InputPadrao';
import SelectPadrao from '../componentes/SelectPadrao';
import type { OpcaoSelect } from '../componentes/SelectPadrao';
import EstadoCarregando from '../componentes/EstadoCarregando';
import EstadoErro from '../componentes/EstadoErro';
import EstadoVazio from '../componentes/EstadoVazio';
import { listarChamados } from '../api/chamados';
import { listarOpcoesPrioridades } from '../api/prioridades';
import { listarOpcoesSetores } from '../api/setores';
import { CORES, ESPACAMENTO, RAIO } from '../tema/cores';
import type { ChamadoResposta, Prioridade, Setor } from '../types/models';

const OPCOES_STATUS: OpcaoSelect[] = [
  { id: 'TODOS', rotulo: 'Todos' },
  { id: 'ABERTO', rotulo: 'Aberto' },
  { id: 'FECHADO', rotulo: 'Fechado' },
];

const TAMANHO_PAGINA = 20;

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
  }
  return 'Falha ao carregar chamados. Tente novamente.';
}

function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function ChamadosScreen() {
  const router = useRouter();
  const [chamados, setChamados] = useState<ChamadoResposta[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('');
  const [filtroSetor, setFiltroSetor] = useState<string>('');
  const [busca, setBusca] = useState<string>('');
  const [opcoesPrioridades, setOpcoesPrioridades] = useState<OpcaoSelect[]>([]);
  const [opcoesSetores, setOpcoesSetores] = useState<OpcaoSelect[]>([]);
  const [paginaAtual, setPaginaAtual] = useState<number>(0);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [carregandoMais, setCarregandoMais] = useState<boolean>(false);
  const [erro, setErro] = useState<string>('');

  useEffect(() => {
    let ativo = true;
    const carregarOpcoes = async (): Promise<void> => {
      try {
        const [prioridades, setores] = await Promise.all([
          listarOpcoesPrioridades(),
          listarOpcoesSetores(),
        ]);
        if (ativo === false) {
          return;
        }
        setOpcoesPrioridades(
          prioridades
            .filter((item: Prioridade) => item.nome !== null && item.nome !== '')
            .map((item: Prioridade) => ({ id: String(item.nome), rotulo: String(item.nome) }))
        );
        setOpcoesSetores(
          setores.map((item: Setor) => ({
            id: String(item.id),
            rotulo:
              item.nome !== null && item.nome !== ''
                ? item.nome + (item.sigla !== null && item.sigla !== '' ? ' (' + item.sigla + ')' : '')
                : 'Setor #' + String(item.id),
          }))
        );
      } catch (falha) {
        if (ativo === true) {
          setErro(mensagemErro(falha));
        }
      }
    };
    void carregarOpcoes();
    return () => {
      ativo = false;
    };
  }, []);

  const carregar = useCallback(
    async (pagina: number, substituir: boolean): Promise<void> => {
      if (pagina === 0) {
        setCarregando(true);
      } else {
        setCarregandoMais(true);
      }
      setErro('');
      try {
        const resposta = await listarChamados({
          page: pagina,
          size: TAMANHO_PAGINA,
          status: filtroStatus === 'TODOS' ? null : filtroStatus,
          prioridade: filtroPrioridade === '' ? null : filtroPrioridade,
          idSetor: filtroSetor === '' ? null : filtroSetor,
          sort: 'dataAbertura,DESC',
        });
        const conteudo = resposta && Array.isArray(resposta.content) ? resposta.content : [];
        setChamados((atual: ChamadoResposta[]) => (substituir === true ? conteudo : atual.concat(conteudo)));
        setPaginaAtual(typeof resposta.number === 'number' ? resposta.number : pagina);
        setTotalPaginas(typeof resposta.totalPages === 'number' ? resposta.totalPages : 1);
      } catch (falha) {
        setErro(mensagemErro(falha));
        if (substituir === true) {
          setChamados([]);
        }
      } finally {
        setCarregando(false);
        setCarregandoMais(false);
      }
    },
    [filtroStatus, filtroPrioridade, filtroSetor]
  );

  useFocusEffect(
    useCallback(() => {
      void carregar(0, true);
    }, [carregar])
  );

  const carregarMais = (): void => {
    if (carregandoMais === true || paginaAtual + 1 >= totalPaginas) {
      return;
    }
    void carregar(paginaAtual + 1, false);
  };

  const recarregar = (): void => {
    void carregar(0, true);
  };

  const irParaDetalhe = (id: number): void => {
    router.push({ pathname: '/detalhe', params: { id: String(id) } } as never);
  };

  const irParaNovoChamado = (): void => {
    router.push('/novo-chamado');
  };

  const voltar = (): void => {
    router.back();
  };

  const rotuloEquipamento = (item: ChamadoResposta): string | null => {
    if (item.idEquipamento === null || item.idEquipamento === undefined) {
      return null;
    }
    return '#' + String(item.idEquipamento);
  };

  const termo = semAcento(busca.trim());
  const visiveis = chamados.filter((item: ChamadoResposta) => {
    if (termo === '') {
      return true;
    }
    return semAcento(item.titulo + ' ' + item.descricao).includes(termo);
  });
  const podeCarregarMais = totalPaginas > 1 && paginaAtual + 1 < totalPaginas;

  const cabecalhoLista = (
    <View style={estilos.cabecalhoLista}>
      <Cabecalho titulo="Chamados" subtitulo="Lista com filtros do servidor" />
      <InputPadrao
        rotulo="Buscar"
        valor={busca}
        aoMudar={setBusca}
        placeholder="Busque por título ou descrição"
      />
      <View style={estilos.filtros}>
        <SelectPadrao
          rotulo="Status"
          valorTexto={filtroStatus}
          placeholder="Selecione o status"
          opcoes={OPCOES_STATUS}
          aoMudar={setFiltroStatus}
          mensagemVazia="Nenhum status disponível."
        />
        <SelectPadrao
          rotulo="Prioridade"
          valorTexto={filtroPrioridade}
          placeholder="Todas as prioridades"
          opcoes={opcoesPrioridades}
          aoMudar={setFiltroPrioridade}
          mensagemVazia="Nenhuma prioridade ativa."
        />
        <SelectPadrao
          rotulo="Setor"
          valorTexto={filtroSetor}
          placeholder="Todos os setores"
          opcoes={opcoesSetores}
          aoMudar={setFiltroSetor}
          mensagemVazia="Nenhum setor cadastrado."
        />
      </View>
      {erro !== '' && visiveis.length > 0 ? <Text style={estilos.erro}>{erro}</Text> : null}
      <Text style={estilos.tituloSecao}>Resultados ({String(visiveis.length)})</Text>
    </View>
  );

  return (
    <FlatList
      style={estilos.tela}
      contentContainerStyle={estilos.container}
      data={visiveis}
      keyExtractor={(item: ChamadoResposta) => String(item.id)}
      renderItem={({ item }: { item: ChamadoResposta }) => (
        <CardChamado
          titulo={item.titulo}
          equipamento={rotuloEquipamento(item)}
          descricao={item.descricao}
          status={item.status}
          prioridade={item.prioridade}
          corPrioridade={item.corPrioridade}
          dataAbertura={item.dataAbertura}
          aoPressionar={() => irParaDetalhe(item.id)}
        />
      )}
      ItemSeparatorComponent={() => <View style={estilos.separador} />}
      ListHeaderComponent={cabecalhoLista}
      ListEmptyComponent={
        carregando === true ? (
          <EstadoCarregando mensagem="Carregando chamados..." />
        ) : erro !== '' ? (
          <EstadoErro mensagem={erro} aoTentarNovamente={recarregar} />
        ) : (
          <EstadoVazio
            titulo="Nenhum chamado encontrado"
            subtitulo="Ajuste os filtros ou abra um novo chamado."
            acao={{ titulo: 'Novo chamado', aoPressionar: irParaNovoChamado }}
          />
        )
      }
      ListFooterComponent={
        <View style={estilos.rodape}>
          {podeCarregarMais === true ? (
            <BotaoPadrao
              titulo={carregandoMais === true ? 'Carregando...' : 'Carregar mais'}
              aoPressionar={carregarMais}
              carregando={carregandoMais}
              variante="secundario"
            />
          ) : null}
          <BotaoPadrao titulo="Voltar" aoPressionar={voltar} variante="fantasma" />
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={carregando}
          onRefresh={recarregar}
          tintColor={CORES.primario}
          colors={[CORES.primario]}
        />
      }
    />
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
  cabecalhoLista: {
    gap: ESPACAMENTO.sm,
    marginBottom: ESPACAMENTO.lg,
  },
  filtros: {
    gap: ESPACAMENTO.sm,
    padding: ESPACAMENTO.md,
    borderRadius: RAIO.medio,
    borderWidth: 1,
    borderColor: CORES.borda,
    backgroundColor: CORES.superficie,
  },
  tituloSecao: {
    fontSize: 15,
    fontWeight: 'bold',
    color: CORES.texto,
    marginTop: ESPACAMENTO.sm,
  },
  erro: {
    fontSize: 13,
    color: CORES.perigo,
    textAlign: 'center',
  },
  separador: {
    height: ESPACAMENTO.md,
  },
  rodape: {
    gap: ESPACAMENTO.sm,
    marginTop: ESPACAMENTO.lg,
  },
});
