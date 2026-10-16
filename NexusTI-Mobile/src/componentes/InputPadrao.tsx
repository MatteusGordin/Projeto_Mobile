import { StyleSheet, Text, TextInput, View } from 'react-native';

interface InputPadraoProps {
  rotulo: string;
  valor: string;
  aoMudar: (texto: string) => void;
  placeholder: string;
  seguro?: boolean;
  multilinha?: boolean;
}

export default function InputPadrao({
  rotulo,
  valor,
  aoMudar,
  placeholder,
  seguro,
  multilinha,
}: InputPadraoProps) {
  return (
    <View style={estilos.bloco}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        style={[estilos.campo, multilinha === true && estilos.campoMultilinha]}
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        secureTextEntry={seguro === true}
        multiline={multilinha === true}
      />
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
  campo: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#F8FAFC',
    backgroundColor: '#1E293B',
  },
  campoMultilinha: {
    minHeight: 96,
  },
});
