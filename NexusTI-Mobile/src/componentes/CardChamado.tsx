import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BadgeStatus from './BadgeStatus';
import { CORES, ESPACAMENTO, RAIO } from '../tema/cores';
import { formatarDataIso } from '../utils/formatacao';

interface CardChamadoProps {
  titulo: string;
  equipamento?: string | null;
  descricao: string;
  status: string;
  prioridade?: string | null;
  dataAbertura?: string | null;
  corPrioridade?: string | null;
  aoPressionar?: () => void;
}

export default function CardChamado({
  titulo,
  equipamento,
  descricao,
  status,
  prioridade,
  dataAbertura,
  corPrioridade,
  aoPressionar,
}: CardChamadoProps) {
  const temEquipamento = equipamento !== undefined && equipamento !== null && equipamento !== '';
  const temAbertura = dataAbertura !== undefined && dataAbertura !== null && dataAbertura !== '';
  return (
    <TouchableOpacity
      style={estilos.cartao}
      onPress={aoPressionar}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={'Chamado ' + titulo + ', status ' + status}
    >
      <View style={estilos.linhaTitulo}>
        <Text style={estilos.titulo} numberOfLines={2}>
          {titulo}
        </Text>
        <Ionicons name="chevron-forward-outline" size={20} color={CORES.textoSecundario} />
      </View>
      {temEquipamento ? <Text style={estilos.equipamento}>{'Equipamento: ' + equipamento}</Text> : null}
      <Text style={estilos.descricao} numberOfLines={3}>
        {descricao}
      </Text>
      <View style={estilos.selos}>
        <BadgeStatus valor={status} />
        <BadgeStatus tipo="prioridade" valor={prioridade} cor={corPrioridade} />
      </View>
      {temAbertura ? (
        <Text style={estilos.data}>{'Abertura: ' + formatarDataIso(dataAbertura)}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    borderRadius: RAIO.medio,
    borderWidth: 1,
    borderColor: CORES.borda,
    padding: ESPACAMENTO.lg,
    backgroundColor: CORES.superficie,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: ESPACAMENTO.sm,
  },
  titulo: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: CORES.texto,
  },
  equipamento: {
    fontSize: 12,
    color: CORES.textoSecundario,
    marginTop: ESPACAMENTO.xs,
  },
  descricao: {
    fontSize: 14,
    color: CORES.textoSecundario,
    marginTop: ESPACAMENTO.sm,
  },
  selos: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: ESPACAMENTO.sm,
    marginTop: ESPACAMENTO.md,
  },
  data: {
    fontSize: 12,
    color: CORES.textoSecundario,
    marginTop: ESPACAMENTO.sm,
  },
});
