import api from './client';
import type { Pagina, Usuario } from '../types/models';

export async function listarUsuarios(page: number, size: number): Promise<Pagina<Usuario>> {
  const resposta = await api.get<Pagina<Usuario>>('/usuarios', {
    params: { page, size },
  });
  return resposta.data;
}

export async function buscarUsuarioPorId(id: number): Promise<Usuario> {
  const resposta = await api.get<Usuario>('/usuarios' + '/' + String(id));
  return resposta.data;
}

export async function criarUsuario(dados: Partial<Usuario>): Promise<Usuario> {
  const resposta = await api.post<Usuario>('/usuarios', dados);
  return resposta.data;
}

export async function atualizarUsuario(id: number, dados: Partial<Usuario>): Promise<Usuario> {
  const resposta = await api.put<Usuario>('/usuarios' + '/' + String(id), dados);
  return resposta.data;
}

export async function deletarUsuario(id: number): Promise<void> {
  await api.delete('/usuarios' + '/' + String(id));
}
