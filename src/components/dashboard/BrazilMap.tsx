import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// SVG paths for Brazilian states (simplified)
const BRAZIL_STATES: Record<string, { path: string; labelX: number; labelY: number }> = {
  AC: { path: "M82,bindão5 L92,bindão5 92,215 82,215Z", labelX: 87, labelY: 210 },
  AL: { path: "", labelX: 0, labelY: 0 },
  AP: { path: "", labelX: 0, labelY: 0 },
  AM: { path: "", labelX: 0, labelY: 0 },
  BA: { path: "", labelX: 0, labelY: 0 },
  CE: { path: "", labelX: 0, labelY: 0 },
  DF: { path: "", labelX: 0, labelY: 0 },
  ES: { path: "", labelX: 0, labelY: 0 },
  GO: { path: "", labelX: 0, labelY: 0 },
  MA: { path: "", labelX: 0, labelY: 0 },
  MT: { path: "", labelX: 0, labelY: 0 },
  MS: { path: "", labelX: 0, labelY: 0 },
  MG: { path: "", labelX: 0, labelY: 0 },
  PA: { path: "", labelX: 0, labelY: 0 },
  PB: { path: "", labelX: 0, labelY: 0 },
  PR: { path: "", labelX: 0, labelY: 0 },
  PE: { path: "", labelX: 0, labelY: 0 },
  PI: { path: "", labelX: 0, labelY: 0 },
  RJ: { path: "", labelX: 0, labelY: 0 },
  RN: { path: "", labelX: 0, labelY: 0 },
  RS: { path: "", labelX: 0, labelY: 0 },
  RO: { path: "", labelX: 0, labelY: 0 },
  RR: { path: "", labelX: 0, labelY: 0 },
  SC: { path: "", labelX: 0, labelY: 0 },
  SP: { path: "", labelX: 0, labelY: 0 },
  SE: { path: "", labelX: 0, labelY: 0 },
  TO: { path: "", labelX: 0, labelY: 0 },
};

// Actual SVG paths for the Brazilian map
const BRAZIL_SVG_PATHS: Record<string, string> = {
  AM: "M42,95 L42,65 55,55 80,50 105,55 130,50 145,65 150,80 145,100 135,115 120,125 100,130 80,125 60,115 42,105Z",
  PA: "M150,55 L175,45 210,50 230,55 240,75 235,100 225,120 200,130 175,125 155,115 145,100 145,80Z",
  MA: "M235,65 L255,55 275,60 280,80 275,100 260,110 240,105 235,90Z",
  PI: "M265,100 L280,90 290,100 290,125 280,140 265,135 260,120Z",
  CE: "M290,85 L310,80 315,95 310,110 295,110 290,100Z",
  RN: "M310,95 L325,90 330,100 320,108 310,105Z",
  PB: "M305,108 L325,105 330,112 320,118 305,115Z",
  PE: "M295,115 L325,112 330,122 315,130 295,125Z",
  AL: "M310,128 L325,125 328,135 318,140 310,135Z",
  SE: "M305,138 L318,135 320,143 310,147 305,142Z",
  BA: "M270,135 L305,130 318,143 320,165 310,195 290,205 265,200 255,180 250,155Z",
  TO: "M220,120 L245,115 255,135 250,165 235,175 215,170 210,145Z",
  GO: "M215,175 L245,170 260,185 258,210 245,225 225,225 210,210 208,190Z",
  DF: "M235,200 L245,198 247,208 237,210Z",
  MT: "M130,130 L175,125 210,135 215,170 210,210 195,225 170,230 145,220 130,195 125,160Z",
  MS: "M160,230 L195,225 210,240 205,270 190,280 170,280 155,265 150,245Z",
  MG: "M250,200 L280,195 300,205 310,225 305,255 285,265 260,260 245,245 240,225Z",
  ES: "M310,225 L325,220 330,240 320,255 310,250Z",
  RJ: "M295,260 L315,255 325,265 315,275 295,270Z",
  SP: "M235,250 L270,245 290,260 285,280 265,290 240,285 230,270Z",
  PR: "M225,285 L260,280 275,290 270,310 250,315 230,310 220,300Z",
  SC: "M240,315 L265,310 272,325 260,335 240,330Z",
  RS: "M230,330 L260,325 268,345 260,370 240,380 220,370 215,350 220,335Z",
  RO: "M105,135 L130,130 135,160 130,185 115,190 100,180 95,160Z",
  AC: "M55,150 L95,140 100,160 95,180 75,185 55,175Z",
  RR: "M100,25 L120,15 135,25 135,50 120,55 105,50Z",
  AP: "M205,15 L225,10 235,25 230,50 215,55 200,45Z",
};

