import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Cabecalho from '../componentes/Cabecalho';
import CardChamado from '../componentes/CardChamado';
import BotaoPadrao from '../componentes/BotaoPadrao';
import { listarChamados, obterMetricas } from '../api/chamados';
import type { ChamadoResposta, MetricasChamados } from '../types/models';

export default function PainelScreen() {
  const router = useRouter();
  const [chamados, setChamados] = useState<ChamadoResposta[]>([]);
  const [abertos, setAbertos] = useState<number>(0);
  const [fechados, setFechados] = useState<number>(0);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>('');

  useEffect(() => {
    const carregar = async (): Promise<void> => {
      setCarregando(true);
      setErro('');
      try {
        const resultado = await Promise.all([
          listarChamados(0, 20),
          obterMetricas().catch(() => null),
        ]);
        const pagina = resultado[0];
        const metricas = resultado[1] as MetricasChamados | null;
        const conteudo = pagina && pagina.content ? pagina.content : [];
        setChamados(conteudo);
        if (metricas !== null && metricas !== undefined) {
          setAbertos(typeof metricas.abertos === 'number' ? metricas.abertos : 0);
          setFechados(typeof metricas.fechados === 'number' ? metricas.fechados : 0);
        }
        if (conteudo.length === 0) {
          setErro('Nenhum chamado encontrado.');
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
          } else {
            setErro('Falha ao listar chamados. Tente novamente.');
          }
        } else if (falha instanceof Error) {
          setErro(falha.message);
        } else {
          setErro('Falha ao listar chamados. Tente novamente.');
        }
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

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

  return (
    <View style={estilos.container}>
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
            />
          ))
        )}
      </View>
      {erro !== '' && chamados.length > 0 ? <Text style={estilos.erro}>{erro}</Text> : null}
      <View style={estilos.rodape}>
        <BotaoPadrao titulo="Voltar" aoPressionar={voltar} desabilitado={carregando} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 24,
    backgroundColor: '#FFFFFF',
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
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  numeroMetrica: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  rotuloMetrica: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 4,
  },
  lista: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: 12,
  },
  carregando: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
  erro: {
    fontSize: 14,
    color: '#DC2626',
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
