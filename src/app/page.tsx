
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

const ACTIVE_CONTRACTS_STORAGE_KEY = 'spaceHauler_activeContracts_v2';
const COMPLETED_CONTRACTS_STORAGE_KEY = 'spaceHauler_completedContracts_v2';

export default function HomePage() {
  const [activeContracts, setActiveContracts] = useState<ContractV2[]>([]);
  const [completedContracts, setCompletedContracts] = useState<ContractV2[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load contracts from localStorage on initial client-side mount
  useEffect(() => {
    if (isClient) {
      try {
        const storedActiveContracts = localStorage.getItem(ACTIVE_CONTRACTS_STORAGE_KEY);
        if (storedActiveContracts) {
          setActiveContracts(JSON.parse(storedActiveContracts));
        }
        const storedCompletedContracts = localStorage.getItem(COMPLETED_CONTRACTS_STORAGE_KEY);
        if (storedCompletedContracts) {
          setCompletedContracts(JSON.parse(storedCompletedContracts));
        }
      } catch (error) {
        console.error("Error loading contracts from localStorage:", error);
        toast({ variant: "destructive", title: "Load Error", description: "Could not load saved contracts." });
      }
    }
  }, [isClient, toast]);

  // Save active contracts to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(ACTIVE_CONTRACTS_STORAGE_KEY, JSON.stringify(activeContracts));
      } catch (error) {
        console.error("Error saving active contracts to localStorage:", error);
        toast({ variant: "destructive", title: "Save Error", description: "Could not save active contracts." });
      }
    }
  }, [activeContracts, isClient, toast]);

  // Save completed contracts to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(COMPLETED_CONTRACTS_STORAGE_KEY, JSON.stringify(completedContracts));
      } catch (error) {
        console.error("Error saving completed contracts to localStorage:", error);
        toast({ variant: "destructive", title: "Save Error", description: "Could not save completed contracts." });
      }
    }
  }, [completedContracts, isClient, toast]);


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
      hasFatalError = true; // Set flag to prevent further processing
    }
    if (data.destinationEntries.length === 0) {
      setTimeout(() => toast({ variant: "destructive", title: "Invalid Input", description: "At least one destination task must be added." }), 0);
      hasFatalError = true; 
    }
    if (data.rewardK < 0) {
      setTimeout(() => toast({ variant: "destructive", title: "Invalid Input", description: "Reward cannot be negative." }), 0);
      hasFatalError = true;
    }

    if (hasFatalError) return; // Exit if basic validation failed

    const newDestinationTasks: DestinationTask[] = data.destinationEntries.map(entry => {
      if (hasFatalError) return null; // Stop processing if an error was found in a previous task

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
        // Case where both are empty/invalid but not caught above, effectively skipping it
        return null;
      }).filter(g => g !== null) as Good[]; // Filter out nulls from invalid goods

      if (hasFatalError) return null; // Stop if goods processing had an error

      // This condition means some goods were defined in the form, but none were valid
      if (taskGoods.length === 0 && entry.goods.some(g => g.productName.trim() || g.quantity > 0)) {
         setTimeout(() => toast({ variant: "warning", title: "No Valid Goods", description: `No valid goods processed for task ${entry.destination}. Ensure quantities are positive and names are not empty.` }), 0);
         // This might not be a fatal error for the whole contract if other tasks are okay,
         // but this specific task won't be created.
      }
      
      if (taskGoods.length === 0) return null; // If no goods for this task, don't create the task


      return {
        id: crypto.randomUUID(),
        destination: entry.destination,
        goods: taskGoods.sort((a,b) => a.productName.localeCompare(b.productName)),
        isComplete: false,
      };
    }).filter(task => task !== null) as DestinationTask[]; // Filter out null tasks (those with errors or no valid goods)

    if (hasFatalError) return; // If any fatal error occurred during task/good mapping, stop.
    
    // If all tasks were invalid (e.g., all destinations had no valid goods)
    if (newDestinationTasks.length === 0 && data.destinationEntries.length > 0) {
      setTimeout(() => toast({ variant: "warning", title: "No Tasks Processed", description: "No valid destination tasks were created. Please check all entries for errors." }), 0);
      return;
    }
    
    if (newDestinationTasks.length > 0) {
      const newContract: ContractV2 = {
        id: crypto.randomUUID(),
        contractNumber: data.contractNumber,
        reward: data.rewardK * 1000, // Store full reward value
        description: "", // Can be added later or via a field
        destinationTasks: newDestinationTasks.sort((a,b) => a.destination.localeCompare(b.destination)),
      };
      setActiveContracts(prev => [...prev, newContract].sort((a,b) => a.contractNumber.localeCompare(b.contractNumber)));
      setTimeout(() => toast({ title: "Contract Logged", description: `Contract ${data.contractNumber} with ${newDestinationTasks.length} task(s) added.` }), 0);
      setIsAddContractModalOpen(false); // Close modal on successful submission
    } else if (data.destinationEntries.length > 0){ // This case implies entries existed but none were valid enough to create tasks
       setTimeout(() => toast({ variant: "warning", title: "No Tasks Processed", description: "Ensure entries are valid. No tasks added to the contract." }), 0);
    }
    // If data.destinationEntries was empty to begin with, it was caught by the initial check.
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
                  .filter(good => good.quantity > 0) // Remove if quantity is 0 or less
                  .sort((a,b) => a.productName.localeCompare(b.productName));
                
                // If this makes the task have no goods, the task itself isn't removed here,
                // but an empty goods list is valid. Further logic could remove empty tasks if desired.
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
                // As above, task remains even if goods list becomes empty.
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
    
    let taskDestination = ""; // To show in toast
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
                  // Good exists, update its quantity
                  updatedGoods = task.goods.map((g, index) =>
                    index === existingGoodIndex ? { ...g, quantity: g.quantity + goodData.quantity } : g
                  );
                } else {
                  // Good does not exist, add new good
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
    setTimeout(() => {
        if (taskDestination) { // Only show toast if a task was actually found and updated
            toast({ title: "Good Added", description: `${goodData.quantity} SCU of ${goodData.productName} added to task for ${taskDestination}.` });
        }
    }, 0);
  }, [toast]);

