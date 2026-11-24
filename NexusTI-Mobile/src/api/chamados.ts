import api from './client';
import type {
  ChamadoResposta,
  FiltrosChamados,
  MetricasChamados,
  MetricasPrioridades,
  Pagina,
} from '../types/models';

export async function listarChamados(filtros: FiltrosChamados): Promise<Pagina<ChamadoResposta>> {
  const params: Record<string, string | number> = {
    page: filtros.page,
    size: filtros.size,
  };
  if (filtros.status !== undefined && filtros.status !== null && filtros.status !== '') {
    params.status = filtros.status;
  }
  if (filtros.prioridade !== undefined && filtros.prioridade !== null && filtros.prioridade !== '') {
    params.prioridade = filtros.prioridade;
  }
  if (filtros.idSetor !== undefined && filtros.idSetor !== null && filtros.idSetor !== '') {
    params.idSetor = filtros.idSetor;
  }
  if (filtros.sort !== undefined && filtros.sort !== null && filtros.sort !== '') {
    params.sort = filtros.sort;
  }
  const resposta = await api.get<Pagina<ChamadoResposta>>('/chamados', { params });
  return resposta.data;
}

export async function buscarChamadoPorId(id: number): Promise<ChamadoResposta> {
  const resposta = await api.get<ChamadoResposta>('/chamados' + '/' + String(id));
  return resposta.data;
}

export async function criarChamado(dados: Partial<ChamadoResposta>): Promise<ChamadoResposta> {
  const resposta = await api.post<ChamadoResposta>('/chamados', dados);
  return resposta.data;
}

export async function atualizarChamado(
  id: number,
  dados: Partial<ChamadoResposta>
): Promise<ChamadoResposta> {
  const resposta = await api.put<ChamadoResposta>('/chamados' + '/' + String(id), dados);
  return resposta.data;
}

export async function concluirChamado(id: number, solucao: string): Promise<ChamadoResposta> {
  const resposta = await api.put<ChamadoResposta>('/chamados' + '/' + String(id) + '/concluir', {
    solucao,
  });
  return resposta.data;
}

export async function excluirChamado(id: number): Promise<void> {
  await api.delete('/chamados' + '/' + String(id));
}

export async function obterMetricas(): Promise<MetricasChamados> {
  const resposta = await api.get<MetricasChamados>('/chamados' + '/' + 'metricas');
  return resposta.data;
}

export async function obterMetricasPrioridades(): Promise<MetricasPrioridades> {
  const resposta = await api.get<MetricasPrioridades>('/chamados' + '/' + 'metricas' + '/' + 'prioridades');
  return resposta.data;
}
