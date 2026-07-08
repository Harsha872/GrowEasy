import type { ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function importCsv(file: File): Promise<ApiResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/api/import`, {
    method: 'POST',
    body: formData,
  });

  const json = (await res.json()) as ApiResponse;
  if (!res.ok || !json.success) {
    throw new Error(json.error ?? `Request failed (${res.status}).`);
  }
  return json;
}
