import { Button, StyleSheet, Text, View } from 'react-native';

interface CardChamadoProps {
  equipamento: string;
  descricao: string;
  status: string;
  prioridade?: string | null;
  dataAbertura?: string | null;
  corPrioridade?: string | null;
  aoPressionar?: () => void;
}

export default function CardChamado({
  equipamento,
  descricao,
  status,
  prioridade,
  dataAbertura,
  corPrioridade,
  aoPressionar,
}: CardChamadoProps) {
  const pressionar = (): void => {
    if (aoPressionar !== undefined) {
      aoPressionar();
    }
  };
  const temPrioridade = prioridade !== undefined && prioridade !== null && prioridade !== '';
  const temAbertura = dataAbertura !== undefined && dataAbertura !== null && dataAbertura !== '';
  const temCor =
    corPrioridade !== undefined && corPrioridade !== null && corPrioridade !== '';
  const corSelo = temCor && corPrioridade !== undefined && corPrioridade !== null ? corPrioridade : '#475569';
  return (
    <View style={estilos.cartao}>
      <Text style={estilos.equipamento}>{equipamento}</Text>
      <Text style={estilos.descricao}>{descricao}</Text>
      <Text style={estilos.status}>{status}</Text>
      {temPrioridade || temAbertura ? (
        <View style={estilos.meta}>
          {temPrioridade ? (
            <View style={estilos.linhaMeta}>
              <View style={[estilos.selo, { backgroundColor: corSelo }]} />
              <Text style={estilos.metaTexto}>{prioridade}</Text>
            </View>
          ) : null}
          {temAbertura ? <Text style={estilos.metaTexto}>{dataAbertura}</Text> : null}
        </View>
      ) : null}
      <View style={estilos.acao}>
        <Button title="Ver Detalhes" onPress={pressionar} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#1E293B',
  },
  equipamento: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  descricao: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#93C5FD',
    marginTop: 8,
  },
  meta: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 8,
    gap: 4,
  },
  linhaMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
  },
  selo: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  metaTexto: {
    fontSize: 12,
    color: '#94A3B8',
  },
  acao: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 12,
  },
});
