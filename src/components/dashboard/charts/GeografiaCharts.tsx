import { useMemo } from 'react';
import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from '../ChartCard';
import { AIAnalysisCard } from '../AIAnalysisCard';
import { groupByField, groupByFieldSum, toChartData, formatCompact, formatCurrency } from '@/utils/dataTransformers';
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

export function GeografiaCharts({ data }: GeografiaChartsProps) {
  const ufData = toChartData(groupByField(data, 'uf')).slice(0, 15);
  const ufValorData = toChartData(groupByFieldSum(data, 'uf', 'Valor')).slice(0, 10);
  const abrangenciaValorData = toChartData(groupByFieldSum(data, 'Abrangência', 'Valor'));

  // Dados agregados para IA
  const aggregatedData = useMemo(() => ({
    topEstadosPorVolume: ufData.map(u => ({ uf: u.name, quantidade: u.value })),
    topEstadosPorValor: ufValorData.map(u => ({ 
      uf: u.name, 
      valor: formatCurrency(u.value as number) 
    })),
    abrangenciaXValor: abrangenciaValorData.map(a => ({ 
      abrangencia: a.name, 
      valor: formatCurrency(a.value as number) 
    })),
  }), [ufData, ufValorData, abrangenciaValorData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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

      <ChartCard title="Top 10 Estados por Valor" description="Valor de mídia por UF">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ufValorData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {ufValorData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
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
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Abrangência x Valor" description="Valor de mídia por abrangência">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={abrangenciaValorData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => formatCompact(value)}
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
              <Bar dataKey="value" fill="hsl(340, 75%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
      </div>

      <AIAnalysisCard 
        sectionId="geografia"
        sectionLabel="Distribuição Geográfica"
        aggregatedData={aggregatedData}
      />
    </div>
  );
}
