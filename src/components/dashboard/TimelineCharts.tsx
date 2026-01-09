import { useMemo } from 'react';
import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from './ChartCard';
import { AIAnalysisCard } from './AIAnalysisCard';
import { groupByMonth, parseValue, formatCompact, parseDate, getSentimentData } from '@/utils/dataTransformers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface TimelineChartsProps {
  data: Materia[];
}

export function TimelineCharts({ data }: TimelineChartsProps) {
  // Volume by month
  const volumeByMonth = groupByMonth(data);

  // Valor by month
  const valorByMonth = data.reduce((acc, item) => {
    const date = parseDate(item.Data);
    if (!date) return acc;
    
    const key = format(date, 'yyyy-MM');
    const displayMonth = format(date, 'MMM/yy', { locale: ptBR });
    
    if (!acc[key]) {
      acc[key] = { month: key, displayMonth, valor: 0 };
    }
    acc[key].valor += parseValue(item.Valor);
    return acc;
  }, {} as Record<string, { month: string; displayMonth: string; valor: number }>);

  const valorData = Object.values(valorByMonth)
    .sort((a, b) => a.month.localeCompare(b.month));

  // Sentiment by month
  const sentimentByMonth = data.reduce((acc, item) => {
    const date = parseDate(item.Data);
    if (!date) return acc;
    
    const key = format(date, 'yyyy-MM');
    const displayMonth = format(date, 'MMM/yy', { locale: ptBR });
    
    if (!acc[key]) {
      acc[key] = { month: key, displayMonth, positivas: 0, negativas: 0, neutras: 0 };
    }
    
    const teor = item.Teor || '';
    if (teor.includes('Positiva')) {
      acc[key].positivas += 1;
    } else if (teor.includes('Negativa')) {
      acc[key].negativas += 1;
    } else {
      acc[key].neutras += 1;
    }
    
    return acc;
  }, {} as Record<string, { month: string; displayMonth: string; positivas: number; negativas: number; neutras: number }>);

  const sentimentData = Object.values(sentimentByMonth)
    .sort((a, b) => a.month.localeCompare(b.month));

  // Dados agregados para IA
  const aggregatedData = useMemo(() => ({
    volumePorMes: volumeByMonth.map(v => ({ mes: v.displayMonth, quantidade: v.count })),
    valorPorMes: valorData.map(v => ({ mes: v.displayMonth, valor: v.valor })),
    sentimentoPorMes: sentimentData.map(s => ({ 
      mes: s.displayMonth, 
      positivas: s.positivas, 
      negativas: s.negativas,
      neutras: s.neutras
    })),
  }), [volumeByMonth, valorData, sentimentData]);

  return (
    <div className="space-y-6">
      <AIAnalysisCard 
        sectionId="timeline"
        sectionLabel="Evolução Temporal"
        aggregatedData={aggregatedData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <ChartCard title="Volume de Publicações" description="Quantidade de matérias por mês">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volumeByMonth}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="displayMonth" 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                formatter={(value: number) => [value, 'Matérias']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(221, 83%, 53%)"
                fill="hsl(221, 83%, 53%)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Evolução do Valor de Mídia" description="Soma do valor de mídia por mês">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={valorData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="displayMonth" 
                tick={{ fontSize: 11 }}
              />
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
              <Line
                type="monotone"
                dataKey="valor"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(142, 71%, 45%)', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Evolução do Sentimento" description="Matérias positivas vs negativas por mês">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sentimentData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="displayMonth" 
                tick={{ fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="positivas"
                stackId="1"
                stroke="hsl(142, 71%, 45%)"
                fill="hsl(142, 71%, 45%)"
                fillOpacity={0.6}
                name="Positivas"
              />
              <Area
                type="monotone"
                dataKey="neutras"
                stackId="1"
                stroke="hsl(220, 9%, 46%)"
                fill="hsl(220, 9%, 46%)"
                fillOpacity={0.6}
                name="Neutras"
              />
              <Area
                type="monotone"
                dataKey="negativas"
                stackId="1"
                stroke="hsl(0, 84%, 60%)"
                fill="hsl(0, 84%, 60%)"
                fillOpacity={0.6}
                name="Negativas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
      </div>
    </div>
  );
}
