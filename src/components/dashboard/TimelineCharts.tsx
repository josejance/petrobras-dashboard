import { useState, useMemo, useRef } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/exportUtils';
import html2canvas from 'html2canvas';

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
  const chartRef = useRef<HTMLDivElement>(null);

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

  const getExportData = () => {
    const headers = ['Período', metricaLabels[metrica]];
    const rows = chartData.map(item => [
      item.displayLabel,
      metrica === 'volume' ? item.value : formatValue(item.value)
    ]);
    return { headers, rows };
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    exportToCSV({
      headers,
      rows,
      fileName: `evolucao-temporal-${metrica}-${granularidade}`,
    });
  };

  const handleExportExcel = () => {
    const { headers, rows } = getExportData();
    exportToExcel({
      headers,
      rows,
      fileName: `evolucao-temporal-${metrica}-${granularidade}`,
    });
  };

  const handleExportPDF = async () => {
    const { headers, rows } = getExportData();
    
    let chartImageBase64: string | undefined;
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
        });
        chartImageBase64 = canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Erro ao capturar gráfico:', error);
      }
    }

    exportToPDF({
      title: 'Relatório de Evolução Temporal',
      subtitle: `${metricaLabels[metrica]} - ${granularidade === 'dia' ? 'Por Dia' : 'Por Mês'}`,
      headers,
      rows,
      fileName: `relatorio-evolucao-temporal-${metrica}-${granularidade}`,
      chartImageBase64,
    });
  };

  return (
    <div className="space-y-6">
      <ChartCard 
        title="Evolução Temporal" 
        description={`${metricaDescriptions[metrica]} por ${granularidade === 'dia' ? 'dia' : 'mês'}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap gap-4">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background">
              <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4" />
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4" />
                Exportar Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                Exportar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div ref={chartRef} className="h-72">
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
