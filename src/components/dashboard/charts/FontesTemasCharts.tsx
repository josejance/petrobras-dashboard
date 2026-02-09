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
  const [chartTypeJornalistas, setChartTypeJornalistas] = useState<ChartType>('barHorizontal');
  const [chartTypeColunistas, setChartTypeColunistas] = useState<ChartType>('barHorizontal');

  const temaData = toChartData(groupByField(data, 'Temas')).slice(0, 10);
  const fonteData = toChartData(groupByField(data, 'Fonte'))
    .filter(item => item.name !== 'Não informado' && item.name !== '')
    .slice(0, 10);

  // Jornalistas ranking (autor field, filtering out empty)
  const jornalistaData = (() => {
    const grouped: Record<string, number> = {};
    data.forEach(item => {
      const autor = String(item.autor || '').trim();
      if (!autor) return;
      // Exclude entries that look like columnist type
      const tipo = String(item.Tipo || '').trim().toLowerCase();
      if (tipo === 'coluna' || tipo === 'artigo') return;
      grouped[autor] = (grouped[autor] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  })();

  // Colunistas ranking (autor field, only Coluna/Artigo types)
  const colunistaData = (() => {
    const grouped: Record<string, number> = {};
    data.forEach(item => {
      const autor = String(item.autor || '').trim();
      if (!autor) return;
      const tipo = String(item.Tipo || '').trim().toLowerCase();
      if (tipo !== 'coluna' && tipo !== 'artigo') return;
      grouped[autor] = (grouped[autor] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  })();

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
        title="Top 10 Jornalistas" 
        description="Jornalistas com mais matérias"
        headerContent={<ChartTypeSelector value={chartTypeJornalistas} onChange={setChartTypeJornalistas} />}
      >
        <FlexibleChart
          data={jornalistaData}
          type={chartTypeJornalistas}
          height={400}
          color="hsl(221, 83%, 53%)"
          tooltipLabel="Matérias"
          leftMargin={200}
          yAxisWidth={190}
        />
      </ChartCard>

      <ChartCard 
        title="Top 10 Colunistas" 
        description="Colunistas com mais publicações"
        headerContent={<ChartTypeSelector value={chartTypeColunistas} onChange={setChartTypeColunistas} />}
      >
        <FlexibleChart
          data={colunistaData}
          type={chartTypeColunistas}
          height={400}
          color="hsl(38, 92%, 50%)"
          tooltipLabel="Publicações"
          leftMargin={200}
          yAxisWidth={190}
        />
      </ChartCard>
    </div>
  );
}
