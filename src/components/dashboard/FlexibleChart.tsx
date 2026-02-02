import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { ChartType } from './ChartTypeSelector';

interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: unknown;
}

interface StackedDataItem {
  name: string;
  [key: string]: string | number;
}

interface FlexibleChartProps {
  data: ChartDataItem[] | StackedDataItem[];
  type: ChartType;
  height?: number;
  color?: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  tooltipLabel?: string;
  showLegend?: boolean;
  stackedKeys?: { key: string; color: string }[];
  leftMargin?: number;
  yAxisWidth?: number;
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
  'hsl(280, 65%, 60%)',
  'hsl(15, 80%, 55%)',
];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
};

export function FlexibleChart({
  data,
  type,
  height = 300,
  color = 'hsl(221, 83%, 53%)',
  colors = COLORS,
  valueFormatter = (v) => v.toLocaleString('pt-BR'),
  tooltipLabel = 'Valor',
  showLegend = false,
  stackedKeys,
  leftMargin = 120,
  yAxisWidth = 115,
}: FlexibleChartProps) {
  const simpleData = data as ChartDataItem[];
  const stackedData = data as StackedDataItem[];

  // Stacked bar charts (horizontal or vertical)
  if ((type === 'stacked' || type === 'stackedHorizontal') && stackedKeys) {
    const isHorizontal = type === 'stackedHorizontal';
    
    return (
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stackedData}
            layout={isHorizontal ? 'vertical' : 'horizontal'}
            margin={isHorizontal ? { left: leftMargin } : undefined}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            {isHorizontal ? (
              <>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={yAxisWidth} />
              </>
            ) : (
              <>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
              </>
            )}
            <Tooltip
              formatter={(value: number) => [valueFormatter(value), tooltipLabel]}
              contentStyle={tooltipStyle}
            />
            {showLegend && <Legend />}
            {stackedKeys.map((item, index) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                stackId="a"
                fill={item.color}
                radius={index === stackedKeys.length - 1 ? (isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]) : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Pie chart
  if (type === 'pie') {
    return (
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={simpleData}
              cx="50%"
              cy="50%"
              innerRadius={height > 250 ? 50 : 30}
              outerRadius={height > 250 ? 90 : 70}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {simpleData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [valueFormatter(value), tooltipLabel]}
              contentStyle={tooltipStyle}
            />
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Area chart
  if (type === 'area') {
    return (
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={simpleData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number) => [valueFormatter(value), tooltipLabel]}
              contentStyle={tooltipStyle}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Horizontal bar chart
  if (type === 'barHorizontal') {
    return (
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={simpleData} layout="vertical" margin={{ left: leftMargin }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10 }}
              width={yAxisWidth}
            />
            <Tooltip
              formatter={(value: number) => [valueFormatter(value), tooltipLabel]}
              contentStyle={tooltipStyle}
            />
            <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default: Vertical bar chart
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={simpleData}>
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
            formatter={(value: number) => [valueFormatter(value), tooltipLabel]}
            contentStyle={tooltipStyle}
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
