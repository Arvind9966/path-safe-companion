import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface RiskGauge3DProps {
  score: number;
  className?: string;
}

const RiskGauge3D = ({ score, className }: RiskGauge3DProps) => {
  const { level, color, shadowColor } = useMemo(() => {
    if (score <= 33) return { 
      level: 'LOW', 
      color: 'hsl(var(--emerald))', 
      shadowColor: 'hsl(var(--emerald) / 0.4)' 
    };
    if (score <= 66) return { 
      level: 'MED', 
      color: 'hsl(var(--amber))', 
      shadowColor: 'hsl(var(--amber) / 0.4)' 
    };
    return { 
      level: 'HIGH', 
      color: 'hsl(var(--crimson))', 
      shadowColor: 'hsl(var(--crimson) / 0.5)' 
    };
  }, [score]);

  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;

  return (
    <div className={cn("relative w-32 h-32 hover-premium", className)}>
      {/* Outer glow ring */}
      <div 
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: `conic-gradient(from 0deg, ${color}, transparent, ${color})`,
          filter: 'blur(12px)',
        }}
      />
      
      {/* Main gauge container */}
      <div 
        className="relative w-full h-full rounded-full flex items-center justify-center backdrop-blur-xl border-2 glass-premium"
        style={{
          background: 'radial-gradient(circle, rgba(14,14,16,0.8), rgba(26,26,29,0.9))',
          borderColor: color,
          boxShadow: `0 0 40px ${shadowColor}, inset 0 0 30px rgba(0,0,0,0.6)`,
        }}
      >
        {/* SVG Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="4"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={color}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 12px ${color})`,
              transition: 'stroke-dasharray 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
        </svg>

        {/* Score display */}
        <div className="z-10 text-center">
          <div 
            className="text-3xl font-semibold"
            style={{ 
              color: 'hsl(var(--platinum))', 
              textShadow: `0 0 15px ${color}`,
              fontWeight: 600 
            }}
          >
            {score}
          </div>
          <div className="text-xs font-medium text-silver/70 uppercase tracking-wider mt-1">
            {level}
          </div>
        </div>

        {/* Inner shimmer effect */}
        <div 
          className="absolute inset-6 rounded-full opacity-15 animate-float-gentle"
          style={{
            background: `radial-gradient(circle, ${color}, transparent)`,
          }}
        />
      </div>
    </div>
  );
};

export default RiskGauge3D;