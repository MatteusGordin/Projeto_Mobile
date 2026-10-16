import api from './client';
import type { Pagina, Prioridade } from '../types/models';

export async function listarPrioridades(page: number, size: number): Promise<Pagina<Prioridade>> {
  const resposta = await api.get<Pagina<Prioridade>>('/prioridades', {
    params: { page, size },
  });
  return resposta.data;
}

export async function buscarPrioridadePorId(id: number): Promise<Prioridade> {
  const resposta = await api.get<Prioridade>('/prioridades' + '/' + String(id));
  return resposta.data;
}

export async function criarPrioridade(dados: Partial<Prioridade>): Promise<Prioridade> {
  const resposta = await api.post<Prioridade>('/prioridades', dados);
  return resposta.data;
}

export async function atualizarPrioridade(
  id: number,
  dados: Partial<Prioridade>
): Promise<Prioridade> {
  const resposta = await api.put<Prioridade>('/prioridades' + '/' + String(id), dados);
  return resposta.data;
}

export async function deletarPrioridade(id: number): Promise<void> {
  await api.delete('/prioridades' + '/' + String(id));
}
