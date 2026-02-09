import { useState, useMemo } from 'react';
import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { ChartTypeSelector, ChartType } from '@/components/dashboard/ChartTypeSelector';
import { FlexibleChart } from '@/components/dashboard/FlexibleChart';
import { parseValue, parseDate, formatCurrencyCompact, groupByField } from '@/utils/dataTransformers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Paleta verde/laranja baseada nas imagens
const COLORS = {
  positiva: '#2E7D32',
  negativa: '#F57C00',
};

const SENTIMENT_COLORS: Record<string, string> = {
  'Positiva': COLORS.positiva,
  'Muito Positiva': '#1B5E20',
  'Pouco Positiva': '#4CAF50',
  'Negativa': COLORS.negativa,
  'Muito Negativa': '#E65100',
  'Pouco Negativa': '#FF9800',
  'Neutra': '#9E9E9E',
};

interface PanoramaGlobalChartsProps {
  data: Materia[];
}

export function PanoramaGlobalCharts({ data }: PanoramaGlobalChartsProps) {
  const [chartTypeMateriasAvaliacao, setChartTypeMateriasAvaliacao] = useState<ChartType>('stackedHorizontal');
  const [chartTypeAvaliacao, setChartTypeAvaliacao] = useState<ChartType>('pie');
  const [chartTypeTimeline, setChartTypeTimeline] = useState<ChartType>('stacked');
  const [chartTypeNarrativas, setChartTypeNarrativas] = useState<ChartType>('stackedHorizontal');
  const [chartTypeVeiculos, setChartTypeVeiculos] = useState<ChartType>('stackedHorizontal');

  // KPIs
  const totalMaterias = data.length;
  
  const mediaVn = useMemo(() => {
    const validItems = data.filter(item => {
      const vn = item['Vn'] as string | number | null | undefined;
      return vn !== null && vn !== undefined && vn !== '';
    });
    if (validItems.length === 0) return 0;
    const sum = validItems.reduce((acc, item) => {
      const vn = item['Vn'] as string | number | null | undefined;
      return acc + parseValue(vn);
    }, 0);
    return sum / validItems.length;
  }, [data]);

  const somaVMN = useMemo(() => {
    return data.reduce((sum, item) => sum + parseValue(item.VMN), 0);
  }, [data]);

  // Avaliação (Sentimento) - Pizza
  const avaliacaoData = useMemo(() => {
    const grouped = groupByField(data, 'Avaliação');
    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value,
        color: SENTIMENT_COLORS[name] || '#9E9E9E',
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const avaliacaoColors = avaliacaoData.map(d => d.color);

  // Matérias x Avaliação (barras horizontais por Abrangência)
  const materiasAvaliacaoData = useMemo(() => {
    const result: Record<string, { positiva: number; negativa: number }> = {};
    
    data.forEach(item => {
      const abrangencia = item.Abrangência || 'Não informado';
      const avaliacao = item.Avaliação || '';
      
      if (!result[abrangencia]) {
        result[abrangencia] = { positiva: 0, negativa: 0 };
      }
      
      if (avaliacao.toLowerCase().includes('positiv')) {
        result[abrangencia].positiva += 1;
      } else if (avaliacao.toLowerCase().includes('negativ')) {
        result[abrangencia].negativa += 1;
      }
    });

    return Object.entries(result)
      .map(([name, values]) => ({
        name,
        Positiva: values.positiva,
        Negativa: values.negativa,
      }))
      .sort((a, b) => (b.Positiva + b.Negativa) - (a.Positiva + a.Negativa));
  }, [data]);

  // Linha do tempo das avaliações
  const timelineAvaliacaoData = useMemo(() => {
    const grouped: Record<string, { positiva: number; negativa: number }> = {};
    
    data.forEach(item => {
      const date = parseDate(item.Data);
      if (!date) return;
      
      const key = format(date, 'dd/MM', { locale: ptBR });
      const avaliacao = item.Avaliação || '';
      
      if (!grouped[key]) {
        grouped[key] = { positiva: 0, negativa: 0 };
      }
      
      if (avaliacao.toLowerCase().includes('positiv')) {
        grouped[key].positiva += 1;
      } else if (avaliacao.toLowerCase().includes('negativ')) {
        grouped[key].negativa += 1;
      }
    });

    const sortedDates = data
      .map(item => parseDate(item.Data))
      .filter(Boolean)
      .sort((a, b) => a!.getTime() - b!.getTime());
    
    const uniqueDates = [...new Set(sortedDates.map(d => format(d!, 'dd/MM', { locale: ptBR })))];

    return uniqueDates.map(key => ({
      name: key,
      Positiva: grouped[key]?.positiva || 0,
      Negativa: grouped[key]?.negativa || 0,
    }));
  }, [data]);

  // Narrativas (Temas) x Avaliações
  const narrativasAvaliacaoData = useMemo(() => {
    const result: Record<string, { positiva: number; negativa: number }> = {};
    
    data.forEach(item => {
      const tema = item.Temas || 'Não informado';
      const avaliacao = item.Avaliação || '';
      
      if (!result[tema]) {
        result[tema] = { positiva: 0, negativa: 0 };
      }
      
      if (avaliacao.toLowerCase().includes('positiv')) {
        result[tema].positiva += 1;
      } else if (avaliacao.toLowerCase().includes('negativ')) {
        result[tema].negativa += 1;
      }
    });

    return Object.entries(result)
      .map(([name, values]) => ({
        name: name.length > 40 ? name.substring(0, 40) + '...' : name,
        Positiva: values.positiva,
        Negativa: values.negativa,
      }))
      .sort((a, b) => (b.Positiva + b.Negativa) - (a.Positiva + a.Negativa))
      .slice(0, 10);
  }, [data]);

  // Veículos x Avaliações
  const veiculosAvaliacaoData = useMemo(() => {
    const result: Record<string, { positiva: number; negativa: number }> = {};
    
    data.forEach(item => {
      const veiculo = item.Veiculo || 'Não informado';
      const avaliacao = item.Avaliação || '';
      
      if (!result[veiculo]) {
        result[veiculo] = { positiva: 0, negativa: 0 };
      }
      
      if (avaliacao.toLowerCase().includes('positiv')) {
        result[veiculo].positiva += 1;
      } else if (avaliacao.toLowerCase().includes('negativ')) {
        result[veiculo].negativa += 1;
      }
    });

    return Object.entries(result)
      .map(([name, values]) => ({
        name: name.length > 35 ? name.substring(0, 35) + '...' : name,
        Positiva: values.positiva,
        Negativa: values.negativa,
      }))
      .sort((a, b) => (b.Positiva + b.Negativa) - (a.Positiva + a.Negativa))
      .slice(0, 10);
  }, [data]);

  const stackedKeys = [
    { key: 'Positiva', color: COLORS.positiva },
    { key: 'Negativa', color: COLORS.negativa },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Total de Matérias</p>
          <p className="text-4xl font-bold text-foreground">
            {totalMaterias.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="bg-background border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Média Vn</p>
          <p className="text-4xl font-bold text-foreground">
            {(typeof mediaVn === 'number' && !isNaN(mediaVn) ? mediaVn : 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-background border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Valoração Total (VMN)</p>
          <p className={`text-4xl font-bold ${somaVMN >= 0 ? 'text-[#2E7D32]' : 'text-[#F57C00]'}`}>
            {formatCurrencyCompact(somaVMN)}
          </p>
        </div>
      </div>

      {/* Charts Row 1: Matérias x Avaliação + Pizza */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Abrangência" 
          description="Distribuição por abrangência"
          headerContent={<ChartTypeSelector value={chartTypeMateriasAvaliacao} onChange={setChartTypeMateriasAvaliacao} options={['stackedHorizontal', 'stacked', 'bar']} />}
        >
          <FlexibleChart
            data={materiasAvaliacaoData}
            type={chartTypeMateriasAvaliacao}
            height={320}
            stackedKeys={stackedKeys}
            showLegend
            tooltipLabel="Matérias"
          />
        </ChartCard>

        <ChartCard 
          title="Avaliação" 
          description="Distribuição geral"
          headerContent={<ChartTypeSelector value={chartTypeAvaliacao} onChange={setChartTypeAvaliacao} />}
        >
          <FlexibleChart
            data={avaliacaoData}
            type={chartTypeAvaliacao}
            height={320}
            colors={avaliacaoColors}
            showLegend
            tooltipLabel="Matérias"
          />
        </ChartCard>
      </div>

      {/* Timeline Chart */}
      <ChartCard 
        title="Linha do Tempo das Avaliações" 
        description="Evolução diária do sentimento"
        headerContent={<ChartTypeSelector value={chartTypeTimeline} onChange={setChartTypeTimeline} options={['area', 'bar', 'stacked']} />}
      >
        <FlexibleChart
          data={timelineAvaliacaoData}
          type={chartTypeTimeline}
          height={320}
          stackedKeys={stackedKeys}
          showLegend
          tooltipLabel="Matérias"
        />
      </ChartCard>

      {/* Narrativas x Avaliações */}
      <ChartCard 
        title="Narrativas x Avaliações" 
        description="Top 10 temas por sentimento"
        headerContent={<ChartTypeSelector value={chartTypeNarrativas} onChange={setChartTypeNarrativas} options={['stackedHorizontal', 'stacked', 'bar']} />}
      >
        <FlexibleChart
          data={narrativasAvaliacaoData}
          type={chartTypeNarrativas}
          height={384}
          stackedKeys={stackedKeys}
          showLegend
          leftMargin={200}
          yAxisWidth={180}
          tooltipLabel="Matérias"
        />
      </ChartCard>

      {/* Veículos x Avaliações */}
      <ChartCard 
        title="Veículos x Avaliações" 
        description="Top 10 veículos por sentimento"
        headerContent={<ChartTypeSelector value={chartTypeVeiculos} onChange={setChartTypeVeiculos} options={['stackedHorizontal', 'stacked', 'bar']} />}
      >
        <FlexibleChart
          data={veiculosAvaliacaoData}
          type={chartTypeVeiculos}
          height={384}
          stackedKeys={stackedKeys}
          showLegend
          leftMargin={200}
          yAxisWidth={180}
          tooltipLabel="Matérias"
        />
      </ChartCard>
    </div>
  );
}
