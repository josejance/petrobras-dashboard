import { useMemo } from 'react';
import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { AIAnalysisCard } from '@/components/dashboard/AIAnalysisCard';
import { parseValue, parseDate, formatCurrency, groupByField, crossAnalysis } from '@/utils/dataTransformers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Paleta verde/laranja baseada nas imagens
const COLORS = {
  positiva: '#2E7D32',
  negativa: '#F57C00',
  alerta: '#FFC107',
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
  // KPIs
  const totalMaterias = data.length;
  
  const mediaVn = useMemo(() => {
    const validK = data.filter(item => item.K !== null && item.K !== undefined);
    if (validK.length === 0) return 0;
    return validK.reduce((sum, item) => sum + (item.K || 0), 0) / validK.length;
  }, [data]);

  const somaVMN = useMemo(() => {
    return data.reduce((sum, item) => sum + parseValue(item.VMN || '0'), 0);
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

    // Sort by date
    const sortedDates = data
      .map(item => parseDate(item.Data))
      .filter(Boolean)
      .sort((a, b) => a!.getTime() - b!.getTime());
    
    const uniqueDates = [...new Set(sortedDates.map(d => format(d!, 'dd/MM', { locale: ptBR })))];

    return uniqueDates.map(key => ({
      date: key,
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
        fullName: name,
        Positiva: values.positiva,
        Negativa: values.negativa,
        total: values.positiva + values.negativa,
      }))
      .sort((a, b) => b.total - a.total)
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
        fullName: name,
        Positiva: values.positiva,
        Negativa: values.negativa,
        total: values.positiva + values.negativa,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{payload[0]?.payload?.fullName || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString('pt-BR')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Dados agregados para IA
  const aggregatedData = useMemo(() => ({
    periodo: 'Período selecionado no filtro',
    totalMaterias,
    mediaVn: mediaVn.toFixed(2),
    somaVMN: formatCurrency(somaVMN),
    distribuicaoAvaliacao: avaliacaoData.map(a => ({ tipo: a.name, quantidade: a.value })),
    topNarrativas: narrativasAvaliacaoData.slice(0, 5).map(n => ({ 
      tema: n.fullName, 
      positivas: n.Positiva, 
      negativas: n.Negativa 
    })),
    topVeiculos: veiculosAvaliacaoData.slice(0, 5).map(v => ({ 
      veiculo: v.fullName, 
      positivas: v.Positiva, 
      negativas: v.Negativa 
    })),
    distribuicaoAbrangencia: materiasAvaliacaoData.map(m => ({
      abrangencia: m.name,
      positivas: m.Positiva,
      negativas: m.Negativa
    })),
  }), [totalMaterias, mediaVn, somaVMN, avaliacaoData, narrativasAvaliacaoData, veiculosAvaliacaoData, materiasAvaliacaoData]);

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
            {mediaVn.toFixed(2)}
          </p>
        </div>
        <div className="bg-background border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Valoração Total (VMN)</p>
          <p className={`text-4xl font-bold ${somaVMN >= 0 ? 'text-[#2E7D32]' : 'text-[#F57C00]'}`}>
            {formatCurrency(somaVMN)}
          </p>
        </div>
      </div>

      {/* Charts Row 1: Matérias x Avaliação + Pizza */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Matérias x Avaliação" description="Distribuição por abrangência">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={materiasAvaliacaoData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tickFormatter={(v) => v.toLocaleString('pt-BR')} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Positiva" stackId="a" fill={COLORS.positiva} />
                <Bar dataKey="Negativa" stackId="a" fill={COLORS.negativa} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Avaliação" description="Distribuição geral">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={avaliacaoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value, percent }) => 
                    `${value.toLocaleString('pt-BR')} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={true}
                >
                  {avaliacaoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => value.toLocaleString('pt-BR')}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Timeline Chart */}
      <ChartCard title="Linha do Tempo das Avaliações" description="Evolução diária do sentimento">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineAvaliacaoData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tickFormatter={(v) => v.toLocaleString('pt-BR')} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="Positiva"
                stackId="1"
                stroke={COLORS.positiva}
                fill={COLORS.positiva}
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="Negativa"
                stackId="1"
                stroke={COLORS.negativa}
                fill={COLORS.negativa}
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Narrativas x Avaliações */}
      <ChartCard title="Narrativas x Avaliações" description="Top 10 temas por sentimento">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={narrativasAvaliacaoData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" tickFormatter={(v) => v.toLocaleString('pt-BR')} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={180} 
                tick={{ fontSize: 11 }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Negativa" stackId="a" fill={COLORS.negativa} />
              <Bar dataKey="Positiva" stackId="a" fill={COLORS.positiva} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Veículos x Avaliações */}
      <ChartCard title="Veículos x Avaliações" description="Top 10 veículos por sentimento">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={veiculosAvaliacaoData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" tickFormatter={(v) => v.toLocaleString('pt-BR')} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={180} 
                tick={{ fontSize: 11 }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Negativa" stackId="a" fill={COLORS.negativa} />
              <Bar dataKey="Positiva" stackId="a" fill={COLORS.positiva} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* AI Analysis Card */}
      <AIAnalysisCard 
        sectionId="panorama"
        sectionLabel="Panorama Global"
        aggregatedData={aggregatedData}
      />
    </div>
  );
}
