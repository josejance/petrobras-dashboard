import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useMaterias } from '@/hooks/useMaterias';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { TimelineCharts } from '@/components/dashboard/TimelineCharts';
import { SentimentCharts } from '@/components/dashboard/SentimentCharts';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { DashboardSidebar, DASHBOARD_SECTIONS } from '@/components/dashboard/DashboardSidebar';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { MidiaCharts } from '@/components/dashboard/charts/MidiaCharts';
import { VeiculosCharts } from '@/components/dashboard/charts/VeiculosCharts';
import { GeografiaCharts } from '@/components/dashboard/charts/GeografiaCharts';
import { FontesTemasCharts } from '@/components/dashboard/charts/FontesTemasCharts';
import { PanoramaGlobalCharts } from '@/components/dashboard/charts/PanoramaGlobalCharts';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { parseDate } from '@/utils/dataTransformers';

export default function Dashboard() {
  const { data: materias, isLoading, error } = useMaterias();
  
  // Datas pendentes (selecionadas mas não aplicadas)
  const [pendingStartDate, setPendingStartDate] = useState<Date | undefined>();
  const [pendingEndDate, setPendingEndDate] = useState<Date | undefined>();
  
  // Datas aplicadas (usadas para filtrar)
  const [appliedStartDate, setAppliedStartDate] = useState<Date | undefined>();
  const [appliedEndDate, setAppliedEndDate] = useState<Date | undefined>();
  
  const [activeSection, setActiveSection] = useState('kpis');
  
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Verifica se há mudanças pendentes
  const hasChanges = pendingStartDate !== appliedStartDate || pendingEndDate !== appliedEndDate;

  const filteredMaterias = useMemo(() => {
    if (!materias) return [];
    
    return materias.filter(item => {
      const itemDate = parseDate(item.Data);
      if (!itemDate) return true;
      
      if (appliedStartDate && itemDate < appliedStartDate) return false;
      if (appliedEndDate && itemDate > appliedEndDate) return false;
      
      return true;
    });
  }, [materias, appliedStartDate, appliedEndDate]);

  const handleApplyFilters = () => {
    setAppliedStartDate(pendingStartDate);
    setAppliedEndDate(pendingEndDate);
  };

  const handleClearFilters = () => {
    setPendingStartDate(undefined);
    setPendingEndDate(undefined);
    setAppliedStartDate(undefined);
    setAppliedEndDate(undefined);
  };

  const handleNavigate = useCallback((sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Intersection Observer for active section
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="ml-56 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="ml-56 p-6">
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
      </div>
    );
  }

  if (!materias || materias.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="ml-56 p-6">
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
      </div>
    );
  }

  const isFiltered = appliedStartDate || appliedEndDate;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar activeSection={activeSection} onNavigate={handleNavigate} />
      
      <div className="ml-56">
        {/* Fixed Header */}
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  Dashboard de Clipping
                </h1>
                <p className="text-sm text-muted-foreground">
                  Análise de {filteredMaterias.length.toLocaleString('pt-BR')} matérias
                  {isFiltered && ` (de ${materias.length.toLocaleString('pt-BR')} total)`}
                </p>
              </div>
            </div>
            
            <DateRangeFilter
              startDate={pendingStartDate}
              endDate={pendingEndDate}
              onStartDateChange={setPendingStartDate}
              onEndDateChange={setPendingEndDate}
              onClear={handleClearFilters}
              onApply={handleApplyFilters}
              hasChanges={hasChanges}
            />
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto p-6 space-y-12">
          <DashboardSection
            ref={(el) => { sectionRefs.current['panorama'] = el; }}
            id="panorama"
            title="Panorama Global"
            description="Visão consolidada de matérias, valoração e sentimento"
          >
            <PanoramaGlobalCharts data={filteredMaterias} />
          </DashboardSection>

          <DashboardSection
            ref={(el) => { sectionRefs.current['kpis'] = el; }}
            id="kpis"
            title="Visão Geral"
            description="Principais indicadores de desempenho"
          >
            <MetricsCards data={filteredMaterias} />
          </DashboardSection>

          <DashboardSection
            ref={(el) => { sectionRefs.current['timeline'] = el; }}
            id="timeline"
            title="Evolução Temporal"
            description="Análise de volume, valor e sentimento ao longo do tempo"
          >
            <TimelineCharts data={filteredMaterias} />
          </DashboardSection>

          <DashboardSection
            ref={(el) => { sectionRefs.current['midia'] = el; }}
            id="midia"
            title="Análise por Mídia"
            description="Distribuição por tipo de mídia, tipo de matéria e abrangência"
          >
            <MidiaCharts data={filteredMaterias} />
          </DashboardSection>

          <DashboardSection
            ref={(el) => { sectionRefs.current['veiculos'] = el; }}
            id="veiculos"
            title="Análise por Veículos"
            description="Rankings de veículos por volume e valor de mídia"
          >
            <VeiculosCharts data={filteredMaterias} />
          </DashboardSection>

          <DashboardSection
            ref={(el) => { sectionRefs.current['geografia'] = el; }}
            id="geografia"
            title="Análise Geográfica"
            description="Distribuição por estados e abrangência"
          >
            <GeografiaCharts data={filteredMaterias} />
          </DashboardSection>

          <DashboardSection
            ref={(el) => { sectionRefs.current['cruzamentos'] = el; }}
            id="cruzamentos"
            title="Cruzamentos"
            description="Análises cruzadas entre diferentes dimensões"
          >
            <div className="text-muted-foreground text-sm">
              Gráficos de cruzamento estão distribuídos nas seções específicas (Mídia x Avaliação, Destaque x Avaliação).
            </div>
          </DashboardSection>

          <DashboardSection
            ref={(el) => { sectionRefs.current['sentimento'] = el; }}
            id="sentimento"
            title="Análise de Sentimento"
            description="Distribuição de teor e evolução do índice K"
          >
            <SentimentCharts data={filteredMaterias} />
          </DashboardSection>

          <DashboardSection
            ref={(el) => { sectionRefs.current['fontes'] = el; }}
            id="fontes"
            title="Fontes e Temas"
            description="Principais fontes, temas e análise de destaques"
          >
            <FontesTemasCharts data={filteredMaterias} />
          </DashboardSection>
        </main>
      </div>
    </div>
  );
}
