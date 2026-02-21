import { createContext, useContext, ReactNode, useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

export type ChartTheme = 'default' | 'dark' | 'colorful' | 'minimal';

interface ChartThemeContextType {
  theme: ChartTheme;
  setTheme: (theme: ChartTheme) => void;
  getThemeColors: () => string[];
}

const ChartThemeContext = createContext<ChartThemeContextType | undefined>(undefined);

export const useChartTheme = () => {
  const context = useContext(ChartThemeContext);
  if (!context) {
    throw new Error('useChartTheme must be used within a ChartThemeProvider');
  }
  return context;
};

interface ChartThemeProviderProps {
  children: ReactNode;
}

export function ChartThemeProvider({ children }: ChartThemeProviderProps) {
  const [theme, setTheme] = useState<ChartTheme>('default');

  const getThemeColors = (): string[] => {
    switch (theme) {
      case 'dark':
        return ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
      case 'colorful':
        return ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
      case 'minimal':
        return ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7', '#ecf0f1'];
      default:
        return ['#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0', '#0288d1'];
    }
  };

  return (
    <ChartThemeContext.Provider value={{ theme, setTheme, getThemeColors }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Chart Theme:
        </Typography>
        <ToggleButtonGroup
          value={theme}
          exclusive
          onChange={(_, newTheme) => newTheme && setTheme(newTheme)}
          size="small"
        >
          <ToggleButton value="default">Default</ToggleButton>
          <ToggleButton value="dark">Dark</ToggleButton>
          <ToggleButton value="colorful">Colorful</ToggleButton>
          <ToggleButton value="minimal">Minimal</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {children}
    </ChartThemeContext.Provider>
  );
}














