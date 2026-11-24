import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CORES, ESPACAMENTO, RAIO } from '../tema/cores';
import { validarCorHex } from '../utils/formatacao';

export type VarianteBotao = 'primario' | 'secundario' | 'perigo' | 'fantasma';
export type TamanhoBotao = 'padrao' | 'compacto';

interface BotaoPadraoProps {
  titulo: string;
  aoPressionar: () => void;
  desabilitado?: boolean;
  cor?: string;
  variante?: VarianteBotao;
  icone?: keyof typeof Ionicons.glyphMap;
  carregando?: boolean;
  accessibilityLabel?: string;
  tamanho?: TamanhoBotao;
}

export default function BotaoPadrao({
  titulo,
  aoPressionar,
  desabilitado,
  cor,
  variante = 'primario',
  icone,
  carregando = false,
  accessibilityLabel,
  tamanho = 'padrao',
}: BotaoPadraoProps) {
  const inativo = desabilitado === true || carregando === true;
  const compacto = tamanho === 'compacto';
  const fundo = cor !== undefined && cor !== '' ? validarCorHex(cor, CORES.primario) : fundoDaVariante(variante);
  const corTexto = textoDaVariante(variante);
  return (
    <TouchableOpacity
      style={[
        estilos.botao,
        compacto ? estilos.compacto : null,
        { backgroundColor: fundo },
        variante === 'fantasma' ? estilos.fantasma : null,
        variante === 'secundario' ? estilos.secundario : null,
        inativo ? estilos.inativo : null,
      ]}
      onPress={aoPressionar}
      disabled={Boolean(desabilitado || carregando)}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
    >
      {carregando === true ? (
        <ActivityIndicator size="small" color={corTexto} />
      ) : (
        <>
          {icone !== undefined ? (
            <Ionicons name={icone} size={compacto === true ? 16 : 18} color={corTexto} />
          ) : null}
          <Text style={[estilos.texto, compacto ? estilos.textoCompacto : null, { color: corTexto }]}>
            {titulo}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function fundoDaVariante(variante: VarianteBotao): string {
  if (variante === 'secundario') {
    return CORES.superficieElevada;
  }
  if (variante === 'perigo') {
    return CORES.perigo;
  }
  if (variante === 'fantasma') {
    return 'transparent';
  }
  return CORES.primario;
}

function textoDaVariante(variante: VarianteBotao): string {
  if (variante === 'fantasma') {
    return CORES.primario;
  }
  return CORES.texto;
}

const estilos = StyleSheet.create({
  botao: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RAIO.medio,
    paddingHorizontal: ESPACAMENTO.lg,
    paddingVertical: ESPACAMENTO.md,
    gap: ESPACAMENTO.sm,
  },
  compacto: {
    minHeight: 36,
    paddingHorizontal: ESPACAMENTO.md,
    paddingVertical: ESPACAMENTO.sm,
    gap: ESPACAMENTO.xs,
  },
  fantasma: {
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  secundario: {
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  inativo: {
    opacity: 0.5,
  },
  texto: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  textoCompacto: {
    fontSize: 13,
  },
});
