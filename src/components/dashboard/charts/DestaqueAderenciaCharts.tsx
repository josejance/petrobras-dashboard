import { useState, useMemo } from 'react';
import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from '../ChartCard';
import { ChartTypeSelector, ChartType } from '../ChartTypeSelector';
import { FlexibleChart } from '../FlexibleChart';
import { groupByField, toChartData, parseDate } from '@/utils/dataTransformers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DestaqueAderenciaChartsProps {
  data: Materia[];
}

export function DestaqueAderenciaCharts({ data }: DestaqueAderenciaChartsProps) {
  const [chartTypeDestaque, setChartTypeDestaque] = useState<ChartType>('bar');
  const [chartTypeDestaqueTimeline, setChartTypeDestaqueTimeline] = useState<ChartType>('stacked');
  const [chartTypeAderencia, setChartTypeAderencia] = useState<ChartType>('bar');
  const [chartTypeAderenciaTimeline, setChartTypeAderenciaTimeline] = useState<ChartType>('stacked');

  // Destaque distribution
  const destaqueData = useMemo(() => {
    return toChartData(groupByField(data, 'Destaque'));
  }, [data]);

  // Aderência distribution
  const aderenciaData = useMemo(() => {
    return toChartData(groupByField(data, 'Aderência'));
  }, [data]);

  // Destaque timeline
  const destaqueTimelineData = useMemo(() => {
    const destaqueValues = [...new Set(data.map(d => String(d.Destaque || 'Não informado').trim()).filter(Boolean))];
    const grouped: Record<string, Record<string, number>> = {};

    data.forEach(item => {
      const date = parseDate(item.Data);
      if (!date) return;
      const key = format(date, 'dd/MM', { locale: ptBR });
      const destaque = String(item.Destaque || 'Não informado').trim();

      if (!grouped[key]) grouped[key] = {};
      grouped[key][destaque] = (grouped[key][destaque] || 0) + 1;
    });

    const sortedDates = data
      .map(item => parseDate(item.Data))
      .filter(Boolean)
      .sort((a, b) => a!.getTime() - b!.getTime());
    const uniqueDates = [...new Set(sortedDates.map(d => format(d!, 'dd/MM', { locale: ptBR })))];

    return {
      data: uniqueDates.map(key => ({
        name: key,
        ...Object.fromEntries(destaqueValues.map(v => [v, grouped[key]?.[v] || 0])),
      })),
      keys: destaqueValues,
    };
  }, [data]);

  // Aderência timeline
  const aderenciaTimelineData = useMemo(() => {
    const aderenciaValues = [...new Set(data.map(d => String(d.Aderência || 'Não informado').trim()).filter(Boolean))];
    const grouped: Record<string, Record<string, number>> = {};

    data.forEach(item => {
      const date = parseDate(item.Data);
      if (!date) return;
      const key = format(date, 'dd/MM', { locale: ptBR });
      const aderencia = String(item.Aderência || 'Não informado').trim();

      if (!grouped[key]) grouped[key] = {};
      grouped[key][aderencia] = (grouped[key][aderencia] || 0) + 1;
    });

    const sortedDates = data
      .map(item => parseDate(item.Data))
      .filter(Boolean)
      .sort((a, b) => a!.getTime() - b!.getTime());
    const uniqueDates = [...new Set(sortedDates.map(d => format(d!, 'dd/MM', { locale: ptBR })))];

    return {
      data: uniqueDates.map(key => ({
        name: key,
        ...Object.fromEntries(aderenciaValues.map(v => [v, grouped[key]?.[v] || 0])),
      })),
      keys: aderenciaValues,
    };
  }, [data]);

  const DESTAQUE_COLORS = ['#2E7D32', '#F57C00', '#9E9E9E', '#1B5E20', '#E65100'];
  const ADERENCIA_COLORS = ['#2E7D32', '#F57C00', '#4CAF50', '#FF9800', '#9E9E9E'];

  const destaqueStackedKeys = destaqueTimelineData.keys.map((key, i) => ({
    key,
    color: DESTAQUE_COLORS[i % DESTAQUE_COLORS.length],
  }));

  const aderenciaStackedKeys = aderenciaTimelineData.keys.map((key, i) => ({
    key,
    color: ADERENCIA_COLORS[i % ADERENCIA_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <ChartCard
        title="Nível de Destaque"
        description="Distribuição por nível de destaque"
        headerContent={<ChartTypeSelector value={chartTypeDestaque} onChange={setChartTypeDestaque} />}
      >
        <FlexibleChart
          data={destaqueData}
          type={chartTypeDestaque}
          height={320}
          color="hsl(221, 83%, 53%)"
          tooltipLabel="Matérias"
        />
      </ChartCard>

      <ChartCard
        title="Evolução Temporal do Destaque"
        description="Variação do nível de destaque ao longo do tempo"
        headerContent={<ChartTypeSelector value={chartTypeDestaqueTimeline} onChange={setChartTypeDestaqueTimeline} options={['stacked', 'area', 'bar']} />}
      >
        <FlexibleChart
          data={destaqueTimelineData.data}
          type={chartTypeDestaqueTimeline}
          height={320}
          stackedKeys={destaqueStackedKeys}
          showLegend
          tooltipLabel="Matérias"
        />
      </ChartCard>

      <ChartCard
        title="Aderência"
        description="Distribuição por tipo de aderência"
        headerContent={<ChartTypeSelector value={chartTypeAderencia} onChange={setChartTypeAderencia} />}
      >
        <FlexibleChart
          data={aderenciaData}
          type={chartTypeAderencia}
          height={320}
          color="hsl(24, 95%, 53%)"
          tooltipLabel="Matérias"
        />
      </ChartCard>

      <ChartCard
        title="Evolução Temporal da Aderência"
        description="Variação da aderência ao longo do tempo"
        headerContent={<ChartTypeSelector value={chartTypeAderenciaTimeline} onChange={setChartTypeAderenciaTimeline} options={['stacked', 'area', 'bar']} />}
      >
        <FlexibleChart
          data={aderenciaTimelineData.data}
          type={chartTypeAderenciaTimeline}
          height={320}
          stackedKeys={aderenciaStackedKeys}
          showLegend
          tooltipLabel="Matérias"
        />
      </ChartCard>
    </div>
  );
}
