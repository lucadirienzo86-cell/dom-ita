export interface NavigationEntry {
  id: string;
  date: string;
  hours: number;
  motorHours?: number;
  sailHours?: number;
  notes: string;
}

export interface Insurance {
  id: string;
  name: string;
  expiryDate: string;
  company: string;
  amount: number;
  notes: string;
}

export interface FuelEntry {
  id: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalPrice: number;
  motorHours: number;
  notes: string;
}

export interface ExpenseEntry {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  notes: string;
}

export interface MooringPayment {
  id: string;
  date: string;
  port: string;
  period: string;
  amount: number;
  expiryDate: string;
  paid: boolean;
}

export interface BudgetCategory {
  id: string;
  name: string;
  budgetSuggested: number;
  contingencyPercent: number;
  budgetPlusContingency: number;
  priority: 'MUST' | 'NICE' | 'OPZ';
  spent: number;
}

export interface RefitItem {
  id: string;
  wbs: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string;
  supplier?: string;
  status: 'ToDo' | 'InCorso' | 'Sospeso' | 'Fatto';
}

export interface AppData {
  navigation: NavigationEntry[];
  insurances: Insurance[];
  fuel: FuelEntry[];
  expenses: ExpenseEntry[];
  mooring: MooringPayment[];
  budgetCategories: BudgetCategory[];
  refitItems: RefitItem[];
  budgetTotal: number;
}
