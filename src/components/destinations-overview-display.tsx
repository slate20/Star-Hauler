
"use client";

import type React from 'react';
import type { DestinationOverview } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MapPin, Package, CheckCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

type DestinationsOverviewDisplayProps = {
  destinations: DestinationOverview[];
  onMarkComplete: (destinationName: string) => void;
};

export const DestinationsOverviewDisplay: React.FC<DestinationsOverviewDisplayProps> = ({
  destinations,
  onMarkComplete,
}) => {
  if (!destinations || destinations.length === 0) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <MapPin className="mr-2 h-6 w-6 text-primary" /> Destinations Overview
          </CardTitle>
          <CardDescription>No pending deliveries grouped by destination.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">All tasks might be complete, or no active contracts with pending tasks.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <MapPin className="mr-2 h-6 w-6 text-primary" /> Destinations Overview ({destinations.length})
        </CardTitle>
        <CardDescription>Summary of all goods deliverable to each pending destination across active contracts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-4">
          {destinations.map((destOverview) => (
            <AccordionItem key={destOverview.destinationName} value={destOverview.destinationName} className="border bg-card/80 rounded-lg shadow-sm">
              <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-accent" />
                  <span className="font-semibold text-lg">{destOverview.destinationName}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {destOverview.goods.reduce((acc, good) => acc + good.totalQuantity, 0).toLocaleString()} total SCU
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <div className="space-y-3">
                  {destOverview.goods.length > 0 ? (
                    <>
                      <ScrollArea className="max-h-60 pr-3"> {/* Added ScrollArea */}
                        <ul className="space-y-2 mb-4">
                          {destOverview.goods.map((good) => (
                            <li key={good.productName} className="flex justify-between items-center p-2.5 bg-background/60 rounded-md">
                              <div className="flex items-center">
                                <Package className="mr-2 h-5 w-5 text-primary" />
                                <span className="font-medium">{good.productName}</span>
                              </div>
                              <span className="font-semibold text-primary">{good.totalQuantity.toLocaleString()} SCU</span>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                      <Button 
                        onClick={() => onMarkComplete(destOverview.destinationName)} 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark All Delivered at {destOverview.destinationName}
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-center py-2">No goods listed for this destination (should not happen if destination is listed).</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
