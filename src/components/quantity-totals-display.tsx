
"use client";

import type React from 'react';
import { useMemo } from 'react';
import type { Contract } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, BarChart3, Warehouse } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type QuantityTotalsDisplayProps = {
  contracts: Contract[];
};

export const QuantityTotalsDisplay: React.FC<QuantityTotalsDisplayProps> = ({ contracts }) => {
  const quantityTotalsByDestination = useMemo(() => {
    const totals: Record<string, number> = {};
    contracts.forEach(contract => {
      const totalQuantityForDestination = contract.goods.reduce((sum, good) => sum + good.quantity, 0);
      totals[contract.destination] = (totals[contract.destination] || 0) + totalQuantityForDestination;
    });
    return Object.entries(totals).sort(([, a], [, b]) => b - a); // Sort by total quantity descending
  }, [contracts]);

  if (quantityTotalsByDestination.length === 0) {
    return (
       <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-primary" />
            Total Quantity by Destination
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
          Total Quantity by Destination
        </CardTitle>
        <CardDescription>Summary of all item quantities for each location.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4"> {/* Max height with scroll */}
          <ul className="space-y-3">
            {quantityTotalsByDestination.map(([destination, totalQuantity]) => (
              <li key={destination} className="flex justify-between items-center p-3 bg-card-foreground/5 rounded-lg">
                <div className="flex items-center">
                  <Rocket className="mr-3 h-5 w-5 text-accent" />
                  <span className="font-medium">{destination}</span>
                </div>
                <div className="flex items-center">
                  <Warehouse className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-primary">{totalQuantity.toLocaleString()} units</span>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
