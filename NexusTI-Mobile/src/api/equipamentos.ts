import api from './client';
import type { Equipamento, Pagina } from '../types/models';

export async function listarEquipamentos(page: number, size: number): Promise<Pagina<Equipamento>> {
  const resposta = await api.get<Pagina<Equipamento>>('/equipamentos', {
    params: { page, size },
  });
  return resposta.data;
}

export async function listarOpcoesEquipamentos(): Promise<Equipamento[]> {
  const resposta = await api.get<Equipamento[]>('/equipamentos' + '/' + 'opcoes');
  return resposta.data;
}

export async function buscarEquipamentoPorId(id: number): Promise<Equipamento> {
  const resposta = await api.get<Equipamento>('/equipamentos' + '/' + String(id));
  return resposta.data;
}

export async function criarEquipamento(dados: Partial<Equipamento>): Promise<Equipamento> {
  const resposta = await api.post<Equipamento>('/equipamentos', dados);
  return resposta.data;
}

export async function atualizarEquipamento(
  id: number,
  dados: Partial<Equipamento>
): Promise<Equipamento> {
  const resposta = await api.put<Equipamento>('/equipamentos' + '/' + String(id), dados);
  return resposta.data;
}

export async function deletarEquipamento(id: number): Promise<void> {
  await api.delete('/equipamentos' + '/' + String(id));
}
