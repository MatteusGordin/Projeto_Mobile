import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Cabecalho from '../componentes/Cabecalho';
import InputPadrao from '../componentes/InputPadrao';
import BotaoPadrao from '../componentes/BotaoPadrao';
import SelectPadrao from '../componentes/SelectPadrao';
import type { OpcaoSelect } from '../componentes/SelectPadrao';
import { listarEquipamentos } from '../api/equipamentos';
import { criarChamado } from '../api/chamados';
import { lerPerfil } from '../auth/session';
import type { ChamadoResposta, Equipamento } from '../types/models';

export default function NovoChamadoScreen() {
  const router = useRouter();
  const [titulo, setTitulo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [idEquipamentoTexto, setIdEquipamentoTexto] = useState<string>('');
  const [opcoesEquipamentos, setOpcoesEquipamentos] = useState<OpcaoSelect[]>([]);
  const [idSolicitante, setIdSolicitante] = useState<number>(0);
  const [erro, setErro] = useState<string>('');
  const [confirmacao, setConfirmacao] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);

  useEffect(() => {
    const carregar = async (): Promise<void> => {
      try {
        const pagina = await listarEquipamentos(0, 50);
        const conteudo = pagina && pagina.content ? pagina.content : [];
        const mapeadas = conteudo.map((item: Equipamento) => {
          const patrimonio =
            item.patrimonio !== null && item.patrimonio !== undefined && item.patrimonio !== ''
              ? item.patrimonio
              : 'Nao informado';
          const marca = item.marca !== null && item.marca !== undefined ? item.marca : '';
          const modelo = item.modelo !== null && item.modelo !== undefined ? item.modelo : '';
          const complemento = (marca + ' ' + modelo).trim();
          const rotulo = complemento !== '' ? patrimonio + ' - ' + complemento : patrimonio;
          return { id: String(item.id), rotulo };
        });
        setOpcoesEquipamentos(mapeadas);
        const perfil = await lerPerfil().catch(() => null);
        if (perfil !== null && perfil.id > 0) {
          setIdSolicitante(perfil.id);
        }
        if (mapeadas.length === 0) {
          setErro('Nenhum equipamento encontrado.');
        }
      } catch (falha) {
        if (axios.isAxiosError(falha)) {
          const dados = falha.response
            ? (falha.response.data as { mensagem?: string; message?: string })
            : undefined;
          const mensagemApi =
            dados && dados.mensagem ? dados.mensagem : dados && dados.message ? dados.message : '';
          if (mensagemApi !== '') {
            setErro(mensagemApi);
          } else {
            setErro('Falha ao carregar equipamentos. Tente novamente.');
          }
        } else if (falha instanceof Error) {
          setErro(falha.message);
        } else {
          setErro('Falha ao carregar equipamentos. Tente novamente.');
        }
      }
    };
    carregar();
  }, []);

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
      setErro('Selecione o equipamento.');
      return;
    }
    const idEquipamento = Number(equipamentoNormalizado);
    if (Number.isNaN(idEquipamento) === true || idEquipamento <= 0) {
      setErro('Equipamento do chamado invalido.');
      return;
    }
    if (idSolicitante <= 0) {
      setErro('Solicitante do chamado invalido.');
      return;
    }
    setErro('');
    setConfirmacao('');
    setCarregando(true);
    try {
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
    <View style={estilos.tela}>
      <ScrollView contentContainerStyle={estilos.container}>
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
          <View style={estilos.selectZona}>
            <SelectPadrao
              rotulo="Equipamento"
              valorTexto={idEquipamentoTexto}
              placeholder="Selecione o equipamento"
              opcoes={opcoesEquipamentos}
              aoMudar={setIdEquipamentoTexto}
            />
          </View>
          {erro !== '' ? <Text style={estilos.erro}>{erro}</Text> : null}
          <View style={estilos.acoesZona}>
            <BotaoPadrao
              titulo={carregando === true ? 'Enviando...' : 'Abrir Chamado'}
              aoPressionar={enviarChamado}
              desabilitado={carregando}
            />
            <BotaoPadrao titulo="Voltar" aoPressionar={voltar} desabilitado={carregando} />
          </View>
          <Text style={estilos.confirmacao}>{confirmacao}</Text>
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
  },
  selectZona: {
    position: 'relative',
    zIndex: 10,
    elevation: 4,
  },
  acoesZona: {
    position: 'relative',
    zIndex: 0,
    elevation: 0,
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
    marginTop: 16,
  },
});
