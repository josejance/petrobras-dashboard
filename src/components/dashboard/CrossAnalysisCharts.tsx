import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from './ChartCard';
import { groupByField, groupByFieldSum, toChartData, formatCompact, formatCurrency } from '@/utils/dataTransformers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CrossAnalysisChartsProps {
  data: Materia[];
}

export function CrossAnalysisCharts({ data }: CrossAnalysisChartsProps) {
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

  // Veículo x Valor (top 10)
  const veiculoValorData = toChartData(groupByFieldSum(data, 'Veiculo', 'Valor')).slice(0, 10);

  // Tema x Volume
  const temaData = toChartData(groupByField(data, 'Temas')).slice(0, 10);

  // Fonte x Aparições (top 10)
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

  // Abrangência x Valor
  const abrangenciaValorData = toChartData(groupByFieldSum(data, 'Abrangência', 'Valor'));

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Mídia x Avaliação" description="Distribuição de sentimento por tipo de mídia">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={midiaAvaliacaoData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="Positivas" fill="hsl(142, 71%, 45%)" stackId="a" />
              <Bar dataKey="Negativas" fill="hsl(0, 84%, 60%)" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Top 10 Veículos por Valor" description="Veículos com maior valor de mídia">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={veiculoValorData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number" 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => formatCompact(value)}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                width={95}
              />
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                  'Valor'
                ]}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Top 10 Temas" description="Temas mais frequentes nas matérias">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={temaData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                width={95}
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Matérias']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="hsl(262, 83%, 58%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Top 10 Fontes" description="Fontes mais citadas nas matérias">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fonteData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                width={95}
              />
              <Tooltip 
                formatter={(value: number) => [value, 'Aparições']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="hsl(24, 95%, 53%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Destaque x Avaliação" description="Nível de destaque por sentimento">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={destaqueAvaliacaoData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="Positivas" fill="hsl(142, 71%, 45%)" stackId="a" />
              <Bar dataKey="Negativas" fill="hsl(0, 84%, 60%)" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Abrangência x Valor" description="Valor de mídia por abrangência">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={abrangenciaValorData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => formatCompact(value)}
              />
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                  'Valor'
                ]}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="hsl(340, 75%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
      </div>
    </div>
  );
}
