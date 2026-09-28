import api from './client';
import type { ChamadoResposta, MetricasChamados, Pagina } from '../types/models';

export async function listarChamados(page: number, size: number): Promise<Pagina<ChamadoResposta>> {
  const resposta = await api.get<Pagina<ChamadoResposta>>('/chamados', {
    params: { page, size },
  });
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

export async function obterMetricas(): Promise<MetricasChamados> {
  const resposta = await api.get<MetricasChamados>('/chamados' + '/' + 'metricas');
  return resposta.data;
}
