import { useMaterias } from '@/hooks/useMaterias';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { TimelineCharts } from '@/components/dashboard/TimelineCharts';
import { DistributionCharts } from '@/components/dashboard/DistributionCharts';
import { CrossAnalysisCharts } from '@/components/dashboard/CrossAnalysisCharts';
import { SentimentCharts } from '@/components/dashboard/SentimentCharts';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Dashboard() {
  const { data: materias, isLoading, error } = useMaterias();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar dados</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!materias || materias.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sem dados</AlertTitle>
            <AlertDescription>
              Nenhuma matéria encontrada no banco de dados.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Clipping
          </h1>
          <p className="text-muted-foreground">
            Análise de {materias.length.toLocaleString('pt-BR')} matérias
          </p>
        </div>

        {/* KPIs */}
        <section>
          <MetricsCards data={materias} />
        </section>

        {/* Timeline Charts */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Evolução Temporal</h2>
          <TimelineCharts data={materias} />
        </section>

        {/* Distribution Charts */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Distribuições</h2>
          <DistributionCharts data={materias} />
        </section>

        {/* Cross Analysis */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Cruzamentos</h2>
          <CrossAnalysisCharts data={materias} />
        </section>

        {/* Sentiment Analysis */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Análise de Sentimento</h2>
          <SentimentCharts data={materias} />
        </section>
      </div>
    </div>
  );
}
