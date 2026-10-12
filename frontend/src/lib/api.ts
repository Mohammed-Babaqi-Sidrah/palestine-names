/**
 * API client for the FastAPI backend.
 * All endpoints return real data from the dataset.
 */

import type { Record, PaginatedResponse, SearchResult, SortResult, Statistics, MemorialResponse } from './types';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');

async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000) });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json();
}

// ─── Records ─────────────────────────────────────────────────

export const api = {
  getMemorial: (signal?: AbortSignal) => apiFetch<MemorialResponse>('/memorial', signal),
  browseRecords: (params: URLSearchParams, signal?: AbortSignal) => apiFetch<PaginatedResponse<Record>>(`/records?${params}`, signal),
  /** Total count of records */
  getCount: () => apiFetch<{ count: number }>('/records/count'),

  /** Paginated archive listing */
  getRecords: (page = 1, pageSize = 50) =>
    apiFetch<PaginatedResponse<Record>>(`/records?page=${page}&page_size=${pageSize}`),

  /** Random sample for visualization */
  getSample: (n = 200) =>
    apiFetch<{ records: Record[]; total: number }>(`/records/sample?n=${n}`),

  /** One random record for spotlight scene */
  getOneRandom: () => apiFetch<Record>('/records/one-random'),

  // ─── Search ──────────────────────────────────────────────

  searchByName: (q: string, page = 1, pageSize = 50) =>
    apiFetch<SearchResult>(`/search/name?q=${encodeURIComponent(q)}&page=${page}&page_size=${pageSize}`),

  searchByAge: (age: number, tolerance = 0, page = 1, pageSize = 50) =>
    apiFetch<SearchResult>(`/search/age?age=${age}&tolerance=${tolerance}&page=${page}&page_size=${pageSize}`),

  searchByDate: (dateFrom?: string, dateTo?: string, page = 1, pageSize = 50) => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    params.set('page', String(page));
    params.set('page_size', String(pageSize));
    return apiFetch<SearchResult>(`/search/date?${params}`);
  },

  // ─── Sort ────────────────────────────────────────────────

  sortByName: (ascending = true, page = 1, pageSize = 50) =>
    apiFetch<SortResult>(`/sort/name?ascending=${ascending}&page=${page}&page_size=${pageSize}`),

  sortByAge: (ascending = true, page = 1, pageSize = 50) =>
    apiFetch<SortResult>(`/sort/age?ascending=${ascending}&page=${page}&page_size=${pageSize}`),

  sortByDate: (ascending = true, page = 1, pageSize = 50) =>
    apiFetch<SortResult>(`/sort/date?ascending=${ascending}&page=${page}&page_size=${pageSize}`),

  // ─── Statistics ───────────────────────────────────────────

  getStatistics: () => apiFetch<Statistics>('/statistics'),

  // ─── AI Agent (Archivist) ──────────────────────────────────

  chatWithArchivist: (message: string, model?: string, signal?: AbortSignal) =>
    fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, model }),
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(90000)]) : AbortSignal.timeout(90000),
    }).then(async res => {
      if (!res.ok) {
        throw new Error(`Agent error ${res.status}`);
      }
      return res.json() as Promise<import('./types').AgentResponse>;
    }),
};

export default api;
