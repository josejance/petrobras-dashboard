import { useState } from 'react';
import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from '../ChartCard';
import { ChartTypeSelector, ChartType } from '../ChartTypeSelector';
import { FlexibleChart } from '../FlexibleChart';
import { groupByField, toChartData } from '@/utils/dataTransformers';

interface FontesTemasChartsProps {
  data: Materia[];
}

export function FontesTemasCharts({ data }: FontesTemasChartsProps) {
  const [chartType1, setChartType1] = useState<ChartType>('barHorizontal');
  const [chartType2, setChartType2] = useState<ChartType>('barHorizontal');
  const [chartType3, setChartType3] = useState<ChartType>('stacked');

  const temaData = toChartData(groupByField(data, 'Temas')).slice(0, 10);
  const fonteData = toChartData(groupByField(data, 'Fonte'))
    .filter(item => item.name !== 'Não informado' && item.name !== '')
    .slice(0, 10);

  // Destaque x Avaliação
  const destaqueAvaliacaoData = (() => {
    const result: Record<string, { name: string; Positivas: number; Negativas: number }> = {};
    
    data.forEach(item => {
      const destaque = item.Destaque || 'Não informado';
      if (!result[destaque]) {
        result[destaque] = { name: destaque, Positivas: 0, Negativas: 0 };
      }
      
      const teor = item.Teor || '';
      if (teor.toLowerCase().includes('positiva')) {
        result[destaque].Positivas += 1;
      } else if (teor.toLowerCase().includes('negativa')) {
        result[destaque].Negativas += 1;
      }
    });
    
    return Object.values(result);
  })();

  const stackedKeys = [
    { key: 'Positivas', color: 'hsl(142, 71%, 45%)' },
    { key: 'Negativas', color: 'hsl(0, 84%, 60%)' },
  ];

  return (
    <div className="space-y-6">
      <ChartCard 
        title="Top 10 Temas" 
        description="Temas mais frequentes nas matérias"
        headerContent={<ChartTypeSelector value={chartType1} onChange={setChartType1} />}
      >
        <FlexibleChart
          data={temaData}
          type={chartType1}
          height={360}
          color="hsl(262, 83%, 58%)"
          tooltipLabel="Matérias"
          leftMargin={200}
          yAxisWidth={190}
        />
      </ChartCard>

      <ChartCard 
        title="Top 10 Fontes" 
        description="Fontes mais citadas nas matérias"
        headerContent={<ChartTypeSelector value={chartType2} onChange={setChartType2} />}
      >
        <FlexibleChart
          data={fonteData}
          type={chartType2}
          height={360}
          color="hsl(24, 95%, 53%)"
          tooltipLabel="Aparições"
          leftMargin={200}
          yAxisWidth={190}
        />
      </ChartCard>

      <ChartCard 
        title="Destaque x Avaliação" 
        description="Nível de destaque por sentimento"
        headerContent={<ChartTypeSelector value={chartType3} onChange={setChartType3} options={['stacked', 'stackedHorizontal', 'bar']} />}
      >
        <FlexibleChart
          data={destaqueAvaliacaoData}
          type={chartType3}
          height={256}
          stackedKeys={stackedKeys}
          showLegend
          tooltipLabel="Matérias"
        />
      </ChartCard>
    </div>
  );
}
