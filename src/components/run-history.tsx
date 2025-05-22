"use client";

import type React from 'react';
import { useState, useMemo } from 'react';
import type { HaulingRun } from '@/lib/types';
import { HaulingRunCard } from './run-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, CalendarDays, Package, Rocket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SortKey = keyof Pick<HaulingRun, 'destination' | 'cargo' | 'date' | 'scu'>;

type RunHistoryProps = {
  runs: HaulingRun[];
};

export const RunHistory: React.FC<RunHistoryProps> = ({ runs }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' }>({
    key: 'date',
    direction: 'descending',
  });

  const sortedRuns = useMemo(() => {
    if (!runs) return [];
    return [...runs].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      }

      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }
      return sortConfig.direction === 'descending' ? comparison * -1 : comparison;
    });
  }, [runs, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortOptions: { value: SortKey; label: string; icon: React.ElementType}[] = [
    { value: "date", label: "Date", icon: CalendarDays },
    { value: "destination", label: "Destination", icon: Rocket },
    { value: "cargo", label: "Cargo", icon: Package },
    { value: "scu", label: "SCU", icon: ArrowUpDown }, // Using generic sort icon for SCU
  ];


  if (!runs || runs.length === 0) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Hauling History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hauling runs logged yet. Time to hit the starlanes!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl">Hauling History ({runs.length} runs)</CardTitle>
          <div className="flex items-center gap-2">
             <Select
                value={sortConfig.key}
                onValueChange={(value) => requestSort(value as SortKey)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => requestSort(sortConfig.key)} title={`Toggle sort direction (Currently ${sortConfig.direction})`}>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedRuns.map((run) => (
            <HaulingRunCard key={run.id} run={run} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
