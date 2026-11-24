import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CORES, ESPACAMENTO, RAIO } from '../tema/cores';

interface InputPadraoProps {
  rotulo: string;
  valor: string;
  aoMudar: (texto: string) => void;
  placeholder: string;
  seguro?: boolean;
  multilinha?: boolean;
  erro?: string;
  alternarSenha?: boolean;
}

export default function InputPadrao({
  rotulo,
  valor,
  aoMudar,
  placeholder,
  seguro,
  multilinha,
  erro,
  alternarSenha,
}: InputPadraoProps) {
  const [visivel, setVisivel] = useState<boolean>(false);
  const temErro = erro !== undefined && erro !== '';
  const oculto = alternarSenha === true ? visivel === false : seguro === true;
  return (
    <View style={estilos.bloco}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <View style={[estilos.campo, temErro ? estilos.campoErro : null, multilinha === true ? estilos.campoMultilinha : null]}>
        <TextInput
          style={estilos.entrada}
          value={valor}
          onChangeText={aoMudar}
          placeholder={placeholder}
          placeholderTextColor={CORES.textoSecundario}
          secureTextEntry={oculto}
          multiline={multilinha === true}
          accessibilityLabel={rotulo}
        />
        {alternarSenha === true ? (
          <Pressable
            style={estilos.botaoOlho}
            onPress={() => setVisivel((atual: boolean) => atual === false)}
            accessibilityRole="button"
            accessibilityLabel={visivel === true ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Ionicons
              name={visivel === true ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={CORES.textoSecundario}
            />
          </Pressable>
        ) : null}
      </View>
      {temErro ? <Text style={estilos.erro}>{erro}</Text> : null}
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
    minHeight: 48,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: RAIO.medio,
    paddingHorizontal: ESPACAMENTO.md,
    backgroundColor: CORES.superficie,
  },
  campoMultilinha: {
    minHeight: 96,
    alignItems: 'flex-start',
    paddingTop: ESPACAMENTO.md,
  },
  campoErro: {
    borderColor: CORES.perigo,
  },
  entrada: {
    flex: 1,
    fontSize: 16,
    color: CORES.texto,
  },
  botaoOlho: {
    padding: ESPACAMENTO.xs,
    marginLeft: ESPACAMENTO.sm,
  },
  erro: {
    fontSize: 12,
    color: CORES.perigo,
    marginTop: ESPACAMENTO.xs,
  },
});
