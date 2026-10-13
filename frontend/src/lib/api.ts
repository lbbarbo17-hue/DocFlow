const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('docflow_access_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('docflow_access_token', token);
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('docflow_access_token');
  localStorage.removeItem('docflow_tenant_id');
  localStorage.removeItem('docflow_current_user');
}

export function getTenantId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('docflow_tenant_id');
}

export function setTenantId(tenantId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('docflow_tenant_id', tenantId);
}

export interface AuthUserResponse {
  id: string;
  email: string;
  nome: string;
  perfil: string;
  tenant_id: string;
  avatar_path?: string | null;
  ativo: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUserResponse;
}

export interface DocumentoResponse {
  id: string;
  tenant_id: string;
  aluno_id: string;
  tipo: string;
  storage_path: string;
  file_hash: string;
  mime_type: string;
  tamanho_bytes: number;
  status: string;
  data_validade?: string | null;
  justificativa_recusa?: string | null;
  validado_por_user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TurmaResponse {
  id: string;
  tenant_id: string;
  nome: string;
  codigo: string;
  ano_letivo: number;
  instituicao_id?: string | null;
  ativo: boolean;
}

export interface ConformidadeResponse {
  turma_id: string;
  nome_turma: string;
  total_alunos: number;
  alunos_regulares: number;
  alunos_em_risco: number;
  taxa_conformidade_percentual: number;
}

export interface AlunoResponse {
  id: string;
  tenant_id: string;
  nome: string;
  cpf: string;
  email: string;
  matricula: string;
  status: string;
  avatar_path?: string | null;
  ativo: boolean;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const tenantId = getTenantId();
  if (tenantId && !headers.has('X-Tenant-ID')) {
    headers.set('X-Tenant-ID', tenantId);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthSession();
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    let errorDetail = 'Erro na requisição';
    let errorData: unknown = null;
    try {
      errorData = await response.json();
      if (typeof errorData === 'object' && errorData !== null && 'detail' in errorData) {
        const detail = (errorData as { detail: unknown }).detail;
        if (typeof detail === 'string') {
          errorDetail = detail;
        } else if (Array.isArray(detail)) {
          errorDetail = detail.map((err) => (typeof err === 'object' && err !== null && 'msg' in err ? String(err.msg) : String(err))).join(', ');
        }
      }
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new ApiError(errorDetail, response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const authApi = {
  login: async (email: string, senha: string): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
  },
  register: async (payload: {
    tenant_id: string;
    email: string;
    nome: string;
    perfil: string;
    senha?: string;
  }): Promise<AuthUserResponse> => {
    return apiRequest<AuthUserResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getMe: async (): Promise<AuthUserResponse> => {
    return apiRequest<AuthUserResponse>('/auth/me');
  },
  uploadAvatar: async (file: File): Promise<AuthUserResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest<AuthUserResponse>('/auth/me/avatar', {
      method: 'POST',
      body: formData,
    });
  },
  getAvatarUrl: async (): Promise<{ avatar_url: string }> => {
    return apiRequest<{ avatar_url: string }>('/auth/me/avatar-url');
  },
};

export const documentosApi = {
  listByAluno: async (alunoId: string): Promise<DocumentoResponse[]> => {
    return apiRequest<DocumentoResponse[]>(`/documentos/aluno/${alunoId}`);
  },
  upload: async (formData: FormData): Promise<DocumentoResponse> => {
    return apiRequest<DocumentoResponse>('/documentos/upload', {
      method: 'POST',
      body: formData,
    });
  },
  getDownloadUrl: async (docId: string): Promise<{ download_url: string }> => {
    return apiRequest<{ download_url: string }>(`/documentos/${docId}/download-url`);
  },
  validate: async (
    docId: string,
    payload: {
      status: string;
      justificativa_recusa?: string;
      validado_por_user_id?: string;
    }
  ): Promise<DocumentoResponse> => {
    return apiRequest<DocumentoResponse>(`/documentos/${docId}/validate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const turmasApi = {
  list: async (skip = 0, limit = 100): Promise<TurmaResponse[]> => {
    return apiRequest<TurmaResponse[]>(`/turmas?skip=${skip}&limit=${limit}`);
  },
  getConformidade: async (turmaId: string): Promise<ConformidadeResponse> => {
    return apiRequest<ConformidadeResponse>(`/turmas/${turmaId}/conformidade`);
  },
};

export const alunosApi = {
  list: async (skip = 0, limit = 100): Promise<AlunoResponse[]> => {
    return apiRequest<AlunoResponse[]>(`/alunos?skip=${skip}&limit=${limit}`);
  },
  getById: async (alunoId: string): Promise<AlunoResponse> => {
    return apiRequest<AlunoResponse>(`/alunos/${alunoId}`);
  },
  uploadAvatar: async (alunoId: string, file: File): Promise<AlunoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest<AlunoResponse>(`/alunos/${alunoId}/avatar`, {
      method: 'POST',
      body: formData,
    });
  },
  getAvatarUrl: async (alunoId: string): Promise<{ avatar_url: string }> => {
    return apiRequest<{ avatar_url: string }>(`/alunos/${alunoId}/avatar-url`);
  },
};
