import { Materia } from '@/hooks/useMaterias';
import { ChartCard } from '../ChartCard';
import { groupByField, toChartData } from '@/utils/dataTransformers';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MidiaChartsProps {
  data: Materia[];
}

const COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(142, 71%, 45%)',
  'hsl(262, 83%, 58%)',
  'hsl(24, 95%, 53%)',
  'hsl(340, 75%, 55%)',
  'hsl(173, 58%, 39%)',
  'hsl(43, 96%, 56%)',
  'hsl(199, 89%, 48%)',
];

export function MidiaCharts({ data }: MidiaChartsProps) {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <ChartCard title="Distribuição por Mídia" description="Tipo de veículo de comunicação">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={midiaData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {midiaData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [value, 'Matérias']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Distribuição por Tipo" description="Tipo de matéria">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tipoData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                formatter={(value: number) => [value, 'Matérias']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Distribuição por Abrangência" description="Nacional, regional ou local">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={abrangenciaData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {abrangenciaData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [value, 'Matérias']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Mídia x Avaliação" description="Distribuição de sentimento por tipo de mídia" className="lg:col-span-2 xl:col-span-3">
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
      </div>
    </div>
  );
}
