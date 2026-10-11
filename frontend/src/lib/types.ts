// Core data types matching the CSV fields:
// id, en_name, ar_name, age, dob, sex, update

export interface Record {
  id: string;
  en_name: string;
  ar_name: string;
  age: number | null;
  dob: string | null;
  sex: 'm' | 'f' | null;
  update: string | null;
}

export interface SearchResult {
  algorithm: string;
  complexity: string;
  comparisons?: number;
  steps?: number;
  results: Record[];
  count: number;
  pagination: Pagination;
}

export interface SortResult {
  algorithm: string;
  complexity: string;
  comparisons: number;
  swaps?: number;
  results: Record[];
  sort_by: string;
  ascending: boolean;
  pagination: Pagination;
}

export interface Statistics {
  total: number;
  total_with_age: number;
  average_age: number | null;
  median_age: number | null;
  min_age: number | null;
  max_age: number | null;
  children_under_18: number;
  infants_under_1: number;
  unknown_age: number;
  cohorts: { id: string; range: string; count: number }[];
  male: number;
  female: number;
  age_distribution: AgeDistBucket[];
  records_by_year: YearBucket[];
}

export interface DatasetMetadata {
  status: 'fresh' | 'stale' | 'fallback';
  origin: 'upstream' | 'bundled';
  record_count: number;
  source_url: string;
  source_docs: string;
  source_revision: number | null;
  source_last_modified: string | null;
  checked_at: string | null;
  refreshed_at: string | null;
}

export interface MemorialResponse {
  statistics: Statistics;
  dataset: DatasetMetadata;
  records: Record[];
}

export interface AgeDistBucket {
  range: string;
  count: number;
}

export interface YearBucket {
  year: string;
  count: number;
}

export interface Pagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ToolExecutionLog {
  tool: string;
  algorithm?: string;
  complexity?: string;
  execution_time_ms?: number;
  arguments: { [key: string]: unknown };
}

export interface AgentResponse {
  answer: string;
  model: string;
  tools_used: ToolExecutionLog[];
  records: Record[];
  fallback_used: boolean;
}
