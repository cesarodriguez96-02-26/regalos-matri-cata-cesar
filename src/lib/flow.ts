import crypto from 'node:crypto';

type FlowParams = Record<string, string | number | undefined | null>;

const cleanParams = (params: FlowParams) =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {});

export function signFlowParams(params: FlowParams, secretKey: string) {
  const data = cleanParams(params);
  const sorted = Object.keys(data)
    .sort()
    .map((key) => `${key}${data[key]}`)
    .join('');

  return crypto.createHmac('sha256', secretKey).update(sorted).digest('hex');
}

function getFlowConfig() {
  const apiKey = process.env.FLOW_API_KEY;
  const secretKey = process.env.FLOW_SECRET_KEY;
  const baseUrl = (process.env.FLOW_BASE_URL ?? 'https://sandbox.flow.cl/api').replace(/\/$/, '');

  if (!apiKey || !secretKey) {
    throw new Error('Faltan credenciales de Flow en las variables de entorno.');
  }

  const parsedBase = new URL(baseUrl);
  if (parsedBase.protocol !== 'https:' || !(parsedBase.hostname === 'flow.cl' || parsedBase.hostname.endsWith('.flow.cl'))) {
    throw new Error('FLOW_BASE_URL debe apuntar a un dominio HTTPS de Flow.');
  }

  return { apiKey, secretKey, baseUrl };
}

function buildSignedParams(params: FlowParams) {
  const { apiKey, secretKey } = getFlowConfig();
  const payload = cleanParams({ ...params, apiKey });
  const signature = signFlowParams(payload, secretKey);
  return new URLSearchParams({ ...payload, s: signature });
}

async function parseFlowResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let json: unknown;

  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Flow respondió con un formato inesperado (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    const detail =
      typeof json === 'object' && json !== null && 'message' in json && typeof (json as { message?: unknown }).message === 'string'
        ? ` ${(json as { message: string }).message}`
        : '';
    throw new Error(`Flow rechazó la solicitud (HTTP ${response.status}).${detail}`);
  }

  return json as T;
}

export async function flowPost<T>(path: string, params: FlowParams): Promise<T> {
  const { baseUrl } = getFlowConfig();
  const body = buildSignedParams(params);
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store'
  });
  return parseFlowResponse<T>(response);
}

export async function flowGet<T>(path: string, params: FlowParams): Promise<T> {
  const { baseUrl } = getFlowConfig();
  const query = buildSignedParams(params);
  const response = await fetch(`${baseUrl}${path}?${query.toString()}`, { method: 'GET', cache: 'no-store' });
  return parseFlowResponse<T>(response);
}

export function buildFlowPaymentUrl(base: string, token: string) {
  const url = new URL(base);
  if (url.protocol !== 'https:' || !(url.hostname === 'flow.cl' || url.hostname.endsWith('.flow.cl'))) {
    throw new Error('Flow devolvió una URL de pago no permitida.');
  }
  url.searchParams.set('token', token);
  return url.toString();
}

export type FlowPaymentStatus = {
  flowOrder: number | string;
  commerceOrder: string;
  requestDate?: string;
  status: number | string; // 1 pendiente, 2 pagada, 3 rechazada, 4 anulada
  subject?: string;
  currency?: string;
  amount?: number;
  payer?: string;
  paymentData?: unknown;
  optional?: unknown;
};

export async function flowGetStatus(token: string) {
  return flowGet<FlowPaymentStatus>('/payment/getStatus', { token });
}

export async function flowGetStatusByCommerceId(commerceOrder: string) {
  return flowGet<FlowPaymentStatus>('/payment/getStatusByCommerceId', { commerceId: commerceOrder });
}
