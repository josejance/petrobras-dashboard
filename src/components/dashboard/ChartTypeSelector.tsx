import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart3, PieChart, AreaChart, Layers } from 'lucide-react';

export type ChartType = 'bar' | 'barHorizontal' | 'pie' | 'area' | 'stacked' | 'stackedHorizontal';

interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (value: ChartType) => void;
  options?: ChartType[];
}

const chartTypeLabels: Record<ChartType, { label: string; icon: React.ReactNode }> = {
  bar: { label: 'Barras', icon: <BarChart3 className="h-4 w-4 rotate-0" /> },
  barHorizontal: { label: 'Barras Horiz.', icon: <BarChart3 className="h-4 w-4 rotate-90" /> },
  pie: { label: 'Pizza', icon: <PieChart className="h-4 w-4" /> },
  area: { label: 'Área', icon: <AreaChart className="h-4 w-4" /> },
  stacked: { label: 'Empilhadas', icon: <Layers className="h-4 w-4" /> },
  stackedHorizontal: { label: 'Empilh. Horiz.', icon: <Layers className="h-4 w-4 rotate-90" /> },
};

const defaultOptions: ChartType[] = ['bar', 'barHorizontal', 'pie', 'area'];

export function ChartTypeSelector({ value, onChange, options = defaultOptions }: ChartTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ChartType)}>
      <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-background z-50">
        {options.map((type) => (
          <SelectItem key={type} value={type} className="text-xs">
            <div className="flex items-center gap-2">
              {chartTypeLabels[type].icon}
              {chartTypeLabels[type].label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
