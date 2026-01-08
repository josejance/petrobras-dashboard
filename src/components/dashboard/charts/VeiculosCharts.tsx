import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from '../ChartCard';
import { groupByField, groupByFieldSum, toChartData, formatCompact } from '@/utils/dataTransformers';
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

export function VeiculosCharts({ data }: VeiculosChartsProps) {
  const veiculoData = toChartData(groupByField(data, 'Veiculo')).slice(0, 15);
  const veiculoValorData = toChartData(groupByFieldSum(data, 'Veiculo', 'Valor')).slice(0, 15);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

      <ChartCard title="Top 15 Veículos por Valor" description="Veículos com maior valor de mídia">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={veiculoValorData} layout="vertical" margin={{ left: 100 }}>
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
                  'Valor'
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
