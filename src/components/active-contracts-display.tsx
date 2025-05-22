
"use client";

import type React from 'react';
import type { Contract } from '@/lib/types';
import { DestinationCard } from './destination-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ActiveContractsDisplayProps = {
  contracts: Contract[];
  onUpdateGoodQuantity: (contractId: string, goodId: string, newQuantity: number) => void;
  onRemoveGood: (contractId: string, goodId: string) => void;
  onAddGoodToContract: (contractId: string, goodData: { productName: string; quantity: number }) => void;
};

export const ActiveContractsDisplay: React.FC<ActiveContractsDisplayProps> = ({ 
  contracts, 
  onUpdateGoodQuantity, 
  onRemoveGood, 
  onAddGoodToContract 
}) => {
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

  // Sort contracts by destination name for consistent display
  const sortedContracts = [...contracts].sort((a, b) => a.destination.localeCompare(b.destination));


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl">Active Contracts ({sortedContracts.length} destinations)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedContracts.map((contract) => (
            <DestinationCard 
              key={contract.id} 
              contract={contract}
              onUpdateGoodQuantity={onUpdateGoodQuantity}
              onRemoveGood={onRemoveGood}
              onAddGoodToContract={onAddGoodToContract}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
