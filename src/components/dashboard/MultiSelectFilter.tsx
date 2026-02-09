import { useState, useMemo, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  /** When true, options only appear after the user types something */
  searchFirst?: boolean;
}

export function MultiSelectFilter({ label, options, selected, onChange, searchFirst = false }: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (searchFirst && !search) return [];
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter(o => o.toLowerCase().includes(lower));
  }, [options, search, searchFirst]);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter(s => s !== value)
        : [...selected, value]
    );
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className={cn(
          'h-8 gap-1 text-xs',
          selected.length > 0 && 'border-primary text-primary'
        )}
      >
        {label}
        {selected.length > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
            {selected.length}
          </Badge>
        )}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>

      {selected.length > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onChange([]); }}
          className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-60 rounded-md border bg-popover p-2 shadow-md">
          <Input
            placeholder={searchFirst ? "Digite para buscar..." : "Buscar..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-7 text-xs mb-2"
          />
          <ScrollArea className="max-h-48">
            <div className="space-y-1">
              {searchFirst && !search && (
                <p className="text-xs text-muted-foreground p-2">Digite para ver opções</p>
              )}
              {!searchFirst && filtered.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">Nenhum resultado</p>
              )}
              {searchFirst && search && filtered.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">Nenhum resultado</p>
              )}
              {filtered.map(option => (
                <label
                  key={option}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent cursor-pointer text-xs"
                >
                  <Checkbox
                    checked={selected.includes(option)}
                    onCheckedChange={() => toggle(option)}
                    className="h-3.5 w-3.5"
                  />
                  <span className="truncate">{option}</span>
                </label>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
