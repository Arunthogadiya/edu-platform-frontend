import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface AnimatedMetricCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  sparklineData?: number[];
  onClick?: () => void;
  className?: string;
}

const AnimatedMetricCard: React.FC<AnimatedMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  trend,
  sparklineData = [],
  onClick,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Animated counter effect
  useEffect(() => {
    setIsVisible(true);
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  // Generate sparkline path
  const generateSparklinePath = (data: number[]) => {
    if (data.length < 2) return '';
    
    const width = 60;
    const height = 20;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    return data
      .map((point, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((point - min) / range) * height;
        return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
      })
      .join(' ');
  };

  return (
    <div 
      className={`stats-card group cursor-pointer transform transition-all duration-500 
        hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
      onClick={onClick}
    >
      {/* Glassmorphism Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-xl 
        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header with Icon */}
        <div className="flex items-center justify-between mb-6">
          <div className={`p-3 bg-gradient-to-br ${gradient} rounded-2xl shadow-lg 
            group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          
          {/* Trend Indicator */}
          {trend && (
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              trend.isPositive 
                ? 'bg-mint/20 text-success border border-mint/30' 
                : 'bg-coral/20 text-accent border border-coral/30'
            }`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        {/* Main Value with Animation */}
        <div className="mb-4">
          <div className="text-right mb-2">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {title}
            </div>
            <div className="text-3xl font-display font-bold text-neutral-900 
              transition-all duration-300 group-hover:text-primary-700">
              <span className="tabular-nums">{displayValue.toLocaleString()}</span>
              {value !== displayValue && (
                <span className="inline-block w-1 h-8 bg-primary-500 ml-1 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Sparkline Chart */}
        {sparklineData.length > 0 && (
          <div className="mb-4">
            <svg width="60" height="20" className="opacity-60 group-hover:opacity-100 transition-opacity">
              <defs>
                <linearGradient id={`sparkline-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d={generateSparklinePath(sparklineData)}
                stroke={`url(#sparkline-${title})`}
                strokeWidth="2"
                fill="none"
                className="text-primary-500"
              />
            </svg>
          </div>
        )}

        {/* Footer */}
        <div>
          <h3 className="text-sm font-bold text-neutral-700 mb-1 group-hover:text-primary-700 
            transition-colors">{title}</h3>
          <p className="text-xs text-neutral-500 group-hover:text-neutral-600 transition-colors">
            {subtitle}
          </p>
          {trend && (
            <p className="text-xs text-neutral-400 mt-1">{trend.label}</p>
          )}
        </div>

        {/* Hover Glow Effect */}
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-0 
          group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
      </div>

      {/* Floating Action Indicator */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all 
        duration-300 transform translate-x-2 group-hover:translate-x-0">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default AnimatedMetricCard;