const handleToggleTaskStatus = useCallback((contractId: string, taskId: string) => {
    let taskChangeDescription = "";
    let contractStatusChange: { title: string; description: string } | null = null;
    
    let nextActiveContracts = [...activeContracts];
    let nextCompletedContracts = [...completedContracts];

    const contractIndexInActive = nextActiveContracts.findIndex(c => c.id === contractId);
    const contractIndexInCompleted = nextCompletedContracts.findIndex(c => c.id === contractId);

    if (contractIndexInActive !== -1) { // Contract is currently active
        const contract = nextActiveContracts[contractIndexInActive];
        const taskIndex = contract.destinationTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const task = contract.destinationTasks[taskIndex];
            const newStatus = !task.isComplete;
            task.isComplete = newStatus; // Mutate the task status
            taskChangeDescription = `Task for ${task.destination} (${contract.contractNumber}) marked as ${newStatus ? 'delivered' : 'pending'}.`;

            // Check if the entire contract is now complete
            if (contract.destinationTasks.every(t => t.isComplete)) {
                const [completedContract] = nextActiveContracts.splice(contractIndexInActive, 1);
                if (!nextCompletedContracts.find(c => c.id === completedContract.id)) {
                    nextCompletedContracts.push(completedContract);
                }
                contractStatusChange = { title: "Contract Complete", description: `Contract ${completedContract.contractNumber} moved to Log Book.` };
            }
        }
    } else if (contractIndexInCompleted !== -1) { // Contract is currently completed
        const contract = nextCompletedContracts[contractIndexInCompleted];
        const taskIndex = contract.destinationTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const task = contract.destinationTasks[taskIndex];
            // If a task in a completed contract is toggled, it becomes pending
            task.isComplete = false; 
            taskChangeDescription = `Task for ${task.destination} (${contract.contractNumber}) marked as pending.`;

            // Contract is no longer complete, move it back to active
            const [reopenedContract] = nextCompletedContracts.splice(contractIndexInCompleted, 1);
            if (!nextActiveContracts.find(c => c.id === reopenedContract.id)) {
                 nextActiveContracts.push(reopenedContract);
            }
            contractStatusChange = { title: "Contract Reopened", description: `Contract ${reopenedContract.contractNumber} moved back to Active Contracts.` };
        }
    }
    
    setActiveContracts(nextActiveContracts.sort((a,b) => a.contractNumber.localeCompare(b.contractNumber)));
    setCompletedContracts(nextCompletedContracts.sort((a,b) => a.contractNumber.localeCompare(b.contractNumber)));

    setTimeout(() => {
        if (taskChangeDescription) {
            toast({ title: "Task Status Updated", description: taskChangeDescription });
        }
        if (contractStatusChange) {
            toast({ title: contractStatusChange.title, description: contractStatusChange.description });
        }
    }, 0);

}, [activeContracts, completedContracts, toast]);


