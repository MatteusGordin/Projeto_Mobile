import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Cabecalho from '../componentes/Cabecalho';
import InputPadrao from '../componentes/InputPadrao';
import BotaoPadrao from '../componentes/BotaoPadrao';
import api from '../api/client';
import { criarChamado } from '../api/chamados';
import type { ChamadoResposta, PerfilResposta } from '../types/models';

export default function NovoChamadoScreen() {
  const router = useRouter();
  const [titulo, setTitulo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [idEquipamentoTexto, setIdEquipamentoTexto] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [confirmacao, setConfirmacao] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  const enviarChamado = async (): Promise<void> => {
    if (carregando === true) {
      return;
    }
    const tituloNormalizado = titulo.trim();
    const descricaoNormalizada = descricao.trim();
    const equipamentoNormalizado = idEquipamentoTexto.trim();
    if (tituloNormalizado === '' || descricaoNormalizada === '') {
      setErro('Informe titulo e descricao.');
      return;
    }
    if (tituloNormalizado.length < 3) {
      setErro('Titulo do chamado invalido.');
      return;
    }
    if (descricaoNormalizada.length < 5) {
      setErro('Descricao do chamado invalida.');
      return;
    }
    if (equipamentoNormalizado === '') {
      setErro('Informe o id do equipamento.');
      return;
    }
    const idEquipamento = Number(equipamentoNormalizado);
    if (Number.isNaN(idEquipamento) === true || idEquipamento <= 0) {
      setErro('Equipamento do chamado invalido.');
      return;
    }
    setErro('');
    setConfirmacao('');
    setCarregando(true);
    try {
      const perfil = await api.get<PerfilResposta>('/auth/perfil');
      const idSolicitante = perfil.data && perfil.data.id ? perfil.data.id : 0;
      if (idSolicitante <= 0) {
        setErro('Solicitante do chamado invalido.');
        return;
      }
      const dados: Partial<ChamadoResposta> = {
        titulo: tituloNormalizado,
        descricao: descricaoNormalizada,
        idSolicitante: idSolicitante,
        idEquipamento: idEquipamento,
      };
      const criado = await criarChamado(dados);
      setConfirmacao('Chamado ' + String(criado.id) + ' criado com sucesso.');
      setTitulo('');
      setDescricao('');
      setIdEquipamentoTexto('');
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
        } else if (status === 400) {
          setErro('Requisicao invalida. Verifique os dados.');
        } else {
          setErro('Falha ao criar chamado. Tente novamente.');
        }
      } else if (falha instanceof Error) {
        setErro(falha.message);
      } else {
        setErro('Falha ao criar chamado. Tente novamente.');
      }
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
          rotulo="Titulo"
          valor={titulo}
          aoMudar={setTitulo}
          placeholder="Exemplo: Impressora Recepcao"
        />
        <InputPadrao
          rotulo="Descricao do problema"
          valor={descricao}
          aoMudar={setDescricao}
          placeholder="Descreva o problema"
          multilinha={true}
        />
        <InputPadrao
          rotulo="Id Equipamento"
          valor={idEquipamentoTexto}
          aoMudar={setIdEquipamentoTexto}
          placeholder="Exemplo: 1"
        />
        {erro !== '' ? <Text style={estilos.erro}>{erro}</Text> : null}
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
  erro: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 12,
  },
  confirmacao: {
    fontSize: 14,
    color: '#15803D',
    textAlign: 'center',
    marginTop: 16,
  },
});
