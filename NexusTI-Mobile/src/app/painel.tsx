import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import Cabecalho from '../componentes/Cabecalho';
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

  const irParaChamados = (): void => {
    router.push('/chamados');
  };

  const irParaUsuarios = (): void => {
    router.push('/admin/usuarios');
  };

  const irParaEquipamentos = (): void => {
    router.push('/admin/equipamentos');
  };

  const irParaSetores = (): void => {
    router.push('/admin/setores');
  };

  const irParaPrioridades = (): void => {
    router.push('/admin/prioridades');
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
  const ehEquipe = perfil !== null && (perfil.perfil === 'ADMIN' || perfil.perfil === 'TECNICO');

  const cabecalhoLista = (
    <View style={estilos.cabecalhoLista}>
      <Cabecalho titulo="Nexus TI" subtitulo="HelpDesk Municipal" />
      <View style={estilos.saudacao}>
        <Text style={estilos.ola}>{'Olá, ' + nomeUsuario + '!'}</Text>
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
      <View style={estilos.metricas}>
        <View style={estilos.cartaoMetrica}>
          <Ionicons name="alert-circle-outline" size={20} color={CORES.primario} />
          <Text style={estilos.numeroMetrica}>{String(abertos)}</Text>
          <Text style={estilos.rotuloMetrica}>Chamados abertos</Text>
        </View>
        <View style={estilos.cartaoMetrica}>
          <Ionicons name="checkmark-circle-outline" size={20} color={CORES.sucesso} />
          <Text style={estilos.numeroMetrica}>{String(fechados)}</Text>
          <Text style={estilos.rotuloMetrica}>Chamados fechados</Text>
        </View>
      </View>
      {entradasPrioridade.length > 0 ? (
        <View style={estilos.bloco}>
          <Text style={estilos.tituloSecao}>Por prioridade</Text>
          <View style={estilos.listaPrioridades}>
            {entradasPrioridade.map(([chave, total]: [string, number]) => (
              <View key={chave} style={estilos.cartaoPrioridade}>
                <BadgeStatus tipo="prioridade" valor={chave} rotulo={chave === '' ? 'Sem prioridade' : chave} />
                <Text style={estilos.totalPrioridade}>{String(total)}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
      <View style={estilos.bloco}>
        <Text style={estilos.tituloSecao}>Atalhos</Text>
        <BotaoPadrao titulo="Novo chamado" aoPressionar={irParaNovoChamado} icone="add-circle-outline" />
        <BotaoPadrao
          titulo="Ver todos os chamados"
          aoPressionar={irParaChamados}
          icone="list-outline"
          variante="secundario"
        />
      </View>
      {ehEquipe === true ? (
        <View style={estilos.admin}>
          <Text style={estilos.tituloSecao}>Administração</Text>
          {perfil !== null && perfil.perfil === 'ADMIN' ? (
            <BotaoPadrao titulo="Gerenciar usuários" aoPressionar={irParaUsuarios} icone="people-outline" variante="fantasma" />
          ) : null}
          <BotaoPadrao titulo="Gerenciar equipamentos" aoPressionar={irParaEquipamentos} icone="hardware-chip-outline" variante="fantasma" />
          <BotaoPadrao titulo="Gerenciar setores" aoPressionar={irParaSetores} icone="grid-outline" variante="fantasma" />
          <BotaoPadrao titulo="Gerenciar prioridades" aoPressionar={irParaPrioridades} icone="flag-outline" variante="fantasma" />
        </View>
      ) : null}
      <Text style={estilos.tituloSecao}>Chamados recentes</Text>
    </View>
  );

  return (
    <>
      <FlatList
        style={estilos.tela}
        contentContainerStyle={estilos.container}
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
        ItemSeparatorComponent={() => <View style={estilos.separador} />}
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
    gap: ESPACAMENTO.md,
    marginBottom: ESPACAMENTO.lg,
  },
  saudacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACAMENTO.md,
  },
  ola: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: CORES.texto,
  },
  botaoPerfil: {
    padding: ESPACAMENTO.xs,
  },
  metricas: {
    flexDirection: 'row',
    gap: ESPACAMENTO.md,
  },
  cartaoMetrica: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: ESPACAMENTO.xs,
    padding: ESPACAMENTO.lg,
    borderRadius: RAIO.medio,
    borderWidth: 1,
    borderColor: CORES.borda,
    backgroundColor: CORES.superficie,
  },
  numeroMetrica: {
    fontSize: 22,
    fontWeight: 'bold',
    color: CORES.texto,
  },
  rotuloMetrica: {
    fontSize: 12,
    color: CORES.textoSecundario,
    textAlign: 'center',
  },
  bloco: {
    gap: ESPACAMENTO.sm,
  },
  tituloSecao: {
    fontSize: 15,
    fontWeight: 'bold',
    color: CORES.texto,
    marginTop: ESPACAMENTO.sm,
  },
  listaPrioridades: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ESPACAMENTO.sm,
  },
  cartaoPrioridade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACAMENTO.sm,
    paddingHorizontal: ESPACAMENTO.md,
    paddingVertical: ESPACAMENTO.sm,
    borderRadius: RAIO.medio,
    borderWidth: 1,
    borderColor: CORES.borda,
    backgroundColor: CORES.superficie,
  },
  totalPrioridade: {
    fontSize: 13,
    fontWeight: 'bold',
    color: CORES.texto,
  },
  admin: {
    gap: ESPACAMENTO.sm,
    padding: ESPACAMENTO.lg,
    borderRadius: RAIO.medio,
    borderWidth: 1,
    borderColor: CORES.borda,
    backgroundColor: CORES.superficie,
  },
  separador: {
    height: ESPACAMENTO.md,
  },
});
