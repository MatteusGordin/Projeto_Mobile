export type Perfil = 'ADMIN' | 'TECNICO' | 'USUARIO';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  idSetor: number;
  ativo?: boolean;
}

export interface PerfilResposta {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  idSetor: number;
}

export interface CredenciaisLogin {
  email: string;
  senha: string;
}

export interface LoginResposta {
  token: string;
}

export interface Sessao {
  token: string;
  usuario: PerfilResposta | null;
}

export interface ErroApi {
  mensagem: string;
  status: number;
}

export interface ChamadoResposta {
  id: number;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string | null;
  dataAbertura: string | null;
  dataFechamento: string | null;
  idSolicitante: number | null;
  idTecnico: number | null;
  idEquipamento: number | null;
  solucao: string | null;
  nomeSolicitante: string | null;
  nomeSetorSolicitante: string | null;
  siglaSetorSolicitante: string | null;
  corPrioridade: string | null;
}

export interface Pagina<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface MetricasChamados {
  abertos: number;
  fechados: number;
}

export interface Equipamento {
  id: number;
  patrimonio: string;
  tipo: string;
  marca: string;
  modelo: string;
  idSetor: number;
}

export interface Setor {
  id: number;
  nome: string | null;
  sigla: string | null;
}

export interface Prioridade {
  id: number;
  nome: string | null;
  cor: string | null;
  ordem: number | null;
  ativa: boolean | null;
}

export interface FiltrosChamados {
  page: number;
  size: number;
  status?: string | null;
  prioridade?: string | null;
  idSetor?: string | null;
  sort?: string | null;
}

export type MetricasPrioridades = Record<string, number>;
