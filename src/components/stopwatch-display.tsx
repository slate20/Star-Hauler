
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw, Timer, Gauge, TrendingUp, Hourglass } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

type StopwatchDisplayProps = {
  elapsedTimeInSeconds: number;
  stopwatchState: 'stopped' | 'running';
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  sessionAUECPerHour: number | null;
  sessionDurationInSeconds: number | null;
  sessionReward: number | null;
  variant?: 'header' | 'panel';
};

export const StopwatchDisplay: React.FC<StopwatchDisplayProps> = ({
  elapsedTimeInSeconds,
  stopwatchState,
  onStart,
  onStop,
  onReset,
  sessionAUECPerHour,
  sessionDurationInSeconds,
  sessionReward,
  variant = 'header',
}) => {
  return (
    <div
      className={cn(
        "flex",
        variant === 'header' 
          ? "items-center gap-2 md:gap-4 p-2 rounded-lg bg-card/50 border border-border/50" 
          : "flex-col items-stretch gap-3" // For 'panel' variant, no outer bg/border/padding
      )}
    >
      <div className={cn(
        "flex items-center gap-2",
        variant === 'panel' && "justify-center text-center w-full" // Center time in panel
      )}>
        <Timer className="h-5 w-5 text-primary flex-shrink-0" />
        <p className={cn(
          "font-mono font-semibold text-accent text-center",
          variant === 'header' ? "text-xl md:text-2xl min-w-[80px] md:min-w-[100px]" : "text-3xl"
        )}>
          {formatTime(elapsedTimeInSeconds)}
        </p>
      </div>
      
      <div className={cn(
        "flex items-center",
        variant === 'header' ? "gap-1 md:gap-2" : "flex-col w-full gap-2 mt-2"
      )}>
        {stopwatchState === 'stopped' ? (
          <Button 
            onClick={onStart} 
            size="sm" 
            variant="outline" 
            className={cn(variant === 'panel' && "w-full")}
          >
            <Play className="h-4 w-4 md:mr-1" /> <span className={cn(variant === 'header' && "hidden md:inline")}>Start</span>
          </Button>
        ) : (
          <Button 
            onClick={onStop} 
            variant="destructive" 
            size="sm" 
            className={cn(variant === 'panel' && "w-full")}
          >
            <Square className="h-4 w-4 md:mr-1" /> <span className={cn(variant === 'header' && "hidden md:inline")}>Stop</span>
          </Button>
        )}
        <Button
          onClick={onReset}
          variant="ghost"
          size="sm"
          disabled={elapsedTimeInSeconds === 0 && stopwatchState === 'stopped'}
          className={cn(
            "text-muted-foreground hover:text-foreground",
            variant === 'panel' && "w-full"
          )}
        >
          <RotateCcw className="h-4 w-4 md:mr-1" /> <span className={cn(variant === 'header' && "hidden md:inline")}>Reset</span>
        </Button>
      </div>

      {sessionAUECPerHour !== null && sessionDurationInSeconds !== null && sessionReward !== null && (
        <div className={cn(
          "text-xs space-y-0.5",
          variant === 'header' && "ml-2 md:ml-4 pl-2 md:pl-4 border-l border-border/70 hidden lg:block",
          variant === 'panel' && "mt-4 pt-4 border-t border-border/70 w-full"
        )}>
            <div className="flex items-center gap-1 text-muted-foreground">
                <Hourglass className="h-3 w-3" /> 
                <span>{formatTime(sessionDurationInSeconds)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>{sessionReward.toLocaleString()} aUEC</span>
            </div>
            <div className="flex items-center gap-1 text-accent font-medium">
                <Gauge className="h-3 w-3" /> 
                <span>
                {sessionAUECPerHour > 0 ? `${Math.round(sessionAUECPerHour).toLocaleString()} aUEC/hr` : 'N/A'}
                </span>
            </div>
        </div>
      )}
    </div>
  );
};
