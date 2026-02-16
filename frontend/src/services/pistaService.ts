import { apiGo } from './api';

export interface Pista {
  id: number;
  slug?: string;
  nombre: string;
  tipo: string;
  superficie: string | null;
  imageUrl?: string | null;
  precioHoraBase: number;
  esActiva: boolean;
  estado: string;
}

export interface PistaQueryParams {
  q?: string;
  deporte?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PistaPagedResponse {
  items: Pista[];
  total: number;
  page: number;
  total_pages: number;
  limit: number;
}

export interface CreatePistaDTO {
  nombre: string;
  tipo: string;
  superficie?: string;
  imageUrl?: string;
  precioHoraBase: number;
}

export interface UpdatePistaDTO {
  nombre?: string;
  tipo?: string;
  superficie?: string;
  imageUrl?: string;
  precioHoraBase?: number;
  esActiva?: boolean;
  estado?: string;
}

export const pistaService = {
  getAll: async (): Promise<Pista[]> => {
    const { data } = await apiGo.get<PistaPagedResponse | Pista[]>('/pistas');
    // Adaptación: Si el backend devuelve paginación, extraer items. Si es array, devolverlo.
    return Array.isArray(data) ? data : data.items;
  },

  getAllAdvanced: async (
    params: PistaQueryParams,
    signal?: AbortSignal
  ): Promise<PistaPagedResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.q) searchParams.set('q', params.q);
    if (params.deporte) searchParams.set('deporte', params.deporte);
    if (params.min_price !== undefined) searchParams.set('min_price', String(params.min_price));
    if (params.max_price !== undefined) searchParams.set('max_price', String(params.max_price));
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));

    const queryString = searchParams.toString();
    const url = queryString ? `/pistas?${queryString}` : '/pistas';
    
    const { data } = await apiGo.get<PistaPagedResponse>(url, { signal });
    return data;
  },

  getById: async (id: number): Promise<Pista> => {
    const { data } = await apiGo.get<Pista>(`/pistas/${id}`);
    return data;
  },

  create: async (pistaData: CreatePistaDTO): Promise<Pista> => {
    const { data } = await apiGo.post<Pista>('/pistas', pistaData);
    return data;
  },

  update: async (id: number, pistaData: UpdatePistaDTO): Promise<Pista> => {
    const { data } = await apiGo.put<Pista>(`/pistas/${id}`, pistaData);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiGo.delete(`/pistas/${id}`);
  },
};

