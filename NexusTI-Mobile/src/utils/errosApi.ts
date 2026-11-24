import axios from 'axios';

export type ErroCategoria =
  | 'rede'
  | 'timeout'
  | 'validacao'
  | 'sessao'
  | 'permissao'
  | 'naoEncontrado'
  | 'servidor'
  | 'desconhecido';

export interface ErroApiTratado {
  categoria: ErroCategoria;
  mensagem: string;
  status: number;
}

function mensagemDoCorpo(dados: unknown): string {
  if (dados !== null && typeof dados === 'object') {
    const corpo = dados as { mensagem?: unknown; message?: unknown };
    if (typeof corpo.mensagem === 'string' && corpo.mensagem.trim() !== '') {
      return corpo.mensagem.trim();
    }
    if (typeof corpo.message === 'string' && corpo.message.trim() !== '') {
      return corpo.message.trim();
    }
  }
  return '';
}

export function extrairErroApi(falha: unknown): ErroApiTratado {
  if (axios.isAxiosError(falha)) {
    const status = falha.response ? falha.response.status : 0;
    const codigo = typeof falha.code === 'string' ? falha.code : '';
    const mensagemBackend = falha.response ? mensagemDoCorpo(falha.response.data) : '';
    if (status === 0 && (codigo === 'ECONNABORTED' || codigo === 'ETIMEDOUT')) {
      return {
        categoria: 'timeout',
        mensagem: 'A conexão demorou muito. Tente novamente.',
        status,
      };
    }
    if (status === 0) {
      return {
        categoria: 'rede',
        mensagem: 'Sem conexão com a internet. Verifique sua rede e tente novamente.',
        status,
      };
    }
    if (status === 400) {
      return {
        categoria: 'validacao',
        mensagem: mensagemBackend !== '' ? mensagemBackend : 'Dados inválidos. Verifique as informações.',
        status,
      };
    }
    if (status === 401) {
      return {
        categoria: 'sessao',
        mensagem: mensagemBackend !== '' ? mensagemBackend : 'Sessão expirada. Entre novamente.',
        status,
      };
    }
    if (status === 403) {
      return {
        categoria: 'permissao',
        mensagem: mensagemBackend !== '' ? mensagemBackend : 'Você não tem permissão para esta ação.',
        status,
      };
    }
    if (status === 404) {
      return {
        categoria: 'naoEncontrado',
        mensagem: mensagemBackend !== '' ? mensagemBackend : 'Registro não encontrado.',
        status,
      };
    }
    if (status >= 500) {
      return {
        categoria: 'servidor',
        mensagem: mensagemBackend !== '' ? mensagemBackend : 'Erro interno do servidor. Tente novamente mais tarde.',
        status,
      };
    }
    if (mensagemBackend !== '') {
      return { categoria: 'desconhecido', mensagem: mensagemBackend, status };
    }
  }
  return {
    categoria: 'desconhecido',
    mensagem: 'Não foi possível concluir a solicitação. Tente novamente.',
    status: 0,
  };
}

export function mensagemErroApi(falha: unknown): string {
  return extrairErroApi(falha).mensagem;
}
