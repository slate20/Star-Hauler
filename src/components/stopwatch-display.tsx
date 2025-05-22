
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCcw, Timer, Gauge, TrendingUp, Hourglass } from 'lucide-react';
import { formatTime } from '@/lib/utils';

type StopwatchDisplayProps = {
  elapsedTimeInSeconds: number;
  stopwatchState: 'stopped' | 'running';
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  sessionAUECPerHour: number | null;
  sessionDurationInSeconds: number | null;
  sessionReward: number | null;
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
}) => {
  return (
    <Card className="shadow-xl bg-card/90">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Timer className="mr-2 h-6 w-6 text-primary" />
          Hauling Session Timer
        </CardTitle>
        <CardDescription>Track your hauling time and calculate aUEC per hour.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-5xl font-mono font-bold text-accent">
            {formatTime(elapsedTimeInSeconds)}
          </p>
        </div>
        <div className="flex justify-center space-x-3">
          {stopwatchState === 'stopped' ? (
            <Button onClick={onStart} size="lg">
              <Play className="mr-2 h-5 w-5" /> Start
            </Button>
          ) : (
            <Button onClick={onStop} variant="destructive" size="lg">
              <Square className="mr-2 h-5 w-5" /> Stop
            </Button>
          )}
          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
            disabled={elapsedTimeInSeconds === 0 && stopwatchState === 'stopped'}
          >
            <RotateCcw className="mr-2 h-5 w-5" /> Reset
          </Button>
        </div>

        {sessionAUECPerHour !== null && sessionDurationInSeconds !== null && sessionReward !== null && (
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-lg font-semibold mb-3 text-center text-primary">Last Session Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-card-foreground/5 rounded-md">
                <span className="flex items-center text-muted-foreground">
                  <Hourglass className="mr-2 h-4 w-4" /> Duration:
                </span>
                <span className="font-semibold">{formatTime(sessionDurationInSeconds)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-card-foreground/5 rounded-md">
                <span className="flex items-center text-muted-foreground">
                  <TrendingUp className="mr-2 h-4 w-4" /> aUEC Earned:
                </span>
                <span className="font-semibold">{sessionReward.toLocaleString()} aUEC</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-card-foreground/5 rounded-md">
                <span className="flex items-center text-muted-foreground">
                  <Gauge className="mr-2 h-4 w-4" /> Rate:
                </span>
                <span className="font-semibold text-accent">
                  {sessionAUECPerHour > 0 ? `${Math.round(sessionAUECPerHour).toLocaleString()} aUEC/hr` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
