import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
}

export default function SelectPadrao({ rotulo, valorTexto, placeholder, opcoes, aoMudar }: SelectPadraoProps) {
  const [aberto, setAberto] = useState<boolean>(false);
  const selecionada = opcoes.find((opcao: OpcaoSelect) => opcao.id === valorTexto) ?? null;
  const textoExibido = selecionada !== null ? selecionada.rotulo : placeholder;
  const alternar = (): void => {
    setAberto((atual: boolean) => atual === false);
  };
  const escolher = (id: string): void => {
    aoMudar(id);
    setAberto(false);
  };
  return (
    <View style={estilos.bloco}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <View style={estilos.contexto}>
        <TouchableOpacity style={estilos.campo} onPress={alternar} activeOpacity={0.8}>
          <Text style={selecionada !== null ? estilos.texto : estilos.textoPlaceholder} numberOfLines={1}>
            {textoExibido}
          </Text>
          <Text style={estilos.seta}>{aberto === true ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {aberto === true ? (
          <View style={estilos.lista}>
            <ScrollView style={estilos.rolagem} nestedScrollEnabled={true}>
              {opcoes.length === 0 ? (
                <Text style={estilos.vazio}>Nenhum equipamento encontrado.</Text>
              ) : (
                opcoes.map((opcao: OpcaoSelect) => (
                  <TouchableOpacity
                    key={opcao.id}
                    style={estilos.opcao}
                    onPress={() => escolher(opcao.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={estilos.textoOpcao}>{opcao.rotulo}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  bloco: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 16,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  contexto: {
    position: 'relative',
    zIndex: 10,
    elevation: 4,
  },
  campo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#1E293B',
  },
  texto: {
    flex: 1,
    fontSize: 16,
    color: '#F8FAFC',
    marginRight: 8,
  },
  textoPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#94A3B8',
    marginRight: 8,
  },
  seta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  lista: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    backgroundColor: '#1E293B',
    zIndex: 20,
    elevation: 6,
  },
  rolagem: {
    maxHeight: 192,
  },
  opcao: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  textoOpcao: {
    fontSize: 14,
    color: '#F8FAFC',
  },
  vazio: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    padding: 12,
  },
});
