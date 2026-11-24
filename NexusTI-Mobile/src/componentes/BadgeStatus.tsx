import { StyleSheet, Text, View } from 'react-native';
import { CORES, ESPACAMENTO, RAIO } from '../tema/cores';
import { validarCorHex } from '../utils/formatacao';

type TipoBadge = 'status' | 'perfil' | 'prioridade';

interface BadgeStatusProps {
  valor?: string | null;
  cor?: string | null;
  tipo?: TipoBadge;
  rotulo?: string;
}

export default function BadgeStatus({ valor, cor, tipo = 'status', rotulo }: BadgeStatusProps) {
  const texto = rotulo ?? (valor !== null && valor !== undefined && valor !== '' ? valor : 'Não informado');
  const corBadge = corDaVariante(valor, cor, tipo);
  return (
    <View style={[estilos.badge, { borderColor: corBadge }]} accessibilityLabel={texto}>
      <View style={[estilos.ponto, { backgroundColor: corBadge }]} />
      <Text style={[estilos.texto, { color: corBadge }]}>{texto}</Text>
    </View>
  );
}

function corDaVariante(valor?: string | null, cor?: string | null, tipo?: TipoBadge): string {
  const chave = valor === null || valor === undefined ? '' : valor.trim().toUpperCase();
  if (tipo === 'prioridade') {
    const alternativa = corPrioridade(chave);
    return cor !== null && cor !== undefined && cor.trim() !== '' ? validarCorHex(cor, alternativa) : alternativa;
  }
  if (tipo === 'perfil') {
    if (chave === 'ADMIN') {
      return CORES.atencao;
    }
    if (chave === 'TECNICO') {
      return CORES.primario;
    }
    if (chave === 'USUARIO') {
      return CORES.textoSecundario;
    }
    return CORES.borda;
  }
  if (chave === 'ABERTO') {
    return CORES.primario;
  }
  if (chave === 'FECHADO') {
    return CORES.sucesso;
  }
  return CORES.borda;
}

function corPrioridade(chave: string): string {
  if (chave === 'BAIXA') {
    return CORES.sucesso;
  }
  if (chave === 'MEDIA' || chave === 'MÉDIA') {
    return CORES.atencao;
  }
  if (chave === 'ALTA' || chave === 'URGENTE') {
    return CORES.perigo;
  }
  return CORES.textoSecundario;
}

const estilos = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RAIO.circular,
    paddingHorizontal: ESPACAMENTO.md,
    paddingVertical: ESPACAMENTO.xs,
    gap: ESPACAMENTO.sm,
    backgroundColor: CORES.superficie,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: RAIO.circular,
  },
  texto: {
    fontSize: 12,
    fontWeight: '600',
  },
});
