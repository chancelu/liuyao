import type {
  ApiResponse,
  CreateDivinationRequest,
  CreateDivinationResponse,
  GetDivinationResponse,
  SubmitCastRequest,
  SubmitCastResponse,
} from '@/lib/api/types';

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  const json = (await response.json()) as ApiResponse<T>;
  return json;
}

export async function createDivinationApi(payload: CreateDivinationRequest) {
  const response = await fetch('/api/divinations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseJson<CreateDivinationResponse>(response);
}

export async function submitCastApi(id: string, payload: SubmitCastRequest) {
  const response = await fetch(`/api/divinations/${id}/cast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseJson<SubmitCastResponse>(response);
}

export async function getDivinationApi(id: string) {
  const response = await fetch(`/api/divinations/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  return parseJson<GetDivinationResponse>(response);
}
