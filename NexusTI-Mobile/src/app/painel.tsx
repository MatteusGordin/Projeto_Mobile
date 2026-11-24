import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CardChamado from '../componentes/CardChamado';
import BotaoPadrao from '../componentes/BotaoPadrao';
import BadgeStatus from '../componentes/BadgeStatus';
import EstadoCarregando from '../componentes/EstadoCarregando';
import EstadoErro from '../componentes/EstadoErro';
import EstadoVazio from '../componentes/EstadoVazio';
import ModalPerfil from '../componentes/ModalPerfil';
import { listarChamados, obterMetricas, obterMetricasPrioridades } from '../api/chamados';
import { apagarPerfil, apagarToken, lerPerfil } from '../auth/session';
import { mensagemErroApi } from '../utils/errosApi';
import { CORES, ESPACAMENTO, RAIO } from '../tema/cores';
import type { ChamadoResposta, MetricasChamados, MetricasPrioridades, PerfilResposta } from '../types/models';

export default function PainelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [chamados, setChamados] = useState<ChamadoResposta[]>([]);
  const [perfil, setPerfil] = useState<PerfilResposta | null>(null);
  const [abertos, setAbertos] = useState<number>(0);
  const [fechados, setFechados] = useState<number>(0);
  const [porPrioridade, setPorPrioridade] = useState<MetricasPrioridades>({});
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>('');
  const [perfilAberto, setPerfilAberto] = useState<boolean>(false);

  const carregar = useCallback(async (): Promise<void> => {
    setCarregando(true);
    setErro('');
    try {
      const resultado = await Promise.all([
        listarChamados({ page: 0, size: 20, sort: 'dataAbertura,DESC' }),
        obterMetricas().catch(() => null),
        obterMetricasPrioridades().catch(() => ({})),
        lerPerfil().catch(() => null),
      ]);
      const pagina = resultado[0];
      const metricas = resultado[1] as MetricasChamados | null;
      const metricasPrioridade = resultado[2] as MetricasPrioridades;
      const perfilSalvo = resultado[3] as PerfilResposta | null;
      setChamados(pagina && Array.isArray(pagina.content) ? pagina.content : []);
      setPerfil(perfilSalvo);
      if (metricas !== null) {
        setAbertos(typeof metricas.abertos === 'number' ? metricas.abertos : 0);
        setFechados(typeof metricas.fechados === 'number' ? metricas.fechados : 0);
      }
      setPorPrioridade(metricasPrioridade !== null && typeof metricasPrioridade === 'object' ? metricasPrioridade : {});
    } catch (falha) {
      setErro(mensagemErroApi(falha));
      setChamados([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar])
  );

  const irParaDetalhe = (id: number): void => {
    router.push({ pathname: '/detalhe', params: { id: String(id) } } as never);
  };

  const irParaNovoChamado = (): void => {
    router.push('/novo-chamado');
  };

  const sair = async (): Promise<void> => {
    await apagarToken();
    await apagarPerfil();
    router.replace('/');
  };

  const rotuloEquipamento = (item: ChamadoResposta): string | null => {
    if (item.idEquipamento === null || item.idEquipamento === undefined) {
      return null;
    }
    return '#' + String(item.idEquipamento);
  };

  const entradasPrioridade = Object.entries(porPrioridade);
  const nomeUsuario = perfil !== null && perfil.nome !== '' ? perfil.nome : 'usuário';

  const cabecalhoLista = (
    <View style={estilos.cabecalhoLista}>
      <View style={estilos.boasVindas}>
        <View style={estilos.textoBoasVindas}>
          <Text style={estilos.saudacao}>{'Olá, ' + nomeUsuario + '!'}</Text>
          <Text style={estilos.subtitulo}>Acompanhe a operação de chamados em tempo real.</Text>
        </View>
        {perfil !== null ? <BadgeStatus tipo="perfil" valor={perfil.perfil} /> : null}
        <Pressable
          style={estilos.botaoPerfil}
          onPress={() => setPerfilAberto(true)}
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil do usuário"
        >
          <Ionicons name="person-circle-outline" size={30} color={CORES.primario} />
        </Pressable>
      </View>
      <BotaoPadrao
        titulo="Abrir Novo Chamado"
        aoPressionar={irParaNovoChamado}
        icone="add-circle-outline"
      />
      <View style={estilos.kpis}>
        <View style={estilos.cartaoKpi}>
          <Ionicons name="alert-circle-outline" size={20} color={CORES.atencao} />
          <Text style={estilos.numeroKpi}>{String(abertos)}</Text>
          <Text style={estilos.rotuloKpi}>Abertos</Text>
        </View>
        <View style={estilos.cartaoKpi}>
          <Ionicons name="checkmark-circle-outline" size={20} color={CORES.sucesso} />
          <Text style={estilos.numeroKpi}>{String(fechados)}</Text>
          <Text style={estilos.rotuloKpi}>Fechados</Text>
        </View>
        <View style={estilos.cartaoKpi}>
          <Ionicons name="pie-chart-outline" size={20} color={CORES.primario} />
          <Text style={estilos.numeroKpi}>{String(entradasPrioridade.length)}</Text>
          <Text style={estilos.rotuloKpi}>Prioridades</Text>
        </View>
      </View>
      {entradasPrioridade.length > 0 ? (
        <View style={estilos.distribuicao}>
          {entradasPrioridade.slice(0, 4).map(([chave, total]: [string, number]) => (
            <BadgeStatus
              key={chave}
              tipo="prioridade"
              valor={chave}
              rotulo={(chave === '' ? 'Sem prioridade' : chave) + ': ' + String(total)}
            />
          ))}
        </View>
      ) : null}
      <Text style={estilos.tituloSecao}>Últimos Chamados</Text>
      <View style={estilos.separadorTitulo} />
    </View>
  );

  return (
    <>
      <FlatList
        style={estilos.tela}
        contentContainerStyle={[estilos.container, { paddingBottom: insets.bottom + ESPACAMENTO.xl }]}
        data={chamados}
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
        ItemSeparatorComponent={() => <View style={estilos.separadorItem} />}
        ListHeaderComponent={cabecalhoLista}
        ListEmptyComponent={
          carregando === true ? (
            <EstadoCarregando mensagem="Carregando chamados..." />
          ) : erro !== '' ? (
            <EstadoErro mensagem={erro} aoTentarNovamente={() => void carregar()} />
          ) : (
            <EstadoVazio
              titulo="Nenhum chamado encontrado"
              subtitulo="Abra um novo chamado para começar o atendimento."
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={carregando}
            onRefresh={() => void carregar()}
            tintColor={CORES.primario}
            colors={[CORES.primario]}
          />
        }
      />
      <ModalPerfil
        visivel={perfilAberto}
        perfil={perfil}
        aoFechar={() => setPerfilAberto(false)}
        aoSair={() => void sair()}
      />
    </>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: CORES.fundo },
  container: { padding: ESPACAMENTO.xl, backgroundColor: CORES.fundo },
  cabecalhoLista: { gap: ESPACAMENTO.md, marginBottom: ESPACAMENTO.lg },
  boasVindas: { flexDirection: 'row', alignItems: 'center', gap: ESPACAMENTO.md },
  textoBoasVindas: { flex: 1, gap: ESPACAMENTO.xs },
  saudacao: { fontSize: 20, fontWeight: 'bold', color: CORES.texto },
  subtitulo: { fontSize: 12, color: CORES.textoSecundario },
  botaoPerfil: { padding: ESPACAMENTO.xs },
  kpis: { flexDirection: 'row', gap: ESPACAMENTO.sm },
  cartaoKpi: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: ESPACAMENTO.xs,
    padding: ESPACAMENTO.md,
    borderRadius: RAIO.medio,
    borderWidth: 1,
    borderColor: CORES.borda,
    backgroundColor: CORES.superficie,
  },
  numeroKpi: { fontSize: 22, fontWeight: 'bold', color: CORES.texto },
  rotuloKpi: { fontSize: 11, color: CORES.textoSecundario, textAlign: 'center' },
  distribuicao: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACAMENTO.sm },
  tituloSecao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CORES.texto,
    marginTop: ESPACAMENTO.sm,
  },
  separadorTitulo: { height: 1, backgroundColor: CORES.borda, marginTop: ESPACAMENTO.xs },
  separadorItem: { height: ESPACAMENTO.md },
});
