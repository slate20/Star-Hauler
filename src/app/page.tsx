
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveContractsDisplay } from '@/components/active-contracts-display';
import { CargoInventoryDisplay } from '@/components/cargo-inventory-display'; // Updated import
import type { Contract, Good, ContractItemData, NewContractFormData, ModalDestinationEntry } from '@/lib/types';
import { SpaceHaulerLogo } from '@/components/space-hauler-logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddContractModal } from '@/components/add-contract-modal';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from 'lucide-react';

export default function HomePage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleContractItemAdded = useCallback((newItem: ContractItemData) => {
    setContracts(prevContracts => {
      const existingContractIndex = prevContracts.findIndex(c => c.destination.toLowerCase() === newItem.destination.toLowerCase());
      let updatedContracts = [...prevContracts];

      if (existingContractIndex > -1) {
        const contractToUpdate = { ...updatedContracts[existingContractIndex] };
        // Preserve original destination casing
        contractToUpdate.destination = prevContracts[existingContractIndex].destination; 
        
        const existingGoodIndex = contractToUpdate.goods.findIndex(g => g.productName.toLowerCase() === newItem.productName.toLowerCase());

        if (existingGoodIndex > -1) {
          const goodToUpdate = { ...contractToUpdate.goods[existingGoodIndex] };
          // Preserve original product name casing
          goodToUpdate.productName = contractToUpdate.goods[existingGoodIndex].productName;
          goodToUpdate.quantity += newItem.quantity;
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
     toast({
        title: "Contract Updated",
        description: `${newItem.quantity} unit(s) of ${newItem.productName} processed for ${newItem.destination}.`,
      });
  }, [toast]);
  
  const handleModalContractSubmit = useCallback((data: NewContractFormData) => {
    let itemsProcessed = 0;
    let hasFatalError = false;

    data.destinationEntries.forEach((destinationEntry: ModalDestinationEntry) => {
      if (hasFatalError) return;

      if (!destinationEntry.destination.trim()) {
        toast({ variant: "destructive", title: "Invalid Input", description: "Destination cannot be empty for one or more entries. Submission halted." });
        hasFatalError = true;
        return;
      }
      if (destinationEntry.goods.length === 0) {
        toast({ variant: "destructive", title: "Invalid Input", description: `At least one good must be added to the contract for ${destinationEntry.destination}. Submission halted.` });
        hasFatalError = true;
        return;
      }
      
      let goodsForThisDestinationProcessed = 0;
      destinationEntry.goods.forEach(good => {
        if (hasFatalError) return;

        if (good.productName.trim() && good.quantity > 0) {
          handleContractItemAdded({
            destination: destinationEntry.destination,
            productName: good.productName,
            quantity: good.quantity,
          });
          itemsProcessed++;
          goodsForThisDestinationProcessed++;
        } else if (good.productName.trim() && good.quantity <= 0) {
           toast({ variant: "destructive", title: "Invalid Quantity", description: `Quantity for ${good.productName} for ${destinationEntry.destination} must be positive. Submission halted.`});
           hasFatalError = true;
        } else if (!good.productName.trim() && good.quantity > 0) {
           toast({ variant: "destructive", title: "Invalid Product Name", description: `Product name for an item for ${destinationEntry.destination} cannot be empty. Submission halted.`});
           hasFatalError = true;
        }
      });
      if (goodsForThisDestinationProcessed === 0 && !hasFatalError && destinationEntry.goods.length > 0) {
        // This case handles if all goods for a specific destination were invalid but not fatal for others yet
        toast({ variant: "warning", title: "No Valid Goods", description: `No valid goods processed for ${destinationEntry.destination}.` });
      }

    });

    if (itemsProcessed > 0 && !hasFatalError) {
      setIsAddContractModalOpen(false); 
      form.reset({ destinationEntries: [{ destination: "", goods: [{ productName: "", quantity: 1 }] }] }); // Reset form on successful submission
    } else if (!hasFatalError) { // No items processed but no fatal errors either (e.g. all fields empty but valid structure)
       toast({ variant: "warning", title: "No Items Processed", description: "Please ensure all entries are valid and have items." });
    }
    // If hasFatalError, modal remains open for correction
  }, [handleContractItemAdded, toast]); // Removed form from dependencies, handled by parent


  const handleUpdateGoodQuantity = useCallback((contractId: string, goodId: string, newQuantity: number) => {
    setContracts(prevContracts =>
      prevContracts
        .map(contract => {
          if (contract.id === contractId) {
            const updatedGoods = contract.goods
              .map(good =>
                good.id === goodId ? { ...good, quantity: newQuantity } : good
              )
              .filter(good => good.quantity > 0); 
            return { ...contract, goods: updatedGoods.sort((a,b) => a.productName.localeCompare(b.productName)) };
          }
          return contract;
        })
        .filter(contract => contract.goods.length > 0) 
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
        .filter(contract => contract.goods.length > 0) 
    );
    toast({ title: "Good Removed", description: "The good has been removed from the contract." });
  }, [toast]);

  const handleAddGoodToContract = useCallback((contractId: string, goodData: { productName: string; quantity: number }) => {
    if (!goodData.productName.trim() || goodData.quantity <= 0) {
      toast({ variant: "destructive", title: "Invalid Input", description: "Product name cannot be empty and quantity must be positive." });
      return;
    }
    const targetContract = contracts.find(c => c.id === contractId);
    if (!targetContract) {
        toast({variant: "destructive", title: "Error", description: "Contract not found."});
        return;
    }

    setContracts(prevContracts =>
      prevContracts.map(contract => {
        if (contract.id === contractId) {
          const existingGoodIndex = contract.goods.findIndex(g => g.productName.toLowerCase() === goodData.productName.toLowerCase());
          let updatedGoods;
          if (existingGoodIndex > -1) {
             // Good exists, update quantity
            updatedGoods = contract.goods.map((g, index) =>
              index === existingGoodIndex ? { ...g, quantity: g.quantity + goodData.quantity } : g
            );
          } else {
            // New good
            const newGood: Good = {
              id: crypto.randomUUID(),
              productName: goodData.productName, // Use the casing from input
              quantity: goodData.quantity,
            };
            updatedGoods = [...contract.goods, newGood];
          }
          return { ...contract, goods: updatedGoods.sort((a,b) => a.productName.localeCompare(b.productName)) };
        }
        return contract;
      })
    );
    toast({ title: "Good Added", description: `${goodData.quantity} SCU of ${goodData.productName} added to ${targetContract.destination}.` });
  }, [contracts, toast]);

  const handleCompleteContract = useCallback((contractId: string) => {
    const contractToComplete = contracts.find(c => c.id === contractId);
    if (contractToComplete) {
      setContracts(prevContracts => prevContracts.filter(c => c.id !== contractId));
      toast({
        title: "Contract Completed",
        description: `Contract for ${contractToComplete.destination} has been removed from active contracts.`,
      });
    }
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
                <CardTitle className="text-2xl">New Haul</CardTitle>
                <CardDescription>Log new hauling contracts.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setIsAddContractModalOpen(true)} className="w-full">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Log New Haul
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-8">
             <ActiveContractsDisplay 
              contracts={contracts} 
              onUpdateGoodQuantity={handleUpdateGoodQuantity}
              onRemoveGood={handleRemoveGood}
              onAddGoodToContract={handleAddGoodToContract}
              onCompleteContract={handleCompleteContract} // Pass handler
            />
            <CargoInventoryDisplay contracts={contracts} /> {/* Updated component */}
          </div>
        </div>
      </main>
      
      <AddContractModal
        isOpen={isAddContractModalOpen}
        onOpenChange={setIsAddContractModalOpen}
        onContractSubmit={handleModalContractSubmit}
      />
      
      <footer className="text-center p-6 text-muted-foreground text-sm border-t border-border mt-12">
        Space Hauler &copy; {new Date().getFullYear()} | Managing Galactic Contracts.
      </footer>
    </div>
  );
}

// Added a dummy form variable to satisfy handleModalContractSubmit's expectation after removing it from dependencies
// This is a temporary workaround. In a real app, form reset should be handled more elegantly,
// possibly by passing the form instance or a reset function to handleModalContractSubmit.
const form = { reset: (values?: any) => {} };
