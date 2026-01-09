import { useMemo } from 'react';
import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from '../ChartCard';
import { AIAnalysisCard } from '../AIAnalysisCard';
import { groupByField, toChartData } from '@/utils/dataTransformers';
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

interface FontesTemasChartsProps {
  data: Materia[];
}

export function FontesTemasCharts({ data }: FontesTemasChartsProps) {
  const temaData = toChartData(groupByField(data, 'Temas')).slice(0, 15);
  const fonteData = toChartData(groupByField(data, 'Fonte'))
    .filter(item => item.name !== 'Não informado' && item.name !== '')
    .slice(0, 15);

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

  // Dados agregados para IA
  const aggregatedData = useMemo(() => ({
    topTemas: temaData.map(t => ({ tema: t.name, quantidade: t.value })),
    topFontes: fonteData.map(f => ({ fonte: f.name, aparicoes: f.value })),
    destaqueXAvaliacao: destaqueAvaliacaoData.map(d => ({ 
      destaque: d.name, 
      positivas: d.Positivas, 
      negativas: d.Negativas 
    })),
  }), [temaData, fonteData, destaqueAvaliacaoData]);

  return (
    <div className="space-y-6">
      <AIAnalysisCard 
        sectionId="fontes_temas"
        sectionLabel="Fontes e Temas"
        aggregatedData={aggregatedData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Top 15 Temas" description="Temas mais frequentes nas matérias">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={temaData} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                width={115}
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

      <ChartCard title="Top 15 Fontes" description="Fontes mais citadas nas matérias">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fonteData} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                width={115}
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

      <ChartCard title="Destaque x Avaliação" description="Nível de destaque por sentimento" className="lg:col-span-2">
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
      </div>
    </div>
  );
}
