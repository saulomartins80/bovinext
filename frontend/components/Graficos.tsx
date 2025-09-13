import React from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from "chart.js";
import { useTheme } from "../context/ThemeContext";

// Registro dos componentes
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Graficos = () => {
  const { resolvedTheme } = useTheme();

  // Cores vibrantes estilo cinema
  const cinemaPalette = {
    neonBlue: '#00f0ff',
    electricPurple: '#b300ff',
    hotPink: '#ff00b3',
    limeGreen: '#00ff7b',
    goldenYellow: '#ffd700',
    darkBg: '#0a0a1a',
    lightBg: '#f8f9fa',
    gridDark: 'rgba(0, 240, 255, 0.1)',
    gridLight: 'rgba(0, 0, 0, 0.05)'
  };

  const textColor = resolvedTheme === 'dark' ? '#ffffff' : '#111827';
  const gridColor = resolvedTheme === 'dark' ? cinemaPalette.gridDark : cinemaPalette.gridLight;
  const tooltipBgColor = resolvedTheme === 'dark' ? '#1a1a2e' : '#ffffff';

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  const barChartData: ChartData<'bar'> = {
    labels: meses,
    datasets: [
      {
        label: "Receitas",
        data: meses.map(() => 0),
        backgroundColor: cinemaPalette.neonBlue,
        borderColor: cinemaPalette.neonBlue,
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: cinemaPalette.limeGreen,
        hoverBorderColor: '#ffffff',
        barPercentage: 0.8,
        categoryPercentage: 0.7
      },
      {
        label: "Despesas",
        data: meses.map(() => 0),
        backgroundColor: cinemaPalette.hotPink,
        borderColor: cinemaPalette.hotPink,
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: cinemaPalette.goldenYellow,
        hoverBorderColor: '#ffffff',
        barPercentage: 0.8,
        categoryPercentage: 0.7
      },
    ],
  };

  const lineChartData: ChartData<'line'> = {
    labels: ["Sem dados"],
    datasets: [
      {
        label: "Saldo",
        data: [0],
        borderColor: cinemaPalette.limeGreen,
        backgroundColor: `${cinemaPalette.electricPurple}60`,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: cinemaPalette.neonBlue,
        pointBorderColor: '#ffffff',
        pointHoverRadius: 8,
        pointHoverBackgroundColor: cinemaPalette.goldenYellow,
        pointHoverBorderColor: '#ffffff',
        pointHitRadius: 10,
        pointBorderWidth: 2
      },
    ],
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { size: 14, weight: 'bold' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: tooltipBgColor,
        titleColor: resolvedTheme === 'dark' ? cinemaPalette.neonBlue : '#111827',
        bodyColor: textColor,
        borderColor: resolvedTheme === 'dark' ? cinemaPalette.electricPurple : '#e5e7eb',
        borderWidth: 2,
        padding: 12,
        boxPadding: 8,
        cornerRadius: 12,
        titleFont: { weight: 'bold', size: 14 },
        bodyFont: { size: 12 },
        callbacks: {
          label: (context) => {
            const value = typeof context.raw === 'number' ? context.raw : 0;
            return ` ${context.dataset.label}: R$ ${value.toFixed(2).replace('.', ',')}`;
          }
        }
      },
      title: {
        display: true,
        text: 'Fluxo Financeiro Mensal',
        color: textColor,
        font: { size: 18, weight: 'bold' },
        padding: { top: 10, bottom: 20 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          padding: 10,
          callback: (value) => `R$ ${Number(value).toFixed(2)}`,
          font: { size: 12, weight: 'bold' }
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 12, weight: 'bold' } },
      },
    },
    animation: { duration: 1500 },
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: textColor, font: { size: 14, weight: 'bold' }, padding: 20, usePointStyle: true, pointStyle: 'circle' }
      },
      tooltip: {
        backgroundColor: tooltipBgColor,
        titleColor: resolvedTheme === 'dark' ? cinemaPalette.limeGreen : '#111827',
        bodyColor: textColor,
        borderColor: resolvedTheme === 'dark' ? cinemaPalette.neonBlue : '#e5e7eb',
        borderWidth: 2,
        padding: 12,
        boxPadding: 8,
        cornerRadius: 12,
        titleFont: { weight: 'bold', size: 14 },
        bodyFont: { size: 12 },
        callbacks: {
          label: (context) => {
            const value = typeof context.raw === 'number' ? context.raw : 0;
            return ` Saldo: R$ ${value.toFixed(2).replace('.', ',')}`;
          }
        }
      },
      title: {
        display: true,
        text: 'Histórico de Saldo',
        color: textColor,
        font: { size: 18, weight: 'bold' },
        padding: { top: 10, bottom: 20 }
      }
    },
    scales: {
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, padding: 10, callback: (value) => `R$ ${Number(value).toFixed(2)}`, font: { size: 12, weight: 'bold' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 12, weight: 'bold' } },
      },
    },
    elements: { point: { radius: 5, hoverRadius: 8, borderWidth: 2 }, line: { borderWidth: 3, tension: 0.4 } },
    animation: { duration: 1500 },
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Barras - Sem borda colorida */}
      <div className={`p-3 rounded-lg shadow-sm ${
        resolvedTheme === "dark" 
          ? "bg-gray-800" 
          : "bg-white"
      }`}>
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Receitas vs Despesas
        </h2>
        <div className="w-full h-[380px]">
          <Bar
            data={barChartData}
            options={barChartOptions}
          />
        </div>
      </div>

      {/* Gráfico de Linha - Sem borda colorida */}
      <div className={`p-3 rounded-lg shadow-sm ${
        resolvedTheme === "dark" 
          ? "bg-gray-800" 
          : "bg-white"
      }`}>
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Evolução do Saldo
        </h2>
        <div className="w-full h-[380px]">
          <Line
            data={lineChartData}
            options={lineChartOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default Graficos;