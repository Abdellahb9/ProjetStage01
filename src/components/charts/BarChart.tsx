import { Box, Typography, useTheme } from '@mui/material';

interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title: string;
  height?: number;
  maxValue?: number;
}

export default function BarChart({ data, title, height = 200, maxValue }: BarChartProps) {
  const theme = useTheme();
  const max = maxValue || Math.max(...data.map(d => d.value));
  const barWidth = 100 / data.length;
  const barSpacing = 2;

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h6" gutterBottom align="center">
        {title}
      </Typography>
      <Box sx={{ position: 'relative', height, mt: 2 }}>
        <svg width="100%" height="100%" viewBox={`0 0 100 ${height}`}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1="0"
              y1={height - (height * percent) / 100}
              x2="100"
              y2={height - (height * percent) / 100}
              stroke={theme.palette.divider}
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.value / max) * height;
            const x = (index * barWidth) + (barSpacing / 2);
            const y = height - barHeight;
            const width = barWidth - barSpacing;
            
            return (
              <g key={item.label}>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={barHeight}
                  fill={item.color || theme.palette.primary.main}
                  rx="2"
                />
                <text
                  x={x + width / 2}
                  y={height + 15}
                  textAnchor="middle"
                  fontSize="8"
                  fill={theme.palette.text.secondary}
                >
                  {item.label}
                </text>
                <text
                  x={x + width / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill={theme.palette.text.primary}
                  fontWeight="bold"
                >
                  {item.value}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
    </Box>
  );
}














