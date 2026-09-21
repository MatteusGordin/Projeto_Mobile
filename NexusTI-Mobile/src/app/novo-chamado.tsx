import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Cabecalho from '../componentes/Cabecalho';
import InputPadrao from '../componentes/InputPadrao';
import BotaoPadrao from '../componentes/BotaoPadrao';
import { criarChamado } from '../servicos/api';
import type { NovoChamado } from '../servicos/api';

export default function NovoChamadoScreen() {
  const router = useRouter();
  const [equipamento, setEquipamento] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [confirmacao, setConfirmacao] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  const enviarChamado = async (): Promise<void> => {
    if (carregando === true) {
      return;
    }
    setCarregando(true);
    try {
      const dados: NovoChamado = {
        equipamento: equipamento,
        descricao: descricao,
      };
      const criado = await criarChamado(dados);
      setConfirmacao('Chamado registrado para ' + criado.equipamento);
      setEquipamento('');
      setDescricao('');
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Falha ao criar chamado';
      Alert.alert('Erro ao abrir chamado', mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const voltar = (): void => {
    router.back();
  };

  return (
    <View style={estilos.container}>
      <Cabecalho titulo="Novo Chamado" subtitulo="Informe o equipamento e o problema" />
      <View style={estilos.formulario}>
        <InputPadrao
          rotulo="Equipamento"
          valor={equipamento}
          aoMudar={setEquipamento}
          placeholder="Exemplo: PC Recepcao 03"
        />
        <InputPadrao
          rotulo="Descricao do problema"
          valor={descricao}
          aoMudar={setDescricao}
          placeholder="Descreva o problema"
          multilinha={true}
        />
        <BotaoPadrao
          titulo={carregando === true ? 'Enviando...' : 'Abrir Chamado'}
          aoPressionar={enviarChamado}
          desabilitado={carregando}
        />
        <BotaoPadrao titulo="Voltar" aoPressionar={voltar} desabilitado={carregando} />
        <Text style={estilos.confirmacao}>{confirmacao}</Text>
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
  formulario: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  confirmacao: {
    fontSize: 14,
    color: '#15803D',
    textAlign: 'center',
    marginTop: 16,
  },
});
