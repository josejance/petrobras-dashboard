import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  GitBranch,
  MessageSquare,
  Users,
  Building2,
  MapPin,
  Newspaper,
  Globe,
  Star,
} from 'lucide-react';

export interface SectionConfig {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const DASHBOARD_SECTIONS: SectionConfig[] = [
  { id: 'panorama', label: 'Panorama Global', icon: Globe },
  
  { id: 'timeline', label: 'Evolução Temporal', icon: TrendingUp },
  { id: 'midia', label: 'Por Mídia', icon: Newspaper },
  { id: 'veiculos', label: 'Por Veículos', icon: Building2 },
  { id: 'geografia', label: 'Por Geografia', icon: MapPin },
  { id: 'destaque', label: 'Destaque e Aderência', icon: Star },
  { id: 'cruzamentos', label: 'Cruzamentos', icon: GitBranch },
  { id: 'sentimento', label: 'Sentimento', icon: MessageSquare },
  { id: 'fontes', label: 'Fontes e Temas', icon: Users },
];

interface DashboardSidebarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export function DashboardSidebar({ activeSection, onNavigate }: DashboardSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-56 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {DASHBOARD_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onNavigate(section.id)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{section.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
