
"use client";

import type React from 'react';
import type { Contract } from '@/lib/types';
// Removed UEXCommodity import
import { ContractAccordionItem } from './contract-accordion-item';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
// Removed Skeleton import as loading state is removed

type ActiveContractsDisplayProps = {
  contracts: Contract[];
  onUpdateGoodQuantity: (contractId: string, goodId: string, newQuantity: number) => void;
  onRemoveGood: (contractId: string, goodId: string) => void;
  onAddGoodToContract: (contractId: string, goodData: { productName: string; quantity: number }) => void;
  // Removed commodities and isLoadingCommodities props
};

export const ActiveContractsDisplay: React.FC<ActiveContractsDisplayProps> = ({ 
  contracts, 
  onUpdateGoodQuantity, 
  onRemoveGood, 
  onAddGoodToContract,
  // Removed commodities, isLoadingCommodities from destructuring
}) => {
  // Removed isLoadingCommodities check and Skeleton rendering
  
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

  const sortedContracts = [...contracts].sort((a, b) => a.destination.localeCompare(b.destination));

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl">Active Contracts ({sortedContracts.length} destinations)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-4">
          {sortedContracts.map((contract) => (
            <ContractAccordionItem 
              key={contract.id} 
              contract={contract}
              onUpdateGoodQuantity={onUpdateGoodQuantity}
              onRemoveGood={onRemoveGood}
              onAddGoodToContract={onAddGoodToContract}
              // Removed commodities and isLoadingCommodities props
            />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

    