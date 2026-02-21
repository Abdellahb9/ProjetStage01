import { Box, Typography, useTheme } from '@mui/material';

interface DoughnutChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title: string;
  size?: number;
  innerRadius?: number;
}

export default function DoughnutChart({ 
  data, 
  title, 
  size = 200, 
  innerRadius = 0.4 
}: DoughnutChartProps) {
  const theme = useTheme();
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = Math.min(centerX, centerY) - 20;
  const innerRad = outerRadius * innerRadius;

  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  let currentAngle = -Math.PI / 2; // Start from top

  const createArc = (startAngle: number, endAngle: number, isOuter: boolean) => {
    const radius = isOuter ? outerRadius : innerRad;
    const x1 = centerX + Math.cos(startAngle) * radius;
    const y1 = centerY + Math.sin(startAngle) * radius;
    const x2 = centerX + Math.cos(endAngle) * radius;
    const y2 = centerY + Math.sin(endAngle) * radius;

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    if (isOuter) {
      return [
        `M ${x1} ${y1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${centerX + Math.cos(endAngle) * innerRad} ${centerY + Math.sin(endAngle) * innerRad}`,
        `A ${innerRad} ${innerRad} 0 ${largeArcFlag} 0 ${centerX + Math.cos(startAngle) * innerRad} ${centerY + Math.sin(startAngle) * innerRad}`,
        'Z',
      ].join(' ');
    } else {
      return [
        `M ${centerX + Math.cos(startAngle) * innerRad} ${centerY + Math.sin(startAngle) * innerRad}`,
        `A ${innerRad} ${innerRad} 0 ${largeArcFlag} 1 ${centerX + Math.cos(endAngle) * innerRad} ${centerY + Math.sin(endAngle) * innerRad}`,
        'Z',
      ].join(' ');
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h6" gutterBottom align="center">
        {title}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius}
            fill={theme.palette.grey[100]}
            stroke={theme.palette.divider}
            strokeWidth="1"
          />
          
          {data.map((item, index) => {
            const angle = (item.value / total) * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const arcPath = createArc(startAngle, endAngle, true);
            const color = item.color || colors[index % colors.length];
            
            // Calculate label position
            const labelAngle = startAngle + angle / 2;
            const labelRadius = (outerRadius + innerRad) / 2;
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
          
          {/* Center text */}
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill={theme.palette.text.primary}
            fontWeight="bold"
          >
            Total
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="16"
            fill={theme.palette.primary.main}
            fontWeight="bold"
          >
            {total}
          </text>
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














