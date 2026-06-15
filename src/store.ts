import { AppData } from './types';

const STORAGE_KEY = 'domita_data';

export const defaultData: AppData = {
  navigation: [],
  insurances: [],
  fuel: [],
  expenses: [],
  mooring: [],
  budgetCategories: [],
  refitItems: [],
  refitPayments: [],
  budgetTotal: 6000,
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultData, ...parsed };
    }
  } catch (e) {
    console.warn('Errore lettura localStorage:', e);
  }
  return { ...defaultData };
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Errore scrittura localStorage:', e);
  }
}

export function exportDataJSON(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importDataJSON(json: string): AppData | null {
  try {
    const parsed = JSON.parse(json);
    return { ...defaultData, ...parsed };
  } catch {
    return null;
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
