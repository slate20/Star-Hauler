"use client";

import React, { useState, useEffect } from 'react';
import { LogRunForm } from '@/components/log-run-form';
import { RunHistory } from '@/components/run-history';
import { ScuTotalsDisplay } from '@/components/scu-totals-display';
import type { HaulingRun } from '@/lib/types';
import { SpaceHaulerLogo } from '@/components/space-hauler-logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Sample initial data for demonstration
const initialRunsData: HaulingRun[] = [
  { id: '1', destination: 'Mars Colony Alpha', cargo: 'Hydroponics Gear', scu: 120, date: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: '2', destination: 'Europa Mining Outpost', cargo: 'Heavy Drills', scu: 75, date: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: '3', destination: 'Mars Colony Alpha', cargo: 'Emergency Meds', scu: 90, date: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: '4', destination: 'Titan Research Station', cargo: 'Lab Equipment', scu: 210, date: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: '5', destination: 'Europa Mining Outpost', cargo: 'Life Support Modules', scu: 150, date: new Date(Date.now() - 86400000 * 2).toISOString() },
];

export default function HomePage() {
  const [haulingRuns, setHaulingRuns] = useState<HaulingRun[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Load initial data on client mount to avoid hydration issues with Date
    // In a real app, this would be fetched from localStorage or an API
    setHaulingRuns(initialRunsData);
    setIsClient(true);
  }, []);


  const handleRunLogged = (newRun: HaulingRun) => {
    setHaulingRuns(prevRuns => [newRun, ...prevRuns]);
  };

  if (!isClient) {
    // Render a loading state or simplified version for SSR/prerender
    // to prevent hydration mismatch with initialRunsData which uses Date.now()
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Loading Space Hauler Interface...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="py-6 px-4 md:px-8 border-b border-border shadow-md sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto flex justify-between items-center">
         <SpaceHaulerLogo />
         {/* Future: User profile / settings icon */}
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 items-start">
          
          <div className="lg:col-span-2 lg:sticky lg:top-28"> {/* Sticky form column */}
            <Card className="shadow-xl bg-card/90">
              <CardHeader>
                <CardTitle className="text-2xl">Log New Haul</CardTitle>
                <CardDescription>Enter details for your latest cargo run.</CardDescription>
              </CardHeader>
              <CardContent>
                <LogRunForm onRunLogged={handleRunLogged} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <ScuTotalsDisplay runs={haulingRuns} />
            <RunHistory runs={haulingRuns} />
          </div>
        </div>
      </main>
      
      <footer className="text-center p-6 text-muted-foreground text-sm border-t border-border mt-12">
        Space Hauler &copy; {new Date().getFullYear()} | Navigating the Cosmos, One Haul at a Time.
      </footer>
    </div>
  );
}
