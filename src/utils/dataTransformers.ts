import { Materia } from '@/hooks/useMaterias';
import { parse, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Parse Brazilian date format DD/MM/YYYY
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parsed = parse(dateStr, 'dd/MM/yyyy', new Date());
  return isValid(parsed) ? parsed : null;
}

// Parse value to number - handles both American (1234.56) and Brazilian (1.234,56) formats
// Also handles number inputs and null/undefined values
export function parseValue(valueStr: string | number | null | undefined): number {
  if (valueStr === null || valueStr === undefined) return 0;
  if (typeof valueStr === 'number') {
    return isNaN(valueStr) ? 0 : valueStr;
  }
  if (typeof valueStr !== 'string') return 0;
  if (valueStr.trim() === '') return 0;
  
  // Detect format: if has comma as last separator, it's Brazilian format
  // Examples: "1.234,56" (BR) vs "1234.56" (US) vs "1,234.56" (US with thousands)
  const lastComma = valueStr.lastIndexOf(',');
  const lastDot = valueStr.lastIndexOf('.');
  
  let cleaned: string;
  
  if (lastComma > lastDot) {
    // Brazilian format: 1.234,56 -> remove dots, replace comma with dot
    cleaned = valueStr.replace(/\./g, '').replace(',', '.');
  } else {
    // American format: 1,234.56 or 1234.56 -> just remove commas
    cleaned = valueStr.replace(/,/g, '');
  }
  
  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

// Format number as Brazilian currency
export function formatCurrency(value: number | null | undefined): string {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
}

// Format large numbers compactly
export function formatCompact(value: number): string {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1).replace('.', ',')} Bi`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace('.', ',')} Mi`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace('.', ',')} K`;
  }
  return num.toFixed(0);
}

// Format currency in compact form (R$ 45,6 Mi)
export function formatCurrencyCompact(value: number): string {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  if (num >= 1_000_000_000) {
    return `R$ ${(num / 1_000_000_000).toFixed(1).replace('.', ',')} Bi`;
  }
  if (num >= 1_000_000) {
    return `R$ ${(num / 1_000_000).toFixed(1).replace('.', ',')} Mi`;
  }
  if (num >= 1_000) {
    return `R$ ${(num / 1_000).toFixed(1).replace('.', ',')} K`;
  }
  return formatCurrency(num);
}

// Group data by a field and count
export function groupByField(data: Materia[], field: keyof Materia): Record<string, number> {
  return data.reduce((acc, item) => {
    const key = String(item[field] || 'Não informado');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// Group data by a field and sum another field
export function groupByFieldSum(
  data: Materia[], 
  groupField: keyof Materia, 
  sumField: keyof Materia
): Record<string, number> {
  return data.reduce((acc, item) => {
    const key = String(item[groupField] || 'Não informado');
    const value = typeof item[sumField] === 'string' 
      ? parseValue(item[sumField] as string)
      : Number(item[sumField]) || 0;
    acc[key] = (acc[key] || 0) + value;
    return acc;
  }, {} as Record<string, number>);
}

// Convert grouped data to chart format
export function toChartData(grouped: Record<string, number>): { name: string; value: number }[] {
  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// Group by date for timeline charts
export function groupByDate(
  data: Materia[], 
  dateField: keyof Materia = 'Data',
  valueField?: keyof Materia
): { date: string; count: number; value: number }[] {
  const grouped = data.reduce((acc, item) => {
    const dateStr = item[dateField] as string;
    const date = parseDate(dateStr);
    if (!date) return acc;
    
    const key = format(date, 'yyyy-MM-dd');
    if (!acc[key]) {
      acc[key] = { count: 0, value: 0, date: key };
    }
    acc[key].count += 1;
    if (valueField) {
      const val = typeof item[valueField] === 'string'
        ? parseValue(item[valueField] as string)
        : Number(item[valueField]) || 0;
      acc[key].value += val;
    }
    return acc;
  }, {} as Record<string, { count: number; value: number; date: string }>);

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

// Group by month for timeline charts
export function groupByMonth(
  data: Materia[],
  dateField: keyof Materia = 'Data'
): { month: string; count: number; displayMonth: string }[] {
  const grouped = data.reduce((acc, item) => {
    const dateStr = item[dateField] as string;
    const date = parseDate(dateStr);
    if (!date) return acc;
    
    const key = format(date, 'yyyy-MM');
    const displayMonth = format(date, 'MMM/yy', { locale: ptBR });
    
    if (!acc[key]) {
      acc[key] = { count: 0, month: key, displayMonth };
    }
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { count: number; month: string; displayMonth: string }>);

  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
}

// Calculate sentiment distribution
export function getSentimentData(data: Materia[]): { name: string; value: number; color: string }[] {
  const teor = groupByField(data, 'Teor');
  
  const colorMap: Record<string, string> = {
    'Muito Positiva': 'hsl(142, 76%, 36%)',
    'Positiva': 'hsl(142, 71%, 45%)',
    'Neutra': 'hsl(220, 9%, 46%)',
    'Negativa': 'hsl(0, 84%, 60%)',
    'Muito Negativa': 'hsl(0, 72%, 51%)',
  };

  return Object.entries(teor).map(([name, value]) => ({
    name,
    value,
    color: colorMap[name] || 'hsl(220, 9%, 46%)',
  }));
}

// Get top N items
export function getTopN<T extends Record<string, unknown>>(data: T[], n: number, sortKey: keyof T): T[] {
  return [...data]
    .sort((a, b) => {
      const aVal = Number(a[sortKey]) || 0;
      const bVal = Number(b[sortKey]) || 0;
      return bVal - aVal;
    })
    .slice(0, n);
}

// Cross-analysis: group by two fields
export function crossAnalysis(
  data: Materia[],
  field1: keyof Materia,
  field2: keyof Materia
): { name: string; [key: string]: string | number }[] {
  const result: Record<string, Record<string, number>> = {};
  const field2Values = new Set<string>();

  data.forEach(item => {
    const key1 = String(item[field1] || 'Não informado');
    const key2 = String(item[field2] || 'Não informado');
    
    field2Values.add(key2);
    
    if (!result[key1]) {
      result[key1] = {};
    }
    result[key1][key2] = (result[key1][key2] || 0) + 1;
  });

  return Object.entries(result).map(([name, values]) => ({
    name,
    ...values,
  }));
}
