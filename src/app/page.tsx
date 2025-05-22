
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ContractItemForm } from '@/components/contract-item-form';
import { ActiveContractsDisplay } from '@/components/active-contracts-display';
import { QuantityTotalsDisplay } from '@/components/quantity-totals-display';
import type { Contract, Good, ContractItemData } from '@/lib/types';
import { SpaceHaulerLogo } from '@/components/space-hauler-logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function HomePage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // In a real app, this might be fetched from localStorage or an API
    // For now, we start with an empty list of contracts.
    setIsClient(true); 
  }, []);

  const handleContractItemAdded = useCallback((newItem: ContractItemData) => {
    setContracts(prevContracts => {
      const existingContractIndex = prevContracts.findIndex(c => c.destination === newItem.destination);
      let updatedContracts = [...prevContracts];

      if (existingContractIndex > -1) {
        // Destination exists, update or add good
        const contractToUpdate = { ...updatedContracts[existingContractIndex] };
        const existingGoodIndex = contractToUpdate.goods.findIndex(g => g.productName === newItem.productName);

        if (existingGoodIndex > -1) {
          // Product exists, update quantity (summing them up)
          const goodToUpdate = { ...contractToUpdate.goods[existingGoodIndex] };
          goodToUpdate.quantity += newItem.quantity;
          contractToUpdate.goods = [
            ...contractToUpdate.goods.slice(0, existingGoodIndex),
            goodToUpdate,
            ...contractToUpdate.goods.slice(existingGoodIndex + 1),
          ];
        } else {
          // Product does not exist, add new good
          const newGood: Good = {
            id: crypto.randomUUID(),
            productName: newItem.productName,
            quantity: newItem.quantity,
          };
          contractToUpdate.goods = [...contractToUpdate.goods, newGood];
        }
        updatedContracts[existingContractIndex] = contractToUpdate;
      } else {
        // Destination does not exist, create new contract
        const newContract: Contract = {
          id: crypto.randomUUID(),
          destination: newItem.destination,
          goods: [{
            id: crypto.randomUUID(),
            productName: newItem.productName,
            quantity: newItem.quantity,
          }],
        };
        updatedContracts = [...updatedContracts, newContract];
      }
      return updatedContracts;
    });
  }, []); // setContracts is stable

  if (!isClient) {
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
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 items-start">
          
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <Card className="shadow-xl bg-card/90">
              <CardHeader>
                <CardTitle className="text-2xl">Add Contract Item</CardTitle>
                <CardDescription>Enter details for goods to be hauled.</CardDescription>
              </CardHeader>
              <CardContent>
                <ContractItemForm onItemAdded={handleContractItemAdded} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <QuantityTotalsDisplay contracts={contracts} />
            <ActiveContractsDisplay contracts={contracts} />
          </div>
        </div>
      </main>
      
      <footer className="text-center p-6 text-muted-foreground text-sm border-t border-border mt-12">
        Space Hauler &copy; {new Date().getFullYear()} | Managing Galactic Contracts.
      </footer>
    </div>
  );
}