const handleMarkDestinationTasksComplete = useCallback((destinationName: string) => {
    let anyTasksMarkedThisOperation = false;
    const contractsThatBecameCompleteMessages: Array<{ title: string; description: string }> = [];

    const updatedActiveContracts = activeContracts.map(contract => {
        let tasksModifiedInThisContract = false;
        const newDestinationTasks = contract.destinationTasks.map(task => {
            if (task.destination === destinationName && !task.isComplete) {
                tasksModifiedInThisContract = true;
                anyTasksMarkedThisOperation = true;
                return { ...task, isComplete: true };
            }
            return task;
        });

        if (tasksModifiedInThisContract) {
            return { ...contract, destinationTasks: newDestinationTasks.sort((a,b) => a.destination.localeCompare(b.destination)) };
        }
        return contract;
    });
    
    let nextActive = [...updatedActiveContracts];
    let nextCompleted = [...completedContracts];

    const newlyCompletedContractsFromThisOp: ContractV2[] = [];

    nextActive = nextActive.filter(contract => {
        if (contract.destinationTasks.every(t => t.isComplete)) {
            // Check if it was modified in this operation (i.e., if any of its tasks for destinationName were marked)
            // This is a bit indirect, but we rely on the fact that `updatedActiveContracts` contains the latest state.
            const originalContract = activeContracts.find(ac => ac.id === contract.id);
            const tasksForDest = originalContract?.destinationTasks.filter(t => t.destination === destinationName && !t.isComplete) || [];
            if (tasksForDest.length > 0) { // It had pending tasks for this dest, so it was affected by this op
                 if (!nextCompleted.find(c => c.id === contract.id)) { // Ensure not already in completed
                    newlyCompletedContractsFromThisOp.push(contract);
                 }
            }
            return false; // Remove from active
        }
        return true; // Keep in active
    });
    
    newlyCompletedContractsFromThisOp.forEach(ntc => {
        if (!nextCompleted.find(cc => cc.id === ntc.id)) {
            nextCompleted.push(ntc);
            contractsThatBecameCompleteMessages.push({
                title: "Contract Complete",
                description: `Contract ${ntc.contractNumber} moved to Log Book.`
            });
        }
    });
    
    setActiveContracts(nextActive.sort((a,b) => a.contractNumber.localeCompare(b.contractNumber)));
    setCompletedContracts(nextCompleted.sort((a,b) => a.contractNumber.localeCompare(b.contractNumber)));

    setTimeout(() => {
        contractsThatBecameCompleteMessages.forEach(msg => toast(msg));
        if (anyTasksMarkedThisOperation) {
             toast({ title: "Destination Tasks Updated", description: `Pending tasks for ${destinationName} marked as delivered.` });
        } else if (contractsThatBecameCompleteMessages.length === 0) { // Only if no contracts became complete AND no tasks were marked
            toast({ title: "No Changes", description: `No pending tasks found for ${destinationName}.` });
        }
    }, 0);

}, [activeContracts, completedContracts, toast]);


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
    
