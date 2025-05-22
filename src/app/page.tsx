
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ContractItemForm } from '@/components/contract-item-form';
import { ActiveContractsDisplay } from '@/components/active-contracts-display';
import { QuantityTotalsDisplay } from '@/components/quantity-totals-display';
import type { Contract, Good, ContractItemData } from '@/lib/types';
import { SpaceHaulerLogo } from '@/components/space-hauler-logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    // In a real app, this might be fetched from localStorage or an API
    // For now, we start with an empty list of contracts.
  }, []);

  const handleContractItemAdded = useCallback((newItem: ContractItemData) => {
    setContracts(prevContracts => {
      const existingContractIndex = prevContracts.findIndex(c => c.destination === newItem.destination);
      let updatedContracts = [...prevContracts];

      if (existingContractIndex > -1) {
        const contractToUpdate = { ...updatedContracts[existingContractIndex] };
        const existingGoodIndex = contractToUpdate.goods.findIndex(g => g.productName === newItem.productName);

        if (existingGoodIndex > -1) {
          const goodToUpdate = { ...contractToUpdate.goods[existingGoodIndex] };
          goodToUpdate.quantity += newItem.quantity; // Sum quantities
          contractToUpdate.goods = [
            ...contractToUpdate.goods.slice(0, existingGoodIndex),
            goodToUpdate,
            ...contractToUpdate.goods.slice(existingGoodIndex + 1),
          ].sort((a,b) => a.productName.localeCompare(b.productName));
        } else {
          const newGood: Good = {
            id: crypto.randomUUID(),
            productName: newItem.productName,
            quantity: newItem.quantity,
          };
          contractToUpdate.goods = [...contractToUpdate.goods, newGood].sort((a,b) => a.productName.localeCompare(b.productName));
        }
        updatedContracts[existingContractIndex] = contractToUpdate;
      } else {
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
      return updatedContracts.sort((a,b) => a.destination.localeCompare(b.destination));
    });
  }, []);

  const handleUpdateGoodQuantity = useCallback((contractId: string, goodId: string, newQuantity: number) => {
    setContracts(prevContracts =>
      prevContracts
        .map(contract => {
          if (contract.id === contractId) {
            const updatedGoods = contract.goods
              .map(good =>
                good.id === goodId ? { ...good, quantity: newQuantity } : good
              )
              .filter(good => good.quantity > 0); // Remove good if quantity is 0 or less
            return { ...contract, goods: updatedGoods.sort((a,b) => a.productName.localeCompare(b.productName)) };
          }
          return contract;
        })
        .filter(contract => contract.goods.length > 0) // Remove contract if it has no goods
    );
    toast({ title: "Quantity Updated", description: "Good quantity has been adjusted." });
  }, [toast]);

  const handleRemoveGood = useCallback((contractId: string, goodId: string) => {
    setContracts(prevContracts =>
      prevContracts
        .map(contract => {
          if (contract.id === contractId) {
            const updatedGoods = contract.goods.filter(good => good.id !== goodId);
            return { ...contract, goods: updatedGoods };
          }
          return contract;
        })
        .filter(contract => contract.goods.length > 0) // Remove contract if it has no goods
    );
    toast({ title: "Good Removed", description: "The good has been removed from the contract." });
  }, [toast]);

  const handleAddGoodToContract = useCallback((contractId: string, goodData: { productName: string; quantity: number }) => {
    if (!goodData.productName.trim() || goodData.quantity <= 0) {
      toast({ variant: "destructive", title: "Invalid Input", description: "Product name cannot be empty and quantity must be positive." });
      return;
    }
    setContracts(prevContracts =>
      prevContracts.map(contract => {
        if (contract.id === contractId) {
          const existingGoodIndex = contract.goods.findIndex(g => g.productName === goodData.productName);
          let updatedGoods;
          if (existingGoodIndex > -1) {
            // Good already exists, update quantity
            updatedGoods = contract.goods.map((g, index) =>
              index === existingGoodIndex ? { ...g, quantity: g.quantity + goodData.quantity } : g
            );
          } else {
            // Add new good
            const newGood: Good = {
              id: crypto.randomUUID(),
              productName: goodData.productName,
              quantity: goodData.quantity,
            };
            updatedGoods = [...contract.goods, newGood];
          }
          return { ...contract, goods: updatedGoods.sort((a,b) => a.productName.localeCompare(b.productName)) };
        }
        return contract;
      })
    );
    toast({ title: "Good Added", description: `${goodData.productName} added to ${contracts.find(c=>c.id === contractId)?.destination}.` });
  }, [contracts, toast]);


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
            <ActiveContractsDisplay 
              contracts={contracts} 
              onUpdateGoodQuantity={handleUpdateGoodQuantity}
              onRemoveGood={handleRemoveGood}
              onAddGoodToContract={handleAddGoodToContract}
            />
          </div>
        </div>
      </main>
      
      <footer className="text-center p-6 text-muted-foreground text-sm border-t border-border mt-12">
        Space Hauler &copy; {new Date().getFullYear()} | Managing Galactic Contracts.
      </footer>
    </div>
  );
}
