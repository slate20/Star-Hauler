
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveContractsDisplay } from '@/components/active-contracts-display';
import { CargoInventoryDisplay } from '@/components/cargo-inventory-display';
import type { ContractV2, DestinationTask, Good, NewContractFormData, ModalDestinationEntry } from '@/lib/types';
import { SpaceHaulerLogo } from '@/components/space-hauler-logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddContractModal } from '@/components/add-contract-modal';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, BookOpen, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogBookDisplay } from '@/components/log-book-display'; // Placeholder for now

export default function HomePage() {
  const [activeContracts, setActiveContracts] = useState<ContractV2[]>([]);
  const [completedContracts, setCompletedContracts] = useState<ContractV2[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simplified contract processing, modal handles complex input
  const handleModalContractSubmit = useCallback((data: NewContractFormData) => {
    let hasFatalError = false;
    if (!data.contractNumber.trim()) {
      toast({ variant: "destructive", title: "Invalid Input", description: "Contract Number/ID cannot be empty." });
      return; // Stop processing if contract number is missing
    }
    if (data.destinationEntries.length === 0) {
      toast({ variant: "destructive", title: "Invalid Input", description: "At least one destination task must be added to the contract." });
      return; // Stop processing if no destination entries
    }

    const newDestinationTasks: DestinationTask[] = data.destinationEntries.map(entry => {
      if (hasFatalError) return null; // Skip if error occurred in previous entry

      if (!entry.destination.trim()) {
        toast({ variant: "destructive", title: "Invalid Input", description: `Destination cannot be empty for one or more tasks in contract ${data.contractNumber}. Submission halted.` });
        hasFatalError = true;
        return null;
      }
      if (entry.goods.length === 0) {
         toast({ variant: "destructive", title: "Invalid Input", description: `At least one good must be added to task for ${entry.destination} in contract ${data.contractNumber}. Submission halted.` });
        hasFatalError = true;
        return null;
      }
      
      let validGoodsForTask = 0;
      const taskGoods: Good[] = entry.goods.map(good => {
        if (hasFatalError) return null;

        if (good.productName.trim() && good.quantity > 0) {
          validGoodsForTask++;
          return {
            id: crypto.randomUUID(),
            productName: good.productName,
            quantity: good.quantity,
          };
        } else if (good.productName.trim() && good.quantity <= 0) {
           toast({ variant: "destructive", title: "Invalid Quantity", description: `Quantity for ${good.productName} (Task: ${entry.destination}, Contract: ${data.contractNumber}) must be positive. Submission halted.`});
           hasFatalError = true;
        } else if (!good.productName.trim() && good.quantity > 0) {
           toast({ variant: "destructive", title: "Invalid Product Name", description: `Product name for an item (Task: ${entry.destination}, Contract: ${data.contractNumber}) cannot be empty. Submission halted.`});
           hasFatalError = true;
        }
        return null;
      }).filter(g => g !== null) as Good[];

      if (hasFatalError) return null;
      if (validGoodsForTask === 0 && entry.goods.length > 0) {
         toast({ variant: "warning", title: "No Valid Goods", description: `No valid goods processed for task ${entry.destination} in contract ${data.contractNumber}.` });
         // Don't make this a fatal error, an empty task might be intentional for later editing
      }


      return {
        id: crypto.randomUUID(),
        destination: entry.destination,
        goods: taskGoods,
        isComplete: false,
      };
    }).filter(task => task !== null) as DestinationTask[];

    if (hasFatalError) {
      return; // Modal remains open if fatal error
    }

    if (newDestinationTasks.length === 0 && data.destinationEntries.length > 0) {
      toast({ variant: "warning", title: "No Tasks Processed", description: "No valid destination tasks were created. Please check entries." });
      return; // Modal remains open
    }
    
    if (newDestinationTasks.length > 0) {
      const newContract: ContractV2 = {
        id: crypto.randomUUID(),
        contractNumber: data.contractNumber,
        description: "", // Can add a description field to modal later
        destinationTasks: newDestinationTasks,
      };
      setActiveContracts(prev => [...prev, newContract].sort((a,b) => a.contractNumber.localeCompare(b.contractNumber)));
      toast({ title: "Contract Logged", description: `Contract ${data.contractNumber} with ${newDestinationTasks.length} task(s) has been added.` });
      setIsAddContractModalOpen(false); // Close modal on successful submission
    } else if (!hasFatalError && data.destinationEntries.length > 0){
       toast({ variant: "warning", title: "No Tasks Processed", description: "Please ensure all entries are valid and have items." });
    } else if (!hasFatalError && data.destinationEntries.length === 0) {
      // This case is already handled by the check at the start of the function.
    }

  }, [toast]);


  const handleUpdateGoodQuantity = useCallback((contractId: string, taskId: string, goodId: string, newQuantity: number) => {
    setActiveContracts(prevContracts =>
      prevContracts.map(contract => {
        if (contract.id === contractId) {
          return {
            ...contract,
            destinationTasks: contract.destinationTasks.map(task => {
              if (task.id === taskId) {
                const updatedGoods = task.goods
                  .map(good =>
                    good.id === goodId ? { ...good, quantity: newQuantity } : good
                  )
                  .filter(good => good.quantity > 0) // Remove good if quantity is 0 or less
                  .sort((a,b) => a.productName.localeCompare(b.productName));
                return { ...task, goods: updatedGoods };
              }
              return task;
            }),
          };
        }
        return contract;
      })
    );
    toast({ title: "Quantity Updated", description: "Good quantity has been adjusted for the task." });
  }, [toast]);

  const handleRemoveGood = useCallback((contractId: string, taskId: string, goodId: string) => {
    setActiveContracts(prevContracts =>
      prevContracts.map(contract => {
        if (contract.id === contractId) {
          return {
            ...contract,
            destinationTasks: contract.destinationTasks.map(task => {
              if (task.id === taskId) {
                const updatedGoods = task.goods.filter(good => good.id !== goodId);
                return { ...task, goods: updatedGoods };
              }
              return task;
            }),
          };
        }
        return contract;
      })
      // Note: We don't filter out empty tasks or contracts here, that's handled by task completion logic
    );
    toast({ title: "Good Removed", description: "The good has been removed from the task." });
  }, [toast]);

  const handleAddGoodToTask = useCallback((contractId: string, taskId: string, goodData: { productName: string; quantity: number }) => {
    if (!goodData.productName.trim() || goodData.quantity <= 0) {
      toast({ variant: "destructive", title: "Invalid Input", description: "Product name cannot be empty and quantity must be positive." });
      return;
    }
    
    let taskDestination = "";

    setActiveContracts(prevContracts =>
      prevContracts.map(contract => {
        if (contract.id === contractId) {
          return {
            ...contract,
            destinationTasks: contract.destinationTasks.map(task => {
              if (task.id === taskId) {
                taskDestination = task.destination; // For toast message
                const existingGoodIndex = task.goods.findIndex(g => g.productName.toLowerCase() === goodData.productName.toLowerCase());
                let updatedGoods;
                if (existingGoodIndex > -1) {
                  updatedGoods = task.goods.map((g, index) =>
                    index === existingGoodIndex ? { ...g, quantity: g.quantity + goodData.quantity } : g
                  );
                } else {
                  const newGood: Good = {
                    id: crypto.randomUUID(),
                    productName: goodData.productName,
                    quantity: goodData.quantity,
                  };
                  updatedGoods = [...task.goods, newGood];
                }
                return { ...task, goods: updatedGoods.sort((a,b) => a.productName.localeCompare(b.productName)) };
              }
              return task;
            }),
          };
        }
        return contract;
      })
    );
    if (taskDestination) {
      toast({ title: "Good Added", description: `${goodData.quantity} SCU of ${goodData.productName} added to task for ${taskDestination}.` });
    } else {
      toast({ title: "Good Added", description: `${goodData.quantity} SCU of ${goodData.productName} added to task.` });
    }
  }, [toast]);

  const handleToggleTaskStatus = useCallback((contractId: string, taskId: string) => {
    setActiveContracts(prevActive => {
      let contractToMove: ContractV2 | null = null;
      const updatedActive = prevActive.map(c => {
        if (c.id === contractId) {
          const updatedTasks = c.destinationTasks.map(t => 
            t.id === taskId ? { ...t, isComplete: !t.isComplete } : t
          );
          const allTasksComplete = updatedTasks.every(t => t.isComplete);
          if (allTasksComplete) {
            contractToMove = { ...c, destinationTasks: updatedTasks };
            return null; // Will be filtered out from active
          }
          return { ...c, destinationTasks: updatedTasks };
        }
        return c;
      }).filter(c => c !== null) as ContractV2[];

      if (contractToMove) {
        setCompletedContracts(prevCompleted => 
            [...prevCompleted, contractToMove!].sort((a,b) => a.contractNumber.localeCompare(b.contractNumber))
        );
        toast({ title: "Contract Complete", description: `Contract ${contractToMove.contractNumber} moved to Log Book.`});
      } else {
        // Check if a task was marked incomplete on a completed contract
         setCompletedContracts(prevCompleted => {
            const contractReopened = prevCompleted.find(cc => cc.id === contractId);
            if (contractReopened) {
                const updatedTasks = contractReopened.destinationTasks.map(t => 
                    t.id === taskId ? { ...t, isComplete: !t.isComplete } : t
                );
                 const updatedReopenedContract = {...contractReopened, destinationTasks: updatedTasks};
                // Add it back to activeContracts
                setActiveContracts(prevActiveAgain => 
                    [...prevActiveAgain, updatedReopenedContract].sort((a,b) => a.contractNumber.localeCompare(b.contractNumber))
                );
                toast({ title: "Contract Reopened", description: `Contract ${updatedReopenedContract.contractNumber} moved back to Active Contracts.`});
                return prevCompleted.filter(cc => cc.id !== contractId); // Remove from completed
            }
            return prevCompleted;
        });
        if(!contractToMove && !activeContracts.find(c => c.id === contractId)) { // if it wasn't moved to completed and not found in active (must have been in completed)
            const targetTask = completedContracts.find(c=>c.id === contractId)?.destinationTasks.find(t=>t.id === taskId);
            if (targetTask) { // This implies it was reopened
                 toast({ title: "Task Updated", description: `Task for ${targetTask.destination} status changed.`});
            }
        } else if (!contractToMove) { // if it's still in active contracts
             const targetTask = activeContracts.find(c=>c.id === contractId)?.destinationTasks.find(t=>t.id === taskId);
             if (targetTask) {
                 toast({ title: "Task Updated", description: `Task for ${targetTask.destination} status changed.`});
             }
        }
      }
      return updatedActive;
    });
  }, [toast, activeContracts, completedContracts]);


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
                <CardTitle className="text-2xl">New Contract</CardTitle>
                <CardDescription>Log a new hauling contract with all its destinations and goods.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setIsAddContractModalOpen(true)} className="w-full">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Log New Contract
                </Button>
              </CardContent>
            </Card>
            <div className="mt-8">
              <CargoInventoryDisplay contracts={activeContracts} />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="active">
                  <History className="mr-2 h-5 w-5" /> Active Contracts ({activeContracts.length})
                </TabsTrigger>
                <TabsTrigger value="logbook">
                  <BookOpen className="mr-2 h-5 w-5" /> Log Book ({completedContracts.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="active">
                <ActiveContractsDisplay 
                  contracts={activeContracts} 
                  onUpdateGoodQuantity={handleUpdateGoodQuantity}
                  onRemoveGood={handleRemoveGood}
                  onAddGoodToTask={handleAddGoodToTask}
                  onToggleTaskStatus={handleToggleTaskStatus}
                />
              </TabsContent>
              <TabsContent value="logbook">
                 <LogBookDisplay 
                  contracts={completedContracts}
                  onToggleTaskStatus={handleToggleTaskStatus} // Allow reopening tasks/contracts
                  // Read-only goods for completed, so no goods handlers passed
                 />
              </TabsContent>
            </Tabs>
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
