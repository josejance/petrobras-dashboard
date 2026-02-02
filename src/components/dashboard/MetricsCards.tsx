import { Card, CardContent } from '@/components/ui/card';
import { Materia } from '@/hooks/useMaterias';
import { parseValue, formatCurrency, formatCompact } from '@/utils/dataTransformers';
import { FileText, DollarSign, Users, TrendingUp, BarChart3 } from 'lucide-react';

interface MetricsCardsProps {
  data: Materia[];
}

export function MetricsCards({ data }: MetricsCardsProps) {
  const totalMaterias = data.length;
  
  const totalValor = data.reduce((sum, item) => {
    return sum + parseValue(item.Valor);
  }, 0);
  
  const totalVMN = data.reduce((sum, item) => {
    return sum + parseValue(item.VMN);
  }, 0);
  
  const totalPublico = data.reduce((sum, item) => {
    return sum + parseValue(item.publico);
  }, 0);
  
  const avgPublico = data.length > 0 ? (totalPublico / data.length) * 10.5 : 0;
  
  const positivas = data.filter(item => 
    item.Teor?.includes('Positiva')
  ).length;
  const negativas = data.filter(item => 
    item.Teor?.includes('Negativa')
  ).length;
  const saldo = positivas - negativas;

  const metrics = [
    {
      title: 'Total de Matérias',
      value: totalMaterias.toLocaleString('pt-BR'),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Valor de Mídia',
      value: formatCompact(totalValor),
      subtitle: formatCurrency(totalValor),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'VMN Total',
      value: formatCompact(totalVMN),
      subtitle: formatCurrency(totalVMN),
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Público Médio',
      value: formatCompact(avgPublico),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Saldo de Avaliação',
      value: saldo > 0 ? `+${saldo}` : saldo.toString(),
      subtitle: `${positivas} positivas / ${negativas} negativas`,
      icon: TrendingUp,
      color: saldo >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: saldo >= 0 ? 'bg-green-100' : 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
                {metric.subtitle && (
                  <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                )}
              </div>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
