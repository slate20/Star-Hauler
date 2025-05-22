"use client";

import type React from 'react';
import { useMemo } from 'react';
import type { HaulingRun } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, BarChart3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type ScuTotalsDisplayProps = {
  runs: HaulingRun[];
};

export const ScuTotalsDisplay: React.FC<ScuTotalsDisplayProps> = ({ runs }) => {
  const scuTotalsByDestination = useMemo(() => {
    const totals: Record<string, number> = {};
    runs.forEach(run => {
      totals[run.destination] = (totals[run.destination] || 0) + run.scu;
    });
    return Object.entries(totals).sort(([, a], [, b]) => b - a); // Sort by SCU descending
  }, [runs]);

  if (scuTotalsByDestination.length === 0) {
    return (
       <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-primary" />
            SCU Totals by Destination
          </CardTitle>
          <CardDescription>No data to display totals.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-primary" />
          SCU Totals by Destination
        </CardTitle>
        <CardDescription>Summary of all cargo hauled to each location.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4"> {/* Max height with scroll */}
          <ul className="space-y-3">
            {scuTotalsByDestination.map(([destination, totalScu]) => (
              <li key={destination} className="flex justify-between items-center p-3 bg-card-foreground/5 rounded-lg">
                <div className="flex items-center">
                  <Rocket className="mr-3 h-5 w-5 text-accent" />
                  <span className="font-medium">{destination}</span>
                </div>
                <span className="font-semibold text-primary">{totalScu.toLocaleString()} SCU</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
