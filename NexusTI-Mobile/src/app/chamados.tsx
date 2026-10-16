import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import axios from 'axios';
import Cabecalho from '../componentes/Cabecalho';
import CardChamado from '../componentes/CardChamado';
import BotaoPadrao from '../componentes/BotaoPadrao';
import SelectPadrao from '../componentes/SelectPadrao';
import type { OpcaoSelect } from '../componentes/SelectPadrao';
import { listarChamados } from '../api/chamados';
import { lerPerfil } from '../auth/session';
import type { ChamadoResposta, PerfilResposta } from '../types/models';

const OPCOES_STATUS: OpcaoSelect[] = [
  { id: 'TODOS', rotulo: 'Todos' },
  { id: 'ABERTO', rotulo: 'Aberto' },
  { id: 'EM_ANDAMENTO', rotulo: 'Em Andamento' },
  { id: 'FECHADO', rotulo: 'Fechado' },
];

export default function ChamadosScreen() {
  const router = useRouter();
  const [chamados, setChamados] = useState<ChamadoResposta[]>([]);
  const [perfil, setPerfil] = useState<PerfilResposta | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>('');

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      const carregar = async (): Promise<void> => {
        setCarregando(true);
        setErro('');
        try {
          const resultados = await Promise.all([listarChamados(0, 50), lerPerfil().catch(() => null)]);
          if (ativo === false) {
            return;
          }
          const pagina = resultados[0];
          const perfilSalvo = resultados[1] as PerfilResposta | null;
          const conteudo = pagina && pagina.content ? pagina.content : [];
          setChamados(conteudo);
          setPerfil(perfilSalvo);
          if (conteudo.length === 0) {
            setErro('Nenhum chamado encontrado.');
          }
        } catch (falha) {
          if (ativo === false) {
            return;
          }
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
            } else {
              setErro('Falha ao listar chamados. Tente novamente.');
            }
          } else if (falha instanceof Error) {
            setErro(falha.message);
          } else {
            setErro('Falha ao listar chamados. Tente novamente.');
          }
        } finally {
          if (ativo === true) {
            setCarregando(false);
          }
        }
      };
      carregar();
      return () => {
        ativo = false;
      };
    }, [])
  );

  const irParaDetalhe = (id: number): void => {
    router.push({ pathname: '/detalhe', params: { id: String(id) } } as never);
  };

  const voltar = (): void => {
    router.back();
  };

  const equipamentoDe = (item: ChamadoResposta): string => {
    if (item.titulo !== null && item.titulo !== undefined && item.titulo !== '') {
      return item.titulo;
    }
    if (item.idEquipamento !== null && item.idEquipamento !== undefined) {
      return String(item.idEquipamento);
    }
    return String(item.id);
  };

  const visiveis = chamados.filter((item: ChamadoResposta) => {
    if (perfil !== null && perfil.perfil === 'USUARIO') {
      if (item.idSolicitante === null || item.idSolicitante === undefined || item.idSolicitante !== perfil.id) {
        return false;
      }
    }
    if (filtroStatus !== 'TODOS') {
      if (item.status === null || item.status === undefined || item.status !== filtroStatus) {
        return false;
      }
    }
    return true;
  });

  return (
    <View style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.container}>
        <Cabecalho titulo="Gerenciar Chamados" subtitulo="Listagem gerencial" />
        <View style={estilos.filtroZona}>
          <SelectPadrao
            rotulo="Status"
            valorTexto={filtroStatus}
            placeholder="Selecione o status"
            opcoes={OPCOES_STATUS}
            aoMudar={setFiltroStatus}
          />
        </View>
        <View style={estilos.lista}>
          {carregando === true ? (
            <Text style={estilos.carregando}>Carregando chamados...</Text>
          ) : erro !== '' && visiveis.length === 0 ? (
            <Text style={estilos.erro}>{erro}</Text>
          ) : visiveis.length === 0 ? (
            <Text style={estilos.erro}>Nenhum chamado encontrado.</Text>
          ) : (
            visiveis.map((item: ChamadoResposta) => (
              <CardChamado
                key={String(item.id)}
                equipamento={equipamentoDe(item)}
                descricao={item.descricao}
                status={item.status}
                prioridade={item.prioridade}
                dataAbertura={item.dataAbertura}
                corPrioridade={item.corPrioridade}
                aoPressionar={() => irParaDetalhe(item.id)}
              />
            ))
          )}
        </View>
        {erro !== '' && visiveis.length > 0 ? <Text style={estilos.erro}>{erro}</Text> : null}
        <View style={estilos.rodape}>
          <BotaoPadrao titulo="Voltar" aoPressionar={voltar} desabilitado={carregando} />
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
  filtroZona: {
    position: 'relative',
    zIndex: 10,
    elevation: 4,
    marginBottom: 12,
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
  rodape: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 24,
  },
});
