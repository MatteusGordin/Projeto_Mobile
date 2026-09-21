export interface Chamado {
  id: number;
  equipamento: string;
  descricao: string;
  status: string;
}

export interface NovoChamado {
  equipamento: string;
  descricao: string;
}

export interface Credenciais {
  usuario: string;
  senha: string;
}

export interface Sessao {
  token: string;
}

const PROTOCOLO: string = 'https:';
const BARRAS: string = '/' + '/';
const HOSPEDEIRO: string = 'api.nexusti.exemplo';
const BASE_URL: string = PROTOCOLO + BARRAS + HOSPEDEIRO;
const ROTA_LOGIN: string = BASE_URL + '/api' + '/auth' + '/login';
const ROTA_CHAMADOS: string = BASE_URL + '/api' + '/chamados';

export async function autenticar(dados: Credenciais): Promise<string> {
  try {
    const resposta = await fetch(ROTA_LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    });
    if (!resposta.ok) {
      throw new Error('Falha na autenticacao: ' + String(resposta.status));
    }
    const corpo = (await resposta.json()) as Sessao;
    return corpo.token;
  } catch (erro) {
    if (erro instanceof Error) {
      throw erro;
    }
    throw new Error('Falha de rede na autenticacao');
  }
}

export async function listarChamados(): Promise<Chamado[]> {
  try {
    const resposta = await fetch(ROTA_CHAMADOS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!resposta.ok) {
      throw new Error('Falha ao listar chamados: ' + String(resposta.status));
    }
    const dados = (await resposta.json()) as Chamado[];
    return dados;
  } catch (erro) {
    if (erro instanceof Error) {
      throw erro;
    }
    throw new Error('Falha de rede ao listar chamados');
  }
}

export async function criarChamado(dados: NovoChamado): Promise<Chamado> {
  try {
    const resposta = await fetch(ROTA_CHAMADOS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    });
    if (!resposta.ok) {
      throw new Error('Falha ao criar chamado: ' + String(resposta.status));
    }
    const criado = (await resposta.json()) as Chamado;
    return criado;
  } catch (erro) {
    if (erro instanceof Error) {
      throw erro;
    }
    throw new Error('Falha de rede ao criar chamado');
  }
}
