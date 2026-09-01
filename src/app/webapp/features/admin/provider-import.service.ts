import { Injectable } from '@angular/core';
import {
  PROVIDER_IMPORT_HEADERS,
  ProviderImportRawRow,
  ProviderImportValidationResult
} from './provider-import.models';
import { validateProviderImportRows } from './provider-import.util';

@Injectable({ providedIn: 'root' })
export class ProviderImportService {
  async parseFile(file: File): Promise<ProviderImportRawRow[]> {
    if (file.name.toLowerCase().endsWith('.csv')) {
      return this.parseCsv(await file.text());
    }

    if (file.name.toLowerCase().endsWith('.xlsx')) {
      return this.parseXlsx(file);
    }

    throw new Error('Unsupported file type. Please upload a .csv or .xlsx file.');
  }

  validateRows(rows: ProviderImportRawRow[], knownCategoryMap: Record<string, string>, duplicateData?: { duplicateKeys: Set<string>; emailKeys: Set<string> }): ProviderImportValidationResult {
    return validateProviderImportRows(rows, {
      knownCategoryMap,
      existingDuplicateKeys: duplicateData?.duplicateKeys,
      existingEmailKeys: duplicateData?.emailKeys
    });
  }

  downloadCsvTemplate(): void {
    const sample = 'John Doe,JD Electrical,john@example.com,0821234567,Parktown North,"Electrician,Appliance Repair","Trusted local electrician","trusted,fast,response",true,false,available_today,,,,,,,,';
    const csvContent = `${PROVIDER_IMPORT_HEADERS.join(',')}\n${sample}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'provider-import-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  private parseCsv(text: string): ProviderImportRawRow[] {
    const rows = this.parseCsvRows(text);
    if (!rows.length) {
      return [];
    }

    const [headerRow, ...dataRows] = rows;
    const headers = headerRow.map((value) => value.trim());

    return dataRows
      .filter((row) => row.some((cell) => cell.trim()))
      .map((row, index) => this.mapToRawRow(headers, row, index + 2));
  }

  private async parseXlsx(file: File): Promise<ProviderImportRawRow[]> {
    const xlsx = await this.loadXlsxModule();
    const workbook = xlsx.read(await file.arrayBuffer(), { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const matrix = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false }) as Array<Array<string | number | boolean>>;

    if (!matrix.length) {
      return [];
    }

    const [headerRow, ...dataRows] = matrix;
    const headers = headerRow.map((value) => String(value ?? '').trim());

    return dataRows
      .map((row) => row.map((value) => String(value ?? '')))
      .filter((row) => row.some((cell) => cell.trim()))
      .map((row, index) => this.mapToRawRow(headers, row, index + 2));
  }


  private async loadXlsxModule(): Promise<any> {
    const importFn = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>;
    return importFn('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm');
  }

  private mapToRawRow(headers: string[], row: string[], rowNumber: number): ProviderImportRawRow {
    const values: ProviderImportRawRow['values'] = {};

    PROVIDER_IMPORT_HEADERS.forEach((header) => {
      const headerIndex = headers.findIndex((item) => item.toLowerCase() === header.toLowerCase());
      values[header] = headerIndex >= 0 ? row[headerIndex] ?? '' : '';
    });

    return { rowNumber, values };
  }

  private parseCsvRows(input: string): string[][] {
    const rows: string[][] = [];
    let currentCell = '';
    let currentRow: string[] = [];
    let inQuotes = false;

    for (let i = 0; i < input.length; i += 1) {
      const char = input[i];
      const nextChar = input[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === ',' && !inQuotes) {
        currentRow.push(currentCell);
        currentCell = '';
        continue;
      }

      if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i += 1;
        }
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        continue;
      }

      currentCell += char;
    }

    if (currentCell || currentRow.length) {
      currentRow.push(currentCell);
      rows.push(currentRow);
    }

    return rows;
  }
}
