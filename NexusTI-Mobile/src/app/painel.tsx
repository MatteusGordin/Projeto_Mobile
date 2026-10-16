import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import axios from 'axios';
import Cabecalho from '../componentes/Cabecalho';
import CardChamado from '../componentes/CardChamado';
import BotaoPadrao from '../componentes/BotaoPadrao';
import { listarChamados, obterMetricas } from '../api/chamados';
import { apagarPerfil, apagarToken, lerPerfil } from '../auth/session';
import type { ChamadoResposta, MetricasChamados, PerfilResposta } from '../types/models';

export default function PainelScreen() {
  const router = useRouter();
  const [chamados, setChamados] = useState<ChamadoResposta[]>([]);
  const [perfil, setPerfil] = useState<PerfilResposta | null>(null);
  const [abertos, setAbertos] = useState<number>(0);
  const [fechados, setFechados] = useState<number>(0);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>('');

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      const carregar = async (): Promise<void> => {
        setCarregando(true);
        setErro('');
        try {
          const resultado = await Promise.all([
            listarChamados(0, 20),
            obterMetricas().catch(() => null),
            lerPerfil().catch(() => null),
          ]);
          if (ativo === false) {
            return;
          }
          const pagina = resultado[0];
          const metricas = resultado[1] as MetricasChamados | null;
          const perfilSalvo = resultado[2] as PerfilResposta | null;
          const conteudo = pagina && pagina.content ? pagina.content : [];
          setChamados(conteudo);
          setPerfil(perfilSalvo);
          if (metricas !== null && metricas !== undefined) {
            setAbertos(typeof metricas.abertos === 'number' ? metricas.abertos : 0);
            setFechados(typeof metricas.fechados === 'number' ? metricas.fechados : 0);
          }
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

  const irParaNovoChamado = (): void => {
    router.push({ pathname: '/novo-chamado' } as never);
  };

  const irParaUsuarios = (): void => {
    router.push({ pathname: '/admin/usuarios' } as never);
  };

  const irParaEquipamentos = (): void => {
    router.push({ pathname: '/admin/equipamentos' } as never);
  };

  const irParaSetores = (): void => {
    router.push({ pathname: '/admin/setores' } as never);
  };

  const irParaPrioridades = (): void => {
    router.push({ pathname: '/admin/prioridades' } as never);
  };

  const irParaChamados = (): void => {
    router.push('/chamados' as never);
  };

  const sair = async (): Promise<void> => {
    await apagarToken();
    await apagarPerfil();
    router.replace('/');
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

  return (
    <View style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.container}>
      <Cabecalho titulo="Painel Tecnico" subtitulo="Chamados abertos" />
      <View style={estilos.metricas}>
        <View style={estilos.cartaoMetrica}>
          <Text style={estilos.numeroMetrica}>{String(abertos)}</Text>
          <Text style={estilos.rotuloMetrica}>Chamados Abertos</Text>
        </View>
        <View style={estilos.cartaoMetrica}>
          <Text style={estilos.numeroMetrica}>{String(fechados)}</Text>
          <Text style={estilos.rotuloMetrica}>Chamados Fechados</Text>
        </View>
      </View>
      <View style={estilos.navegacao}>
        <BotaoPadrao
          titulo="VER TODOS OS CHAMADOS"
          aoPressionar={irParaChamados}
          desabilitado={carregando}
        />
      </View>
      {perfil !== null && (perfil.perfil === 'ADMIN' || perfil.perfil === 'TECNICO') ? (
        <View style={estilos.admin}>
          <Text style={estilos.tituloAdmin}>Administracao</Text>
          {perfil.perfil === 'ADMIN' ? (
            <BotaoPadrao
              titulo="Gerenciar Usuarios"
              aoPressionar={irParaUsuarios}
              desabilitado={carregando}
            />
          ) : null}
          <BotaoPadrao
            titulo="Gerenciar Equipamentos"
            aoPressionar={irParaEquipamentos}
            desabilitado={carregando}
          />
          <BotaoPadrao
            titulo="Gerenciar Setores"
            aoPressionar={irParaSetores}
            desabilitado={carregando}
          />
          <BotaoPadrao
            titulo="Gerenciar Prioridades"
            aoPressionar={irParaPrioridades}
            desabilitado={carregando}
          />
        </View>
      ) : null}
      <View style={estilos.lista}>
        {carregando === true ? (
          <Text style={estilos.carregando}>Carregando chamados...</Text>
        ) : erro !== '' && chamados.length === 0 ? (
          <Text style={estilos.erro}>{erro}</Text>
        ) : (
          chamados.map((item: ChamadoResposta) => (
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
      {erro !== '' && chamados.length > 0 ? <Text style={estilos.erro}>{erro}</Text> : null}
      <View style={estilos.rodape}>
        <BotaoPadrao titulo="Novo Chamado" aoPressionar={irParaNovoChamado} desabilitado={carregando} />
        <BotaoPadrao titulo="Sair" aoPressionar={sair} desabilitado={carregando} />
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
  metricas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  cartaoMetrica: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#1E293B',
  },
  numeroMetrica: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  rotuloMetrica: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  lista: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: 12,
  },
  admin: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#1E293B',
    marginBottom: 12,
  },
  tituloAdmin: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'left',
  },
  navegacao: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginBottom: 12,
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
