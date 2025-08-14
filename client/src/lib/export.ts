import { api } from './api';

export type ExportFormat = 'pdf' | 'csv' | 'excel' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  sections: string[];
}

export async function exportData(options: ExportOptions): Promise<void> {
  try {
    const sectionsParam = options.sections.join(',');
    const response = await fetch(`/api/export/${options.format}?sections=${sectionsParam}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    const extension = options.format === 'excel' ? 'xlsx' : options.format;
    a.download = `personal-data-export.${extension}`;
    
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}

export async function fetchFlightAutofill(flightNumber: string) {
  return api.get(`/api/flights/autofill/${flightNumber}`);
}
