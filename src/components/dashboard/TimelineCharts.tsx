import { useState, useMemo } from 'react';
import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from './ChartCard';
import { parseValue, parseDate } from '@/utils/dataTransformers';
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
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimelineChartsProps {
  data: Materia[];
}

type Granularidade = 'dia' | 'mes';
type Metrica = 'volume' | 'vn_medio' | 'vmn_medio';

const metricaLabels: Record<Metrica, string> = {
  volume: 'Volume de Publicações',
  vn_medio: 'VN Médio Diário',
  vmn_medio: 'VMN Médio Diário',
};

const metricaDescriptions: Record<Metrica, string> = {
  volume: 'Quantidade de matérias',
  vn_medio: 'Média diária de Valoração',
  vmn_medio: 'Média diária de Valor de Mídia Nominal',
};

export function TimelineCharts({ data }: TimelineChartsProps) {
  const [granularidade, setGranularidade] = useState<Granularidade>('mes');
  const [metrica, setMetrica] = useState<Metrica>('volume');

  const chartData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      const date = parseDate(item.Data);
      if (!date) return acc;

      const key = granularidade === 'dia' 
        ? format(date, 'yyyy-MM-dd')
        : format(date, 'yyyy-MM');
      
      const displayLabel = granularidade === 'dia'
        ? format(date, 'dd/MM/yy', { locale: ptBR })
        : format(date, 'MMM/yy', { locale: ptBR });

      if (!acc[key]) {
        acc[key] = { 
          key, 
          displayLabel, 
          count: 0, 
          vnTotal: 0, 
          vmnTotal: 0,
          dias: new Set<string>()
        };
      }

      acc[key].count += 1;
      acc[key].vnTotal += parseValue(item.Vn);
      acc[key].vmnTotal += parseValue(item.VMN);
      acc[key].dias.add(format(date, 'yyyy-MM-dd'));

      return acc;
    }, {} as Record<string, { 
      key: string; 
      displayLabel: string; 
      count: number; 
      vnTotal: number; 
      vmnTotal: number;
      dias: Set<string>;
    }>);

    return Object.values(grouped)
      .map(item => ({
        key: item.key,
        displayLabel: item.displayLabel,
        value: metrica === 'volume' 
          ? item.count 
          : metrica === 'vn_medio'
            ? item.vnTotal / (item.dias.size || 1)
            : item.vmnTotal / (item.dias.size || 1),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [data, granularidade, metrica]);

  const formatValue = (value: number) => {
    if (metrica === 'volume') {
      return value.toLocaleString('pt-BR');
    }
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const tooltipLabel = metrica === 'volume' ? 'Matérias' : metrica === 'vn_medio' ? 'VN Médio' : 'VMN Médio';

  return (
    <div className="space-y-6">
      <ChartCard 
        title="Evolução Temporal" 
        description={`${metricaDescriptions[metrica]} por ${granularidade === 'dia' ? 'dia' : 'mês'}`}
      >
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Período:</span>
            <Select value={granularidade} onValueChange={(v) => setGranularidade(v as Granularidade)}>
              <SelectTrigger className="w-[120px] h-9 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="dia">Por Dia</SelectItem>
                <SelectItem value="mes">Por Mês</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Métrica:</span>
            <Select value={metrica} onValueChange={(v) => setMetrica(v as Metrica)}>
              <SelectTrigger className="w-[200px] h-9 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="volume">Volume de Publicações</SelectItem>
                <SelectItem value="vn_medio">VN Médio Diário</SelectItem>
                <SelectItem value="vmn_medio">VMN Médio Diário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="displayLabel" 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                interval={granularidade === 'dia' ? 'preserveStartEnd' : 0}
                angle={granularidade === 'dia' ? -45 : 0}
                textAnchor={granularidade === 'dia' ? 'end' : 'middle'}
                height={granularidade === 'dia' ? 60 : 30}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => formatValue(value)}
              />
              <Tooltip 
                formatter={(value: number) => [formatValue(value), tooltipLabel]}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(221, 83%, 53%)"
                fill="hsl(221, 83%, 53%)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
