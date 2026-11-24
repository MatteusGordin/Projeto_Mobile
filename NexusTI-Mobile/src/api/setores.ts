import api from './client';
import type { Pagina, Setor } from '../types/models';

export async function listarSetores(page: number, size: number): Promise<Pagina<Setor>> {
  const resposta = await api.get<Pagina<Setor>>('/setores', {
    params: { page, size },
  });
  return resposta.data;
}

export async function listarOpcoesSetores(): Promise<Setor[]> {
  const resposta = await api.get<Setor[]>('/setores' + '/' + 'opcoes');
  return resposta.data;
}

export async function buscarSetorPorId(id: number): Promise<Setor> {
  const resposta = await api.get<Setor>('/setores' + '/' + String(id));
  return resposta.data;
}

export async function criarSetor(dados: Partial<Setor>): Promise<Setor> {
  const resposta = await api.post<Setor>('/setores', dados);
  return resposta.data;
}

export async function atualizarSetor(id: number, dados: Partial<Setor>): Promise<Setor> {
  const resposta = await api.put<Setor>('/setores' + '/' + String(id), dados);
  return resposta.data;
}

export async function deletarSetor(id: number): Promise<void> {
  await api.delete('/setores' + '/' + String(id));
}
