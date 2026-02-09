import { useState, useMemo } from 'react';
import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from './ChartCard';
import { ChartTypeSelector, ChartType } from './ChartTypeSelector';
import { FlexibleChart } from './FlexibleChart';
import { groupByField, toChartData } from '@/utils/dataTransformers';

interface SentimentChartsProps {
  data: Materia[];
}

const SENTIMENT_COLORS: Record<string, string> = {
  'Muito Positiva': '#1B5E20',
  'Positiva': '#2E7D32',
  'Pouco positiva': '#4CAF50',
  'Pouco Positiva': '#4CAF50',
  'Negativa': '#F57C00',
  'Muito Negativa': '#E65100',
  'Pouco Negativa': '#FF9800',
  'Não informado': '#9E9E9E',
};

export function SentimentCharts({ data }: SentimentChartsProps) {
  const [chartTypeAvaliacao, setChartTypeAvaliacao] = useState<ChartType>('pie');

  const avaliacaoData = toChartData(groupByField(data, 'Avaliação')).map(item => ({
    name: item.name,
    value: item.value,
    color: SENTIMENT_COLORS[item.name] || SENTIMENT_COLORS['Não informado'],
  }));

  const avaliacaoColors = avaliacaoData.map(d => d.color);

  // Calculate sentiment summary for the legend
  const positivas = data.filter(item => 
    item.Avaliação?.toLowerCase().includes('positiva')
  ).length;
  const negativas = data.filter(item => 
    item.Avaliação?.toLowerCase().includes('negativa')
  ).length;
  const total = data.length;
  const percentPositivo = total > 0 ? (positivas / total) * 100 : 0;

  return (
    <div className="space-y-6">
      <ChartCard 
        title="Distribuição por Avaliação" 
        description="Classificação de sentimento das matérias"
        headerContent={<ChartTypeSelector value={chartTypeAvaliacao} onChange={setChartTypeAvaliacao} />}
      >
        <FlexibleChart
          data={avaliacaoData}
          type={chartTypeAvaliacao}
          height={280}
          colors={avaliacaoColors}
          showLegend
          tooltipLabel="Matérias"
        />
        <div className="flex items-center justify-center gap-8 mt-4 pb-2 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2E7D32' }} />
            <span>{positivas.toLocaleString('pt-BR')} positivas ({percentPositivo.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F57C00' }} />
            <span>{negativas.toLocaleString('pt-BR')} negativas ({(100 - percentPositivo).toFixed(0)}%)</span>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
