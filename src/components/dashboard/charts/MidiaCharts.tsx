import { useState } from 'react';
import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from '../ChartCard';
import { ChartTypeSelector, ChartType } from '../ChartTypeSelector';
import { FlexibleChart } from '../FlexibleChart';
import { groupByField, toChartData } from '@/utils/dataTransformers';

interface MidiaChartsProps {
  data: Materia[];
}

export function MidiaCharts({ data }: MidiaChartsProps) {
  const [chartType1, setChartType1] = useState<ChartType>('pie');
  const [chartType2, setChartType2] = useState<ChartType>('bar');
  const [chartType3, setChartType3] = useState<ChartType>('pie');
  const [chartType4, setChartType4] = useState<ChartType>('stacked');

  const midiaData = toChartData(groupByField(data, 'Mídia'));
  const tipoData = toChartData(groupByField(data, 'Tipo'));
  const abrangenciaData = toChartData(groupByField(data, 'Abrangência'));

  // Mídia x Avaliação
  const midiaAvaliacaoData = (() => {
    const result: Record<string, { name: string; Positivas: number; Negativas: number }> = {};
    
    data.forEach(item => {
      const midia = item.Mídia || 'Não informado';
      if (!result[midia]) {
        result[midia] = { name: midia, Positivas: 0, Negativas: 0 };
      }
      
      const teor = item.Teor || '';
      if (teor.toLowerCase().includes('positiva')) {
        result[midia].Positivas += 1;
      } else if (teor.toLowerCase().includes('negativa')) {
        result[midia].Negativas += 1;
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
        title="Distribuição por Mídia" 
        description="Tipo de veículo de comunicação"
        headerContent={<ChartTypeSelector value={chartType1} onChange={setChartType1} />}
      >
        <FlexibleChart
          data={midiaData}
          type={chartType1}
          height={320}
          color="hsl(221, 83%, 53%)"
          tooltipLabel="Matérias"
        />
      </ChartCard>

      <ChartCard 
        title="Distribuição por Tipo" 
        description="Tipo de matéria"
        headerContent={<ChartTypeSelector value={chartType2} onChange={setChartType2} />}
      >
        <FlexibleChart
          data={tipoData}
          type={chartType2}
          height={320}
          color="hsl(262, 83%, 58%)"
          tooltipLabel="Matérias"
        />
      </ChartCard>

      <ChartCard 
        title="Distribuição por Abrangência" 
        description="Nacional, regional ou local"
        headerContent={<ChartTypeSelector value={chartType3} onChange={setChartType3} />}
      >
        <FlexibleChart
          data={abrangenciaData}
          type={chartType3}
          height={320}
          color="hsl(24, 95%, 53%)"
          tooltipLabel="Matérias"
        />
      </ChartCard>

      <ChartCard 
        title="Mídia x Avaliação" 
        description="Distribuição de sentimento por tipo de mídia"
        headerContent={<ChartTypeSelector value={chartType4} onChange={setChartType4} options={['stacked', 'stackedHorizontal', 'bar']} />}
      >
        <FlexibleChart
          data={midiaAvaliacaoData}
          type={chartType4}
          height={256}
          stackedKeys={stackedKeys}
          showLegend
          tooltipLabel="Matérias"
        />
      </ChartCard>
    </div>
  );
}
