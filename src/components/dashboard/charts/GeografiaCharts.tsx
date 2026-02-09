import { useState } from 'react';
import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from '../ChartCard';
import { ChartTypeSelector, ChartType } from '../ChartTypeSelector';
import { FlexibleChart } from '../FlexibleChart';
import { groupByField } from '@/utils/dataTransformers';

interface GeografiaChartsProps {
  data: Materia[];
}

export function GeografiaCharts({ data }: GeografiaChartsProps) {
  const [chartType1, setChartType1] = useState<ChartType>('barHorizontal');

  const ufData = Object.entries(groupByField(data, 'uf'))
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);

  return (
    <div className="space-y-6">
      <ChartCard 
        title="Top 15 Estados por Volume" 
        description="Distribuição geográfica por UF"
        headerContent={<ChartTypeSelector value={chartType1} onChange={setChartType1} />}
      >
        <FlexibleChart
          data={ufData}
          type={chartType1}
          height={320}
          color="hsl(24, 95%, 53%)"
          tooltipLabel="Matérias"
        />
      </ChartCard>
    </div>
  );
}
