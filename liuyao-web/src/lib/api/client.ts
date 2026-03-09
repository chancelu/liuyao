import type {
  ApiResponse,
  CreateDivinationRequest,
  CreateDivinationResponse,
  GetDivinationResponse,
  ListDivinationsResponse,
  SaveDivinationResponse,
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

export async function saveDivinationApi(id: string, accessToken: string) {
  const response = await fetch(`/api/divinations/${id}/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseJson<SaveDivinationResponse>(response);
}

export async function listDivinationsApi(accessToken: string) {
  const response = await fetch('/api/divinations', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  return parseJson<ListDivinationsResponse>(response);
}
