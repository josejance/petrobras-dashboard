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
} from 'recharts';

interface VeiculosChartsProps {
  data: Materia[];
}

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

export function VeiculosCharts({ data }: VeiculosChartsProps) {
  const veiculoData = Object.entries(groupByField(data, 'Veiculo'))
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);
  
  const veiculoVMNData = groupByVMN(data, 'Veiculo').slice(0, 15);

  return (
    <div className="space-y-6">
      <ChartCard title="Top 15 Veículos por Volume" description="Veículos com mais matérias">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={veiculoData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                width={95}
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Matérias']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Top 15 Veículos por VMN" description="Veículos com maior valor de mídia (VMN total)">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={veiculoVMNData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number" 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => formatCompact(value)}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                width={95}
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
              <Bar dataKey="value" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
