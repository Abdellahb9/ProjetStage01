import { Box, Typography, useTheme } from '@mui/material';

interface PieChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title: string;
  size?: number;
}

export default function PieChart({ data, title, size = 200 }: PieChartProps) {
  const theme = useTheme();
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = Math.min(centerX, centerY) - 20;

  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  let currentAngle = -Math.PI / 2; // Start from top

  const createArc = (startAngle: number, endAngle: number) => {
    const x1 = centerX + Math.cos(startAngle) * radius;
    const y1 = centerY + Math.sin(startAngle) * radius;
    const x2 = centerX + Math.cos(endAngle) * radius;
    const y2 = centerY + Math.sin(endAngle) * radius;

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${centerX} ${centerY}`,
      'Z',
    ].join(' ');
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h6" gutterBottom align="center">
        {title}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((item, index) => {
            const angle = (item.value / total) * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const arcPath = createArc(startAngle, endAngle);
            const color = item.color || colors[index % colors.length];
            
            // Calculate label position
            const labelAngle = startAngle + angle / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + Math.cos(labelAngle) * labelRadius;
            const labelY = centerY + Math.sin(labelAngle) * labelRadius;
            
            currentAngle = endAngle;

            return (
              <g key={item.label}>
                <path d={arcPath} fill={color} />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                >
                  {Math.round((item.value / total) * 100)}%
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
      
      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {data.map((item, index) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: item.color || colors[index % colors.length],
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {item.label} ({item.value})
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}














