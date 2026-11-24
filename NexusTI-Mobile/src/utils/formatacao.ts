import { CORES } from '../tema/cores';

const NAO_INFORMADO = 'Não informado';

function texto(valor?: string | null): string {
  if (typeof valor !== 'string') {
    return '';
  }
  return valor.trim();
}

export function formatarDataIso(valor?: string | null): string {
  const bruto = texto(valor);
  if (bruto === '') {
    return NAO_INFORMADO;
  }
  const compativel = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(bruto);
  if (compativel === null) {
    return NAO_INFORMADO;
  }
  const ano = Number(compativel[1]);
  const mes = Number(compativel[2]);
  const dia = Number(compativel[3]);
  const hora = compativel[4] === undefined ? 0 : Number(compativel[4]);
  const minuto = compativel[5] === undefined ? 0 : Number(compativel[5]);
  if (ano < 1 || mes < 1 || mes > 12 || dia < 1 || dia > 31 || hora > 23 || minuto > 59) {
    return NAO_INFORMADO;
  }
  const ultimoDia = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  if (dia > ultimoDia) {
    return NAO_INFORMADO;
  }
  const doisDigitos = (numero: number): string => numero < 10 ? '0' + String(numero) : String(numero);
  return doisDigitos(dia) + '/' + doisDigitos(mes) + '/' + String(ano) + ' ' + doisDigitos(hora) + ':' + doisDigitos(minuto);
}

export function validarCorHex(cor?: string | null, fallback?: string): string {
  const bruto = texto(cor);
  const alternativa = texto(fallback) === '' ? CORES.borda : texto(fallback);
  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(bruto)) {
    return bruto;
  }
  return alternativa;
}
