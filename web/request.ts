import { BASE_PATH } from './vars';

const BASE = BASE_PATH + '/api';

// GET
export async function req<T>(url: string, params?: Record<string, string>): Promise<T> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(BASE + url + qs);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// POST / PUT / DELETE
export async function reqJson<T>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: any
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const res = await fetch(BASE + url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
