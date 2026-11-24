import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CORES, ESPACAMENTO, RAIO } from '../tema/cores';

export interface OpcaoSelect {
  id: string;
  rotulo: string;
}

interface SelectPadraoProps {
  rotulo: string;
  valorTexto: string;
  placeholder: string;
  opcoes: OpcaoSelect[];
  aoMudar: (id: string) => void;
  mensagemVazia?: string;
}

export default function SelectPadrao({
  rotulo,
  valorTexto,
  placeholder,
  opcoes,
  aoMudar,
  mensagemVazia,
}: SelectPadraoProps) {
  const [aberto, setAberto] = useState<boolean>(false);
  const selecionada = opcoes.find((opcao: OpcaoSelect) => opcao.id === valorTexto) ?? null;
  const textoExibido = selecionada !== null ? selecionada.rotulo : placeholder;
  const fechar = (): void => {
    setAberto(false);
  };
  const escolher = (id: string): void => {
    aoMudar(id);
    fechar();
  };
  return (
    <View style={estilos.bloco}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Pressable
        style={estilos.campo}
        onPress={() => setAberto(true)}
        accessibilityRole="button"
        accessibilityLabel={rotulo + ': ' + textoExibido}
      >
        <Text style={selecionada !== null ? estilos.texto : estilos.textoPlaceholder} numberOfLines={1}>
          {textoExibido}
        </Text>
        <Ionicons name="chevron-down" size={18} color={CORES.textoSecundario} />
      </Pressable>
      <Modal visible={aberto} transparent animationType="fade" onRequestClose={fechar} statusBarTranslucent>
        <Pressable style={estilos.fundo} onPress={fechar}>
          <Pressable style={estilos.cartao} onPress={() => undefined}>
            <View style={estilos.cabecalho}>
              <Text style={estilos.titulo}>{rotulo}</Text>
              <Pressable
                style={estilos.botaoFechar}
                onPress={fechar}
                accessibilityRole="button"
                accessibilityLabel={'Fechar seleção de ' + rotulo}
              >
                <Ionicons name="close" size={20} color={CORES.texto} />
              </Pressable>
            </View>
            {opcoes.length === 0 ? (
              <Text style={estilos.vazio}>{mensagemVazia ?? 'Nenhuma opção disponível.'}</Text>
            ) : (
              <FlatList
                data={opcoes}
                keyExtractor={(opcao: OpcaoSelect) => opcao.id}
                style={estilos.lista}
                renderItem={({ item }: { item: OpcaoSelect }) => {
                  const ativa = item.id === valorTexto;
                  return (
                    <Pressable
                      style={[estilos.opcao, ativa ? estilos.opcaoAtiva : null]}
                      onPress={() => escolher(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={item.rotulo}
                      accessibilityState={{ selected: ativa }}
                    >
                      <Text style={[estilos.textoOpcao, ativa ? estilos.textoOpcaoAtiva : null]}>{item.rotulo}</Text>
                      {ativa === true ? <Ionicons name="checkmark" size={18} color={CORES.primario} /> : null}
                    </Pressable>
                  );
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  bloco: {
    marginTop: ESPACAMENTO.lg,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: CORES.texto,
    marginBottom: ESPACAMENTO.sm,
  },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: RAIO.medio,
    paddingHorizontal: ESPACAMENTO.md,
    backgroundColor: CORES.superficie,
  },
  texto: {
    flex: 1,
    fontSize: 16,
    color: CORES.texto,
    marginRight: ESPACAMENTO.sm,
  },
  textoPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: CORES.textoSecundario,
    marginRight: ESPACAMENTO.sm,
  },
  fundo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: ESPACAMENTO.xl,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  cartao: {
    maxHeight: '80%',
    padding: ESPACAMENTO.lg,
    borderRadius: RAIO.grande,
    borderWidth: 1,
    borderColor: CORES.borda,
    backgroundColor: CORES.superficie,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ESPACAMENTO.md,
  },
  titulo: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: CORES.texto,
  },
  botaoFechar: {
    padding: ESPACAMENTO.sm,
  },
  lista: {
    maxHeight: 320,
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: ESPACAMENTO.md,
    borderRadius: RAIO.pequeno,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
  },
  opcaoAtiva: {
    backgroundColor: CORES.superficieElevada,
  },
  textoOpcao: {
    flex: 1,
    fontSize: 14,
    color: CORES.texto,
  },
  textoOpcaoAtiva: {
    color: CORES.primario,
    fontWeight: 'bold',
  },
  vazio: {
    padding: ESPACAMENTO.lg,
    fontSize: 14,
    color: CORES.textoSecundario,
    textAlign: 'center',
  },
});
