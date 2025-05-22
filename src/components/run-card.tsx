"use client";

import type React from 'react';
import type { HaulingRun } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Rocket, Package, Hash, CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type HaulingRunCardProps = {
  run: HaulingRun;
};

export const HaulingRunCard: React.FC<HaulingRunCardProps> = ({ run }) => {
  const formattedDate = format(parseISO(run.date), "PPpp 'UTC'"); // e.g., Jul 21, 2023, 4:30:00 PM UTC

  return (
    <Card className="shadow-lg hover:shadow-accent/20 transition-shadow duration-300 animate-in fade-in-50 slide-in-from-bottom-10">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Rocket className="mr-2 h-5 w-5 text-primary" />
          {run.destination}
        </CardTitle>
        <CardDescription className="flex items-center text-sm">
          <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
          Logged on: {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center">
          <Package className="mr-2 h-5 w-5 text-accent" />
          <span className="font-medium">Cargo:</span>
          <span className="ml-2">{run.cargo}</span>
        </div>
        <div className="flex items-center">
          <Hash className="mr-2 h-5 w-5 text-accent" />
          <span className="font-medium">SCU:</span>
          <span className="ml-2">{run.scu.toLocaleString()}</span>
        </div>
      </CardContent>
      {/* CardFooter can be used for actions like "Edit" or "Delete" in the future */}
      {/* <CardFooter>
        <Button variant="outline" size="sm">Details</Button>
      </CardFooter> */}
    </Card>
  );
};
