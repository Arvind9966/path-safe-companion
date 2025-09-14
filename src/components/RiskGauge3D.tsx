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
      color: 'hsl(var(--risk-low))', 
      shadowColor: 'hsl(var(--risk-low) / 0.6)' 
    };
    if (score <= 66) return { 
      level: 'MED', 
      color: 'hsl(var(--risk-medium))', 
      shadowColor: 'hsl(var(--risk-medium) / 0.6)' 
    };
    return { 
      level: 'HIGH', 
      color: 'hsl(var(--risk-high))', 
      shadowColor: 'hsl(var(--risk-high) / 0.6)' 
    };
  }, [score]);

  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;

  return (
    <div className={cn("relative w-28 h-28 hover-3d", className)}>
      {/* Outer glow ring */}
      <div 
        className="absolute inset-0 rounded-full animate-spin-slow opacity-50"
        style={{
          background: `conic-gradient(from 0deg, ${color}, transparent, ${color})`,
          filter: 'blur(8px)',
        }}
      />
      
      {/* Main gauge container */}
      <div 
        className="relative w-full h-full rounded-full flex items-center justify-center backdrop-blur-xl border-2"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0.4), rgba(0,0,0,0.8))',
          borderColor: color,
          boxShadow: `0 0 30px ${shadowColor}, inset 0 0 20px rgba(0,0,0,0.8)`,
        }}
      >
        {/* SVG Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={color}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
              transition: 'stroke-dasharray 0.8s ease-in-out',
            }}
          />
        </svg>

        {/* Score display */}
        <div className="z-10 text-center">
          <div 
            className="text-2xl font-bold"
            style={{ color, textShadow: `0 0 10px ${color}` }}
          >
            {score}
          </div>
          <div className="text-xs font-semibold text-cyber-gray uppercase tracking-wider">
            {level}
          </div>
        </div>

        {/* Inner glow effect */}
        <div 
          className="absolute inset-4 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${color}, transparent)`,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
};

export default RiskGauge3D;