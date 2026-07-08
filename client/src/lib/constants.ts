import type { CrmRecord } from '@/types';

export const CRM_FIELDS: { key: keyof CrmRecord; label: string }[] = [
  { key: 'created_at', label: 'Created At' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'country_code', label: 'Country Code' },
  { key: 'mobile_without_country_code', label: 'Mobile' },
  { key: 'company', label: 'Company' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'lead_owner', label: 'Lead Owner' },
  { key: 'crm_status', label: 'Status' },
  { key: 'crm_note', label: 'Note' },
  { key: 'data_source', label: 'Data Source' },
  { key: 'possession_time', label: 'Possession Time' },
  { key: 'description', label: 'Description' },
];

export const STATUS_COLORS: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: 'green',
  DID_NOT_CONNECT: 'amber',
  BAD_LEAD: 'red',
  SALE_DONE: 'blue',
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const PREVIEW_ROW_LIMIT = 100;
