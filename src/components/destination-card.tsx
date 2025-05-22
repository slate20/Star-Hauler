
"use client";

import type React from 'react';
import type { Contract, Good } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Package, Warehouse, CalendarDays } from 'lucide-react'; // Using Warehouse for quantity
// import { format, parseISO } from 'date-fns'; // Date might not be relevant per good

type DestinationCardProps = {
  contract: Contract;
  // Props for updating/removing goods will be added later
};

export const DestinationCard: React.FC<DestinationCardProps> = ({ contract }) => {
  // const formattedDate = contract.lastUpdate ? format(parseISO(contract.lastUpdate), "PPpp 'UTC'") : 'N/A';

  return (
    <Card className="shadow-lg hover:shadow-accent/20 transition-shadow duration-300 animate-in fade-in-50 slide-in-from-bottom-10">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Rocket className="mr-2 h-5 w-5 text-primary" />
          {contract.destination}
        </CardTitle>
        {/* <CardDescription className="flex items-center text-sm">
          <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
          Last Updated: {formattedDate}
        </CardDescription> */}
      </CardHeader>
      <CardContent className="space-y-3">
        {contract.goods.length > 0 ? (
          contract.goods.map((good) => (
            <div key={good.id} className="flex justify-between items-center p-2 bg-card-foreground/5 rounded-md">
              <div className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-accent" />
                <span className="font-medium">{good.productName}</span>
              </div>
              <div className="flex items-center">
                 <Warehouse className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="ml-1">{good.quantity.toLocaleString()} units</span>
              </div>
              {/* Add + / - / remove buttons here later */}
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No goods assigned to this destination yet.</p>
        )}
      </CardContent>
      {/* Footer for "Add Good" button or summary can be added later */}
    </Card>
  );
};
