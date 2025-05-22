
"use client";

import type React from 'react';
// import { useState, useMemo } from 'react'; // Sorting might be added later
import type { Contract } from '@/lib/types';
import { DestinationCard } from './destination-card';
// import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { ArrowUpDown, CalendarDays, Package, Rocket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ActiveContractsDisplayProps = {
  contracts: Contract[];
  // Callbacks for updates will be added later
};

export const ActiveContractsDisplay: React.FC<ActiveContractsDisplayProps> = ({ contracts }) => {
  // Sorting logic can be reintroduced later if needed
  // const [sortConfig, setSortConfig] = useState<{ key: keyof Contract | 'goodsCount'; direction: 'ascending' | 'descending' }>({
  //   key: 'destination', // Default sort, or maybe by last update?
  //   direction: 'ascending',
  // });

  // const sortedContracts = useMemo(() => {
  //   // Sorting logic here
  //   return contracts;
  // }, [contracts, sortConfig]);

  if (!contracts || contracts.length === 0) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Active Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No active contracts. Add some items to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl">Active Contracts ({contracts.length} destinations)</CardTitle>
          {/* Sorting UI can be added here later */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contracts.map((contract) => (
            <DestinationCard key={contract.id} contract={contract} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
