export interface NavigationEntry {
  id: string;
  date: string;
  hoursMotor: number;
  hoursSail: number;
  route: string;
  notes: string;
}

export interface Insurance {
  id: string;
  name: string;
  company: string;
  policyNumber: string;
  startDate: string;
  expiryDate: string;
  premium: number;
  notes: string;
}

export interface FuelEntry {
  id: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
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
  port: string;
  period: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  notes: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  budgetSuggested: number;
  contingencyPercent: number;
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
  supplier: string;
  status: 'ToDo' | 'InCorso' | 'Sospeso' | 'Fatto';
  notes: string;
}

export interface RefitPayment {
  id: string;
  date: string;
  recipient: string;
  description: string;
  amount: number;
  category: string;
  notes: string;
}

export interface AppData {
  navigation: NavigationEntry[];
  insurances: Insurance[];
  fuel: FuelEntry[];
  expenses: ExpenseEntry[];
  mooring: MooringPayment[];
  budgetCategories: BudgetCategory[];
  refitItems: RefitItem[];
  refitPayments: RefitPayment[];
  budgetTotal: number;
}
