import {
  UploadResponse,
  MappingResponse,
  ColumnMapping,
  CSVRecord,
} from '../types/import';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const uploadCSV = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/imports/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Upload failed with status ${res.status}`);
  }

  return res.json();
};

export const getMappings = async (
  uploadId: string,
  headers: string[],
  preview: CSVRecord[]
): Promise<MappingResponse> => {
  const res = await fetch(`${API_BASE_URL}/imports/mapping`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uploadId, headers, preview }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Mapping failed with status ${res.status}`);
  }

  return res.json();
};

export const runImport = async (
  uploadId: string,
  mappings: ColumnMapping[],
  records?: CSVRecord[]
): Promise<unknown> => {
  const res = await fetch(`${API_BASE_URL}/imports/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uploadId, mappings, records }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Import failed with status ${res.status}`);
  }

  return res.json();
};

export const getImportStatus = async (jobId: string): Promise<unknown> => {
  const res = await fetch(`${API_BASE_URL}/imports/status/${jobId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to fetch status`);
  }
  return res.json();
};
