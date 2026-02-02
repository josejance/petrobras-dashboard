import { useState } from 'react';
import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from '../ChartCard';
import { ChartTypeSelector, ChartType } from '../ChartTypeSelector';
import { FlexibleChart } from '../FlexibleChart';
import { groupByField } from '@/utils/dataTransformers';

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
  const [chartType1, setChartType1] = useState<ChartType>('barHorizontal');
  const [chartType2, setChartType2] = useState<ChartType>('barHorizontal');

  const veiculoData = Object.entries(groupByField(data, 'Veiculo'))
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);
  
  const veiculoVMNData = groupByVMN(data, 'Veiculo').slice(0, 15);

  const currencyFormatter = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

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

      <ChartCard 
        title="Top 15 Veículos por VMN" 
        description="Veículos com maior valor de mídia (VMN total)"
        headerContent={<ChartTypeSelector value={chartType2} onChange={setChartType2} />}
      >
        <FlexibleChart
          data={veiculoVMNData}
          type={chartType2}
          height={320}
          color="hsl(142, 71%, 45%)"
          valueFormatter={currencyFormatter}
          tooltipLabel="VMN Total"
        />
      </ChartCard>
    </div>
  );
}
