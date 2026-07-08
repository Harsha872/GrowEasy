export interface CrmRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

export interface SkippedRow {
  row: number;
  reason: string;
}

export interface ImportStats {
  total_uploaded: number;
  total_imported: number;
  total_skipped: number;
}

export interface ImportResult {
  records: CrmRecord[];
  skipped: SkippedRow[];
  stats: ImportStats;
}

export interface ApiResponse {
  success: boolean;
  data?: ImportResult;
  error?: string;
}

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}
