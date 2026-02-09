import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useMaterias } from '@/hooks/useMaterias';

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
import { ExportReportButton } from '@/components/dashboard/ExportReportButton';
import { MultiSelectFilter } from '@/components/dashboard/MultiSelectFilter';
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

  // Filtros de dimensão (pendentes)
  const [pendingUf, setPendingUf] = useState<string[]>([]);
  const [pendingTema, setPendingTema] = useState<string[]>([]);
  const [pendingJornalista, setPendingJornalista] = useState<string[]>([]);
  const [pendingFonte, setPendingFonte] = useState<string[]>([]);
  const [pendingVeiculo, setPendingVeiculo] = useState<string[]>([]);

  // Filtros de dimensão (aplicados)
  const [appliedUf, setAppliedUf] = useState<string[]>([]);
  const [appliedTema, setAppliedTema] = useState<string[]>([]);
  const [appliedJornalista, setAppliedJornalista] = useState<string[]>([]);
  const [appliedFonte, setAppliedFonte] = useState<string[]>([]);
  const [appliedVeiculo, setAppliedVeiculo] = useState<string[]>([]);
  
  const [activeSection, setActiveSection] = useState('kpis');
  
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Opções únicas para cada filtro
  const filterOptions = useMemo(() => {
    if (!materias) return { ufs: [], temas: [], jornalistas: [], fontes: [], veiculos: [] };
    const unique = (field: string) => 
      [...new Set(materias.map(m => String(m[field] || '').trim()).filter(Boolean))].sort();
    return {
      ufs: unique('uf'),
      temas: unique('Temas'),
      jornalistas: unique('Fonte'), // 'Fonte' is the journalist/source field
      fontes: unique('Fonte'),
      veiculos: unique('Veiculo'),
    };
  }, [materias]);

  // Verifica se há mudanças pendentes
  const hasChanges = pendingStartDate !== appliedStartDate || pendingEndDate !== appliedEndDate
    || JSON.stringify(pendingUf) !== JSON.stringify(appliedUf)
    || JSON.stringify(pendingTema) !== JSON.stringify(appliedTema)
    || JSON.stringify(pendingJornalista) !== JSON.stringify(appliedJornalista)
    || JSON.stringify(pendingFonte) !== JSON.stringify(appliedFonte)
    || JSON.stringify(pendingVeiculo) !== JSON.stringify(appliedVeiculo);

  const filteredMaterias = useMemo(() => {
    if (!materias) return [];
    
    return materias.filter(item => {
      const itemDate = parseDate(item.Data);
      if (itemDate) {
        if (appliedStartDate && itemDate < appliedStartDate) return false;
        if (appliedEndDate && itemDate > appliedEndDate) return false;
      }
      
      if (appliedUf.length > 0 && !appliedUf.includes(String(item.uf || '').trim())) return false;
      if (appliedTema.length > 0 && !appliedTema.includes(String(item.Temas || '').trim())) return false;
      if (appliedJornalista.length > 0 && !appliedJornalista.includes(String(item.Fonte || '').trim())) return false;
      if (appliedFonte.length > 0 && !appliedFonte.includes(String(item.Fonte || '').trim())) return false;
      if (appliedVeiculo.length > 0 && !appliedVeiculo.includes(String(item.Veiculo || '').trim())) return false;
      
      return true;
    });
  }, [materias, appliedStartDate, appliedEndDate, appliedUf, appliedTema, appliedJornalista, appliedFonte, appliedVeiculo]);

  const handleApplyFilters = () => {
    setAppliedStartDate(pendingStartDate);
    setAppliedEndDate(pendingEndDate);
    setAppliedUf([...pendingUf]);
    setAppliedTema([...pendingTema]);
    setAppliedJornalista([...pendingJornalista]);
    setAppliedFonte([...pendingFonte]);
    setAppliedVeiculo([...pendingVeiculo]);
  };

  const handleClearFilters = () => {
    setPendingStartDate(undefined);
    setPendingEndDate(undefined);
    setAppliedStartDate(undefined);
    setAppliedEndDate(undefined);
    setPendingUf([]); setPendingTema([]); setPendingJornalista([]); setPendingFonte([]); setPendingVeiculo([]);
    setAppliedUf([]); setAppliedTema([]); setAppliedJornalista([]); setAppliedFonte([]); setAppliedVeiculo([]);
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
              <ExportReportButton title="Relatório de Clipping" />
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

            <div className="flex flex-wrap items-center gap-2">
              <MultiSelectFilter label="UF" options={filterOptions.ufs} selected={pendingUf} onChange={setPendingUf} />
              <MultiSelectFilter label="Tema" options={filterOptions.temas} selected={pendingTema} onChange={setPendingTema} />
              <MultiSelectFilter label="Jornalista" options={filterOptions.jornalistas} selected={pendingJornalista} onChange={setPendingJornalista} />
              <MultiSelectFilter label="Fonte" options={filterOptions.fontes} selected={pendingFonte} onChange={setPendingFonte} />
              <MultiSelectFilter label="Veículo" options={filterOptions.veiculos} selected={pendingVeiculo} onChange={setPendingVeiculo} />
            </div>
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
