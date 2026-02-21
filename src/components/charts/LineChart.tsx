import { Box, Typography, useTheme } from '@mui/material';

interface LineChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title: string;
  height?: number;
  maxValue?: number;
}

export default function LineChart({ data, title, height = 200, maxValue }: LineChartProps) {
  const theme = useTheme();
  const max = maxValue || Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min;
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - min) / range) * 100;
    return { x, y, label: item.label, value: item.value };
  });

  const pathData = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `L ${point.x} ${point.y}`;
  }).join(' ');

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h6" gutterBottom align="center">
        {title}
      </Typography>
      <Box sx={{ position: 'relative', height, mt: 2 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1="0"
              y1={percent}
              x2="100"
              y2={percent}
              stroke={theme.palette.divider}
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Line chart */}
          <path
            d={pathData}
            fill="none"
            stroke={theme.palette.primary.main}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {points.map((point) => (
            <g key={point.label}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill={theme.palette.primary.main}
                stroke="white"
                strokeWidth="1"
              />
              <text
                x={point.x}
                y={point.y - 8}
                textAnchor="middle"
                fontSize="8"
                fill={theme.palette.text.primary}
                fontWeight="bold"
              >
                {point.value}
              </text>
              <text
                x={point.x}
                y="95"
                textAnchor="middle"
                fontSize="8"
                fill={theme.palette.text.secondary}
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </Box>
    </Box>
  );
}














