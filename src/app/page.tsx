
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ActiveContractsDisplay } from '@/components/active-contracts-display';
import { CargoInventoryDisplay } from '@/components/cargo-inventory-display';
import type { ContractV2, DestinationTask, Good, NewContractFormData, ModalDestinationEntry, DestinationOverview, AggregatedGoodForDestination } from '@/lib/types';
import { SpaceHaulerLogo } from '@/components/space-hauler-logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddContractModal } from '@/components/add-contract-modal';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, BookOpen, History, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogBookDisplay } from '@/components/log-book-display';
import { DestinationsOverviewDisplay } from '@/components/destinations-overview-display';

export default function HomePage() {
  const [activeContracts, setActiveContracts] = useState<ContractV2[]>([]);
  const [completedContracts, setCompletedContracts] = useState<ContractV2[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const destinationsOverviewData = useMemo((): DestinationOverview[] => {
    const overviewMap = new Map<string, { goodsMap: Map<string, number>, taskRefs: Array<{ contractId: string; taskId: string }> }>();

    activeContracts.forEach(contract => {
      contract.destinationTasks.forEach(task => {
        if (!task.isComplete) {
          if (!overviewMap.has(task.destination)) {
            overviewMap.set(task.destination, { goodsMap: new Map(), taskRefs: [] });
          }
          const destEntry = overviewMap.get(task.destination)!;
          destEntry.taskRefs.push({ contractId: contract.id, taskId: task.id });
          
          task.goods.forEach(good => {
            destEntry.goodsMap.set(
              good.productName,
              (destEntry.goodsMap.get(good.productName) || 0) + good.quantity
            );
          });
        }
      });
    });

    return Array.from(overviewMap.entries()).map(([destinationName, data]) => ({
      destinationName,
      goods: Array.from(data.goodsMap.entries()).map(([productName, totalQuantity]) => ({
        productName,
        totalQuantity,
      })).sort((a,b) => a.productName.localeCompare(b.productName)),
      contributingTaskRefs: data.taskRefs,
    })).sort((a,b) => a.destinationName.localeCompare(b.destinationName));
  }, [activeContracts]);


  const handleModalContractSubmit = useCallback((data: NewContractFormData) => {
    let hasFatalError = false;
    if (!data.contractNumber.trim()) {
      setTimeout(() => toast({ variant: "destructive", title: "Invalid Input", description: "Contract Number/ID cannot be empty." }), 0);
      return; 
    }
    if (data.destinationEntries.length === 0) {
      setTimeout(() => toast({ variant: "destructive", title: "Invalid Input", description: "At least one destination task must be added." }), 0);
      return;
    }

    const newDestinationTasks: DestinationTask[] = data.destinationEntries.map(entry => {
      if (hasFatalError) return null; 

      if (!entry.destination.trim()) {
        setTimeout(() => toast({ variant: "destructive", title: "Invalid Input", description: `Destination cannot be empty for a task in contract ${data.contractNumber}.` }), 0);
        hasFatalError = true;
        return null;
      }
      if (entry.goods.length === 0) {
         setTimeout(() => toast({ variant: "destructive", title: "Invalid Input", description: `At least one good must be added to task for ${entry.destination} in contract ${data.contractNumber}.` }), 0);
        hasFatalError = true;
        return null;
      }
      
      const taskGoods: Good[] = entry.goods.map(good => {
        if (hasFatalError) return null;
        if (good.productName.trim() && good.quantity > 0) {
          return { id: crypto.randomUUID(), productName: good.productName, quantity: good.quantity };
        } else if (good.productName.trim() && good.quantity <= 0) {
           setTimeout(() => toast({ variant: "destructive", title: "Invalid Quantity", description: `Quantity for ${good.productName} (Task: ${entry.destination}) must be positive.`}), 0);
           hasFatalError = true;
        } else if (!good.productName.trim() && good.quantity > 0) {
           setTimeout(() => toast({ variant: "destructive", title: "Invalid Product Name", description: `Product name for an item (Task: ${entry.destination}) cannot be empty.`}), 0);
           hasFatalError = true;
        }
        return null;
      }).filter(g => g !== null) as Good[];

      if (hasFatalError) return null;
      if (taskGoods.length === 0 && entry.goods.length > 0) {
         setTimeout(() => toast({ variant: "warning", title: "No Valid Goods", description: `No valid goods processed for task ${entry.destination}. Ensure quantities are positive and names are not empty.` }), 0);
      }

      return {
        id: crypto.randomUUID(),
        destination: entry.destination,
        goods: taskGoods.sort((a,b) => a.productName.localeCompare(b.productName)),
        isComplete: false,
      };
    }).filter(task => task !== null) as DestinationTask[];

    if (hasFatalError) return; 
    if (newDestinationTasks.length === 0 && data.destinationEntries.length > 0) {
      setTimeout(() => toast({ variant: "warning", title: "No Tasks Processed", description: "No valid destination tasks were created. Please check all entries for errors." }), 0);
      return;
    }
    
    if (newDestinationTasks.length > 0) {
      const newContract: ContractV2 = {
        id: crypto.randomUUID(),
        contractNumber: data.contractNumber,
        description: "", 
        destinationTasks: newDestinationTasks.sort((a,b) => a.destination.localeCompare(b.destination)),
      };
      setActiveContracts(prev => [...prev, newContract].sort((a,b) => a.contractNumber.localeCompare(b.contractNumber)));
      setTimeout(() => toast({ title: "Contract Logged", description: `Contract ${data.contractNumber} with ${newDestinationTasks.length} task(s) added.` }), 0);
      setIsAddContractModalOpen(false); 
    } else if (data.destinationEntries.length > 0){
       setTimeout(() => toast({ variant: "warning", title: "No Tasks Processed", description: "Ensure entries are valid. No tasks added to the contract." }), 0);
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
                  .filter(good => good.quantity > 0) 
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
    setTimeout(() => toast({ title: "Quantity Updated", description: "Good quantity adjusted." }), 0);
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
    );
    setTimeout(() => toast({ title: "Good Removed", description: "Good removed from task." }), 0);
  }, [toast]);

  const handleAddGoodToTask = useCallback((contractId: string, taskId: string, goodData: { productName: string; quantity: number }) => {
    if (!goodData.productName.trim() || goodData.quantity <= 0) {
      setTimeout(() => toast({ variant: "destructive", title: "Invalid Input", description: "Product name cannot be empty and quantity must be positive." }), 0);
      return;
    }
    
    let taskDestination = ""; // To capture for the toast message
    setActiveContracts(prevContracts =>
      prevContracts.map(contract => {
        if (contract.id === contractId) {
          return {
            ...contract,
            destinationTasks: contract.destinationTasks.map(task => {
              if (task.id === taskId) {
                taskDestination = task.destination; // Capture for toast
                const existingGoodIndex = task.goods.findIndex(g => g.productName.toLowerCase() === goodData.productName.toLowerCase());
                let updatedGoods;
                if (existingGoodIndex > -1) {
                  updatedGoods = task.goods.map((g, index) =>
                    index === existingGoodIndex ? { ...g, quantity: g.quantity + goodData.quantity } : g
                  );
                } else {
                  const newGood: Good = { id: crypto.randomUUID(), productName: goodData.productName, quantity: goodData.quantity };
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
    // Defer toast until after state update cycle
    setTimeout(() => {
        if (taskDestination) { // Check if taskDestination was actually set
            toast({ title: "Good Added", description: `${goodData.quantity} SCU of ${goodData.productName} added to task for ${taskDestination}.` });
        }
    }, 0);
  }, [toast]);

  const handleToggleTaskStatus = useCallback((contractId: string, taskId: string) => {
    let taskDescriptionForToast = ""; // e.g. "Task for Terra marked as delivered"
    let contractNumberForToast: string | null = null;
    let movingToCompleted = false;
    let movingToActive = false;

    setActiveContracts(prevActive => {
        const contractIndex = prevActive.findIndex(c => c.id === contractId);
        if (contractIndex > -1) { // Contract is in active list
            const contract = prevActive[contractIndex];
            const taskIndex = contract.destinationTasks.findIndex(t => t.id === taskId);
            if (taskIndex > -1) {
                const task = contract.destinationTasks[taskIndex];
                const newStatus = !task.isComplete;
                taskDescriptionForToast = `Task for ${task.destination} marked as ${newStatus ? 'delivered' : 'pending'}.`;

                const updatedTasks = [...contract.destinationTasks];
                updatedTasks[taskIndex] = { ...task, isComplete: newStatus };
                const updatedContract = { ...contract, destinationTasks: updatedTasks };

                if (newStatus && updatedTasks.every(t => t.isComplete)) { // Task completed and contract is now fully complete
                    movingToCompleted = true;
                    contractNumberForToast = updatedContract.contractNumber;
                    setCompletedContracts(prevComp => 
                        [...prevComp, updatedContract].sort((a, b) => a.contractNumber.localeCompare(b.contractNumber))
                    );
                    return prevActive.filter(c => c.id !== contractId); // Remove from active
                }
                // Contract updated, stays active
                const newActiveList = [...prevActive];
                newActiveList[contractIndex] = updatedContract;
                return newActiveList;
            }
        }
        return prevActive; // No change to active contracts if not found here
    });

    setCompletedContracts(prevCompleted => {
        const contractIndex = prevCompleted.findIndex(c => c.id === contractId);
        if (contractIndex > -1) { // Contract is in completed list (must be reopening a task)
            const contract = prevCompleted[contractIndex];
            const taskIndex = contract.destinationTasks.findIndex(t => t.id === taskId);
            if (taskIndex > -1) {
                const task = contract.destinationTasks[taskIndex];
                 // If task was complete and we are toggling (so it becomes incomplete)
                if (task.isComplete) {
                    const newStatus = false; // Reopening
                    taskDescriptionForToast = `Task for ${task.destination} marked as ${newStatus ? 'delivered' : 'pending'}.`;
                    
                    const updatedTasks = [...contract.destinationTasks];
                    updatedTasks[taskIndex] = { ...task, isComplete: newStatus };
                    const updatedContract = { ...contract, destinationTasks: updatedTasks };
                    
                    movingToActive = true;
                    contractNumberForToast = updatedContract.contractNumber;
                    setActiveContracts(prevAct => 
                        [...prevAct, updatedContract].sort((a,b) => a.contractNumber.localeCompare(b.contractNumber))
                    );
                    return prevCompleted.filter(c => c.id !== contractId); // Remove from completed
                }
            }
        }
        return prevCompleted; // No change to completed contracts
    });
    
    setTimeout(() => {
        if (movingToCompleted && contractNumberForToast) {
            toast({ title: "Contract Complete", description: `Contract ${contractNumberForToast} moved to Log Book.`});
        }
        if (movingToActive && contractNumberForToast) {
            toast({ title: "Contract Reopened", description: `Contract ${contractNumberForToast} moved back to Active Contracts.`});
        }
        if (taskDescriptionForToast) {
            toast({ title: "Task Status Updated", description: taskDescriptionForToast });
        }
    }, 0);

}, [toast]);


const handleMarkDestinationTasksComplete = useCallback((destinationName: string) => {
    const contractsToMoveToCompleted: ContractV2[] = [];
    let anyTasksActuallyMarked = false;

    setActiveContracts(prevActive => {
        const updatedActiveContracts = prevActive.map(contract => {
            let tasksModifiedInThisContract = false;
            const newDestinationTasks = contract.destinationTasks.map(task => {
                if (task.destination === destinationName && !task.isComplete) {
                    tasksModifiedInThisContract = true;
                    anyTasksActuallyMarked = true;
                    return { ...task, isComplete: true };
                }
                return task;
            });

            if (tasksModifiedInThisContract) {
                const updatedContract = { ...contract, destinationTasks: newDestinationTasks };
                // Check if this contract is now complete
                if (updatedContract.destinationTasks.every(t => t.isComplete)) {
                    contractsToMoveToCompleted.push(updatedContract); // Collect for moving
                }
                return updatedContract; // Return updated contract (might be removed below if complete)
            }
            return contract;
        });

        // Filter out the contracts that were moved
        return updatedActiveContracts.filter(c => !contractsToMoveToCompleted.find(moved => moved.id === c.id));
    });

    if (contractsToMoveToCompleted.length > 0) {
        setCompletedContracts(prevCompleted => 
            [...prevCompleted, ...contractsToMoveToCompleted].sort((a,b) => a.contractNumber.localeCompare(b.contractNumber))
        );
        setTimeout(() => {
            contractsToMoveToCompleted.forEach(c => {
                toast({ title: "Contract Complete", description: `Contract ${c.contractNumber} moved to Log Book.`});
            });
        }, 0);
    }

    setTimeout(() => {
        if (anyTasksActuallyMarked) {
            toast({ title: "Destination Updated", description: `All pending tasks for ${destinationName} marked as delivered.`});
        } else {
            toast({ title: "No Changes", description: `No pending tasks found for ${destinationName}.`});
        }
    }, 0);

}, [toast]);


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
                <CardDescription>Log a new contract with all its destinations and goods.</CardDescription>
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
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="active">
                  <History className="mr-2 h-5 w-5" /> Active Contracts ({activeContracts.length})
                </TabsTrigger>
                <TabsTrigger value="destinations">
                  <Globe className="mr-2 h-5 w-5" /> Destinations ({destinationsOverviewData.length}) 
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
              <TabsContent value="destinations">
                <DestinationsOverviewDisplay
                  destinations={destinationsOverviewData}
                  onMarkComplete={handleMarkDestinationTasksComplete}
                />
              </TabsContent>
              <TabsContent value="logbook">
                 <LogBookDisplay 
                  contracts={completedContracts}
                  onToggleTaskStatus={handleToggleTaskStatus} 
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

    