import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BotaoPadrao from './BotaoPadrao';
import { CORES, ESPACAMENTO, RAIO } from '../tema/cores';

interface EstadoVazioProps {
  titulo: string;
  subtitulo?: string;
  icone?: keyof typeof Ionicons.glyphMap;
  acao?: { titulo: string; aoPressionar: () => void };
}

export default function EstadoVazio({ titulo, subtitulo, icone = 'folder-open-outline', acao }: EstadoVazioProps) {
  return (
    <View style={estilos.container}>
      <View style={estilos.circulo}>
        <Ionicons name={icone} size={40} color={CORES.textoSecundario} />
      </View>
      <Text style={estilos.titulo}>{titulo}</Text>
      {subtitulo !== undefined && subtitulo !== '' ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
      {acao !== undefined ? (
        <View style={estilos.acao}>
          <BotaoPadrao titulo={acao.titulo} aoPressionar={acao.aoPressionar} variante="secundario" />
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTO.xl,
    gap: ESPACAMENTO.sm,
  },
  circulo: {
    width: 80,
    height: 80,
    borderRadius: RAIO.circular,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CORES.superficie,
    borderWidth: 1,
    borderColor: CORES.borda,
    marginBottom: ESPACAMENTO.sm,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CORES.texto,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: CORES.textoSecundario,
    textAlign: 'center',
  },
  acao: {
    alignSelf: 'stretch',
    marginTop: ESPACAMENTO.md,
  },
});
