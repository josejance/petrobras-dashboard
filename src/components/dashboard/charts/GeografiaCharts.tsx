import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from '../ChartCard';
import { groupByField, formatCompact } from '@/utils/dataTransformers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface GeografiaChartsProps {
  data: Materia[];
}

const COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(142, 71%, 45%)',
  'hsl(262, 83%, 58%)',
  'hsl(24, 95%, 53%)',
  'hsl(340, 75%, 55%)',
  'hsl(173, 58%, 39%)',
  'hsl(43, 96%, 56%)',
  'hsl(199, 89%, 48%)',
  'hsl(280, 65%, 60%)',
  'hsl(15, 80%, 55%)',
];

// Helper to parse VMN values correctly
function parseVMN(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[^\d,.-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Group by field and sum VMN
function groupByVMN(data: Materia[], field: keyof Materia): { name: string; value: number }[] {
  const grouped = new Map<string, number>();
  
  data.forEach(item => {
    const key = String(item[field] || 'Não informado');
    const vmn = parseVMN(item.VMN);
    grouped.set(key, (grouped.get(key) || 0) + vmn);
  });
  
  return Array.from(grouped.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function GeografiaCharts({ data }: GeografiaChartsProps) {
  const ufData = Object.entries(groupByField(data, 'uf'))
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);
  
  const ufVMNData = groupByVMN(data, 'uf').slice(0, 10);
  const abrangenciaVMNData = groupByVMN(data, 'Abrangência');

  return (
    <div className="space-y-6">
      <ChartCard title="Top 15 Estados por Volume" description="Distribuição geográfica por UF">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ufData} layout="vertical" margin={{ left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                width={45}
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Matérias']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="hsl(24, 95%, 53%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Top 10 Estados por VMN" description="Valor de mídia (VMN total) por UF">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ufVMNData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {ufVMNData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                  'VMN Total'
                ]}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Abrangência x VMN" description="Valor de mídia (VMN total) por abrangência">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={abrangenciaVMNData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => formatCompact(value)}
              />
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                  'VMN Total'
                ]}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="hsl(340, 75%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}