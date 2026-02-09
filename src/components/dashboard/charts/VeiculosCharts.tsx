import { useState } from 'react';
import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from '../ChartCard';
import { ChartTypeSelector, ChartType } from '../ChartTypeSelector';
import { FlexibleChart } from '../FlexibleChart';
import { groupByField } from '@/utils/dataTransformers';

interface VeiculosChartsProps {
  data: Materia[];
}

export function VeiculosCharts({ data }: VeiculosChartsProps) {
  const [chartType1, setChartType1] = useState<ChartType>('barHorizontal');

  const veiculoData = Object.entries(groupByField(data, 'Veiculo'))
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);

  return (
    <div className="space-y-6">
      <ChartCard 
        title="Top 15 Veículos por Volume" 
        description="Veículos com mais matérias"
        headerContent={<ChartTypeSelector value={chartType1} onChange={setChartType1} />}
      >
        <FlexibleChart
          data={veiculoData}
          type={chartType1}
          height={320}
          color="hsl(221, 83%, 53%)"
          tooltipLabel="Matérias"
        />
      </ChartCard>
    </div>
  );
}
