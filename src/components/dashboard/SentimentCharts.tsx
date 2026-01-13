import { useMemo } from 'react';
import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from './ChartCard';
import { AIAnalysisCard } from './AIAnalysisCard';
import { groupByField, toChartData, parseDate, parseValue } from '@/utils/dataTransformers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface SentimentChartsProps {
  data: Materia[];
}

const SENTIMENT_COLORS: Record<string, string> = {
  'Muito Positiva': 'hsl(142, 76%, 36%)',
  'Positiva': 'hsl(142, 71%, 45%)',
  'Pouco positiva': 'hsl(142, 50%, 55%)',
  'Pouco Positiva': 'hsl(142, 50%, 55%)',
  'Negativa': 'hsl(0, 84%, 60%)',
  'Muito Negativa': 'hsl(0, 72%, 51%)',
  'Pouco Negativa': 'hsl(0, 60%, 70%)',
  'Não informado': 'hsl(220, 14%, 80%)',
};

export function SentimentCharts({ data }: SentimentChartsProps) {
  // Teor distribution
  const teorData = toChartData(groupByField(data, 'Teor')).map(item => ({
    name: item.name as string,
    value: item.value as number,
    color: SENTIMENT_COLORS[item.name as string] || SENTIMENT_COLORS['Não informado'],
  }));

  // Calculate overall sentiment gauge
  const positivas = data.filter(item => 
    item.Teor?.includes('Positiva')
  ).length;
  const negativas = data.filter(item => 
    item.Teor?.includes('Negativa')
  ).length;
  const total = data.length;
  const percentPositivo = total > 0 ? (positivas / total) * 100 : 0;
  const percentNegativo = total > 0 ? (negativas / total) * 100 : 0;

  // Vn index by month (usando coluna Vn em vez de K)
  const vnByMonth = data.reduce((acc, item) => {
    const date = parseDate(item.Data);
    if (!date) return acc;
    
    const key = format(date, 'yyyy-MM');
    const displayMonth = format(date, 'MMM/yy', { locale: ptBR });
    const vnValue = parseValue(item.Vn);
    
    if (!acc[key]) {
      acc[key] = { month: key, displayMonth, totalVn: 0, count: 0 };
    }
    if (item.Vn !== null && item.Vn !== undefined && item.Vn !== '') {
      acc[key].totalVn += vnValue;
      acc[key].count += 1;
    }
    return acc;
  }, {} as Record<string, { month: string; displayMonth: string; totalVn: number; count: number }>);

  const vnTrendData = Object.values(vnByMonth)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(item => ({
      displayMonth: item.displayMonth,
      mediaVn: item.count > 0 ? item.totalVn / item.count : 0,
    }));

  // Avaliação distribution
  const avaliacaoData = toChartData(groupByField(data, 'Avaliação'));

  // Dados agregados para IA
  const aggregatedData = useMemo(() => ({
    distribuicaoTeor: teorData.map(t => ({ tipo: t.name, quantidade: t.value })),
    percentualPositivo: percentPositivo.toFixed(1),
    percentualNegativo: percentNegativo.toFixed(1),
    totalPositivas: positivas,
    totalNegativas: negativas,
    tendenciaVn: vnTrendData.map(v => ({ mes: v.displayMonth, mediaVn: v.mediaVn.toFixed(2) })),
  }), [teorData, percentPositivo, percentNegativo, positivas, negativas, vnTrendData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <ChartCard title="Distribuição de Teor" description="Classificação de sentimento das matérias">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={teorData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {teorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [value, name]}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Índice de Sentimento" description="Panorama geral positivo vs negativo">
        <div className="h-64 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />
              {/* Positive arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth="12"
                strokeDasharray={`${percentPositivo * 2.51} 251.2`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{percentPositivo.toFixed(0)}%</span>
              <span className="text-sm text-muted-foreground">Positivo</span>
            </div>
          </div>
          <div className="flex gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>{positivas} positivas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>{negativas} negativas</span>
            </div>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Tendência do Índice Vn" description="Evolução média do índice Vn por mês">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vnTrendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="displayMonth" 
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                formatter={(value: number) => [value.toFixed(2), 'Média Vn']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="mediaVn"
                stroke="hsl(262, 83%, 58%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(262, 83%, 58%)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
      </div>

      <AIAnalysisCard 
        sectionId="sentimento"
        sectionLabel="Análise de Sentimento"
        aggregatedData={aggregatedData}
      />
    </div>
  );
}
