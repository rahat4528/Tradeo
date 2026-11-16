'use client';

import React from 'react';

interface MetricChartProps {
  data: number[];
  color?: string;
  unit?: string;
  height?: number;
}

export function MetricChart({
  data,
  color = '#06b6d4', // cyan-500
  unit = '',
  height = 40,
}: MetricChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-10 text-[10px] text-slate-600 flex items-center">No telemetry</div>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data, min + 1);
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1 || 1)) * 100;
    const y = 100 - ((val - min) / (max - min)) * 90 - 5;
    return `${x},${y}`;
  });

  const polylineStr = points.join(' ');
  const areaStr = `0,100 ${polylineStr} 100,100`;

  return (
    <div className="w-full flex items-center space-x-2">
      <div className="flex-1" style={{ height: `${height}px` }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points={areaStr} fill={`url(#grad-${color})`} />
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylineStr}
          />
        </svg>
      </div>
      <span className="text-xs font-mono font-semibold text-slate-300 w-12 text-right">
        {data[data.length - 1]?.toFixed(0)}
        {unit}
      </span>
    </div>
  );
}
