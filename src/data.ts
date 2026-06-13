import { AppData, BudgetCategory, RefitItem, Insurance, MooringPayment } from './types';

export const initialData: AppData = {
  navigation: [],
  insurances: [
    {
      id: '1',
      name: 'Assicurazione RC Motoscafo',
      expiryDate: '2026-12-31',
      company: 'AXA / Generali',
      amount: 0,
      notes: 'Polizza responsabilità civile',
    }
  ],
  fuel: [],
  expenses: [
    {
      id: '1',
      date: '2026-06-13',
      category: 'Manodopera',
      description: 'Tagliando motori + lavaggio',
      amount: 300,
      notes: 'Massimo Cannavacciuolo',
    },
    {
      id: '2',
      date: '2026-06-13',
      category: 'Batterie',
      description: 'Batteria Bosch 100Ah',
      amount: 149,
      notes: 'Impianti di bordo',
    }
  ],
  mooring: [
    {
      id: '1',
      date: '2026-01-01',
      port: 'Porto locale (generico)',
      period: '2026 Annuale',
      amount: 3000,
      expiryDate: '2026-12-31',
      paid: false,
    }
  ],
  budgetCategories: [
    { id: '1', name: '1. Motori / Refit', budgetSuggested: 2580, contingencyPercent: 15, budgetPlusContingency: 2967, priority: 'MUST', spent: 300 },
    { id: '2', name: '2. Trasmissione / Bravo 3X', budgetSuggested: 0, contingencyPercent: 10, budgetPlusContingency: 0, priority: 'OPZ', spent: 0 },
    { id: '3', name: '3. Impianti di bordo', budgetSuggested: 780, contingencyPercent: 10, budgetPlusContingency: 858, priority: 'MUST', spent: 149 },
    { id: '4', name: '4. Scafo / Carena / Anodi', budgetSuggested: 300, contingencyPercent: 10, budgetPlusContingency: 330, priority: 'MUST', spent: 0 },
    { id: '5', name: '5. Sicurezza e dotazioni', budgetSuggested: 180, contingencyPercent: 10, budgetPlusContingency: 198, priority: 'MUST', spent: 0 },
    { id: '6', name: '6. Ormeggio & Logistica', budgetSuggested: 300, contingencyPercent: 0, budgetPlusContingency: 300, priority: 'MUST', spent: 0 },
    { id: '7', name: '7. Assicurazioni / Bolli', budgetSuggested: 420, contingencyPercent: 0, budgetPlusContingency: 420, priority: 'MUST', spent: 0 },
    { id: '8', name: '8. Manodopera / Officina', budgetSuggested: 420, contingencyPercent: 0, budgetPlusContingency: 420, priority: 'MUST', spent: 300 },
    { id: '9', name: '9. Buffer imprevisti (contingency)', budgetSuggested: 420, contingencyPercent: 0, budgetPlusContingency: 420, priority: 'MUST', spent: 0 },
    { id: '10', name: '10. Extra / Upgrade estetici', budgetSuggested: 0, contingencyPercent: 0, budgetPlusContingency: 0, priority: 'OPZ', spent: 0 },
    { id: '11', name: '11. Carrozzeria / Superfici esterne', budgetSuggested: 600, contingencyPercent: 0, budgetPlusContingency: 600, priority: 'MUST', spent: 0 },
  ],
  refitItems: [
    { id: '1', wbs: '1.1', category: 'Motori', description: 'FILTER Fuel (secondario/engine)', quantity: 2, unitPrice: 2, totalPrice: 4, notes: 'Filtri carburante', supplier: 'Mercury', status: 'ToDo' },
    { id: '2', wbs: '1.1', category: 'Motori', description: 'BELT - SERPENTINE (cinghia servizi)', quantity: 2, unitPrice: 2, totalPrice: 4, notes: 'Cinghie motore', supplier: 'Mercury', status: 'ToDo' },
    { id: '3', wbs: '1.1', category: 'Motori', description: 'FILTER ELEMENT (olio)', quantity: 2, unitPrice: 1.3, totalPrice: 2.6, notes: 'Filtri olio', supplier: 'Mercury', status: 'ToDo' },
    { id: '4', wbs: '1.1', category: 'Motori', description: 'ANODE - ZINC (motore)', quantity: 2, unitPrice: 0.5, totalPrice: 1, notes: 'Anodi zinco', supplier: 'Mercury', status: 'ToDo' },
    { id: '5', wbs: '3.1', category: 'Impianti', description: 'Batteria Bosch 100Ah', quantity: 1, unitPrice: 149, totalPrice: 149, notes: 'Batteria servizi', supplier: 'Nautica', status: 'Fatto' },
  ],
  budgetTotal: 6000,
};
