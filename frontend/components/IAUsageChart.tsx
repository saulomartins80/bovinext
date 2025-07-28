import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from 'next-themes';

interface IAUsageChartProps {
  data: unknown[];
  type: 'line' | 'bar' | 'pie';
  title: string;
  color?: string;
  height?: number;
}

export default function IAUsageChart({ data, type, title, color = '#8B5CF6', height = 300 }: IAUsageChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // Cores para tema escuro/claro
  const textColor = isDark ? '#E5E7EB' : '#374151';
  const gridColor = isDark ? '#374151' : '#E5E7EB';
  const backgroundColor = isDark ? '#1F2937' : '#FFFFFF';

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: textColor }}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis 
              tick={{ fill: textColor }}
              axisLine={{ stroke: gridColor }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor, 
                border: `1px solid ${gridColor}`,
                borderRadius: '8px'
              }}
              labelStyle={{ color: textColor }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: textColor }}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis 
              tick={{ fill: textColor }}
              axisLine={{ stroke: gridColor }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor, 
                border: `1px solid ${gridColor}`,
                borderRadius: '8px'
              }}
              labelStyle={{ color: textColor }}
            />
            <Bar 
              dataKey="value" 
              fill={color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      
      case 'pie': {
        const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: { name: string; percent?: number }) => {
                return percent ? `${name} ${(percent * 100).toFixed(0)}%` : name;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor, 
                border: `1px solid ${gridColor}`,
                borderRadius: '8px'
              }}
              labelStyle={{ color: textColor }}
            />
          </PieChart>
        );
      }
      
      default:
        return null;
    }
  };

  return (
    <div className={`rounded-lg shadow p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart() || <div />}
      </ResponsiveContainer>
    </div>
  );
} 