// Label positions for each state
const BRAZIL_LABELS: Record<string, { x: number; y: number }> = {
  AM: { x: 95, y: 90 }, PA: { x: 195, y: 85 }, MA: { x: 260, y: 80 },
  PI: { x: 275, y: 115 }, CE: { x: 300, y: 95 }, RN: { x: 318, y: 98 },
  PB: { x: 315, y: 112 }, PE: { x: 312, y: 120 }, AL: { x: 320, y: 132 },
  SE: { x: 312, y: 142 }, BA: { x: 285, y: 168 }, TO: { x: 230, y: 145 },
  GO: { x: 235, y: 198 }, DF: { x: 241, y: 204 }, MT: { x: 165, y: 175 },
  MS: { x: 178, y: 255 }, MG: { x: 275, y: 230 }, ES: { x: 320, y: 238 },
  RJ: { x: 310, y: 265 }, SP: { x: 260, y: 265 }, PR: { x: 248, y: 298 },
  SC: { x: 255, y: 322 }, RS: { x: 242, y: 355 }, RO: { x: 115, y: 160 },
  AC: { x: 75, y: 165 }, RR: { x: 118, y: 38 }, AP: { x: 218, y: 35 },
};

interface BrazilMapProps {
  data: Record<string, number>;
  height?: number;
}

export function BrazilMap({ data, height = 400 }: BrazilMapProps) {
  const { colorScale, maxValue } = useMemo(() => {
    const values = Object.values(data);
    const max = Math.max(...values, 1);
    return { colorScale: (v: number) => v / max, maxValue: max };
  }, [data]);

  const getColor = (uf: string) => {
    const count = data[uf] || 0;
    if (count === 0) return 'hsl(var(--muted))';
    const intensity = colorScale(count);
    // From light orange to deep orange
    const lightness = 85 - intensity * 45;
    const saturation = 50 + intensity * 45;
    return `hsl(24, ${saturation}%, ${lightness}%)`;
  };

  const legendSteps = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
    value: Math.round(pct * maxValue),
    color: pct === 0 
      ? 'hsl(var(--muted))' 
      : `hsl(24, ${50 + pct * 45}%, ${85 - pct * 45}%)`,
  }));

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col items-center gap-4">
        <svg
          viewBox="0 -5 350 400"
          style={{ height, width: '100%', maxWidth: 500 }}
          className="mx-auto"
        >
          {Object.entries(BRAZIL_SVG_PATHS).map(([uf, path]) => (
            <Tooltip key={uf}>
              <TooltipTrigger asChild>
                <path
                  d={path}
                  fill={getColor(uf)}
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                  className="transition-colors hover:opacity-80 cursor-pointer"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{uf}</p>
                <p>{data[uf] || 0} matérias</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {Object.entries(BRAZIL_LABELS).map(([uf, pos]) => (
            <text
              key={`label-${uf}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground pointer-events-none"
              fontSize={8}
              fontWeight={data[uf] ? 600 : 400}
              opacity={data[uf] ? 1 : 0.4}
            >
              {uf}
            </text>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>0</span>
          <div className="flex h-3 rounded overflow-hidden">
            {legendSteps.map((step, i) => (
              <div
                key={i}
                className="w-8 h-full"
                style={{ backgroundColor: step.color }}
              />
            ))}
          </div>
          <span>{maxValue}</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
