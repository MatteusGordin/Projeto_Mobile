import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Cabecalho from '../componentes/Cabecalho';
import CardChamado from '../componentes/CardChamado';
import BotaoPadrao from '../componentes/BotaoPadrao';
import { listarChamados } from '../servicos/api';
import type { Chamado } from '../servicos/api';

export default function PainelScreen() {
  const router = useRouter();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);

  useEffect(() => {
    const carregar = async (): Promise<void> => {
      setCarregando(true);
      try {
        const dados = await listarChamados();
        setChamados(dados);
      } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Falha ao listar chamados';
        Alert.alert('Erro ao carregar', mensagem);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const voltar = (): void => {
    router.back();
  };

  return (
    <View style={estilos.container}>
      <Cabecalho titulo="Painel Tecnico" subtitulo="Chamados abertos" />
      <View style={estilos.lista}>
        {carregando === true ? (
          <Text style={estilos.carregando}>Carregando chamados...</Text>
        ) : (
          chamados.map((chamado: Chamado) => (
            <CardChamado
              key={String(chamado.id)}
              equipamento={chamado.equipamento}
              descricao={chamado.descricao}
              status={chamado.status}
            />
          ))
        )}
      </View>
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
  rodape: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 24,
  },
});
