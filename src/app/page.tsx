
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
import { PlusCircle, BookOpen, History, Globe, Coins } from 'lucide-react';
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

  const totalPendingPayout = useMemo(() => {
    return activeContracts.reduce((total, contract) => total + contract.reward, 0);
  }, [activeContracts]);


  const handleModalContractSubmit = useCallback((data: NewContractFormData) => {
    let hasFatalError = false;
    if (!data.contractNumber.trim()) {
      setTimeout(() => toast({ variant: "destructive", title: "Invalid Input", description: "Contract Number/ID cannot be empty." }), 0);
      hasFatalError = true; 
    }
    if (data.rewardK < 0) {
        setTimeout(() => toast({ variant: "destructive", title: "Invalid Input", description: "Reward cannot be negative." }), 0);
        hasFatalError = true;
    }
    if (data.destinationEntries.length === 0) {
      setTimeout(() => toast({ variant: "destructive", title: "Invalid Input", description: "At least one destination task must be added." }), 0);
      hasFatalError = true; 
    }

    if (hasFatalError) return; 

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

      if (taskGoods.length === 0 && entry.goods.some(g => g.productName.trim() || g.quantity > 0)) {
         setTimeout(() => toast({ variant: "warning", title: "No Valid Goods", description: `No valid goods processed for task ${entry.destination}. Ensure quantities are positive and names are not empty.` }), 0);
      }
      
      if (taskGoods.length === 0) return null; 


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
        reward: data.rewardK * 1000, 
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
    
    let taskDestination = ""; 
    setActiveContracts(prevContracts =>
      prevContracts.map(contract => {
        if (contract.id === contractId) {
          return {
            ...contract,
            destinationTasks: contract.destinationTasks.map(task => {
              if (task.id === taskId) {
                taskDestination = task.destination; 
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
    setTimeout(() => {
        if (taskDestination) { 
            toast({ title: "Good Added", description: `${goodData.quantity} SCU of ${goodData.productName} added to task for ${taskDestination}.` });
        }
    }, 0);
  }, [toast]);

const handleToggleTaskStatus = useCallback((contractId: string, taskId: string) => {
    let taskChangeDescription = "";
    let contractStatusChangeMessage: { title: string; description: string } | null = null;
    
    const nextActive = [...activeContracts];
    const nextCompleted = [...completedContracts];

    const contractIndexInActive = nextActive.findIndex(c => c.id === contractId);
    const contractIndexInCompleted = nextCompleted.findIndex(c => c.id === contractId);

    if (contractIndexInActive !== -1) { // Contract is currently active
        const contract = nextActive[contractIndexInActive];
        const taskIndex = contract.destinationTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const task = contract.destinationTasks[taskIndex];
            const newStatus = !task.isComplete;
            task.isComplete = newStatus; 
            taskChangeDescription = `Task for ${task.destination} (${contract.contractNumber}) marked as ${newStatus ? 'delivered' : 'pending'}.`;

            if (newStatus && contract.destinationTasks.every(t => t.isComplete)) {
                const [completedContract] = nextActive.splice(contractIndexInActive, 1);
                if (!nextCompleted.find(c => c.id === completedContract.id)) { // Avoid duplicates
                    nextCompleted.push(completedContract);
                }
                contractStatusChangeMessage = { title: "Contract Complete", description: `Contract ${completedContract.contractNumber} moved to Log Book.` };
            }
        }
    } else if (contractIndexInCompleted !== -1) { // Contract is currently completed
        const contract = nextCompleted[contractIndexInCompleted];
        const taskIndex = contract.destinationTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const task = contract.destinationTasks[taskIndex];
            task.isComplete = false; 
            taskChangeDescription = `Task for ${task.destination} (${contract.contractNumber}) marked as pending.`;

            const [reopenedContract] = nextCompleted.splice(contractIndexInCompleted, 1);
             if (!nextActive.find(c => c.id === reopenedContract.id)) { // Avoid duplicates
                nextActive.push(reopenedContract);
            }
            contractStatusChangeMessage = { title: "Contract Reopened", description: `Contract ${reopenedContract.contractNumber} moved back to Active Contracts.` };
        }
    }
    
    setActiveContracts(nextActive.sort((a,b) => a.contractNumber.localeCompare(b.contractNumber)));
    setCompletedContracts(nextCompleted.sort((a,b) => a.contractNumber.localeCompare(b.contractNumber)));

    setTimeout(() => {
        if (taskChangeDescription) {
            toast({ title: "Task Status Updated", description: taskChangeDescription });
        }
        if (contractStatusChangeMessage) {
            toast({ title: contractStatusChangeMessage.title, description: contractStatusChangeMessage.description });
        }
    }, 0);

}, [activeContracts, completedContracts, toast]);


const handleMarkDestinationTasksComplete = useCallback((destinationName: string) => {
    let anyTasksMarkedThisOperation = false;
    const contractsThatBecameCompleteMessages: Array<{ title: string; description: string }> = [];

    const nextActive = [...activeContracts];
    const nextCompleted = [...completedContracts];
    const newlyCompletedContractIdsFromThisOp = new Set<string>();

    // Update tasks in active contracts
    for (let i = 0; i < nextActive.length; i++) {
        const contract = nextActive[i];
        let tasksModifiedInThisContract = false;
        contract.destinationTasks.forEach(task => {
            if (task.destination === destinationName && !task.isComplete) {
                task.isComplete = true;
                tasksModifiedInThisContract = true;
                anyTasksMarkedThisOperation = true;
            }
        });

        if (tasksModifiedInThisContract && contract.destinationTasks.every(t => t.isComplete)) {
            newlyCompletedContractIdsFromThisOp.add(contract.id);
        }
    }
    
    // Move newly completed contracts
    const stillActive: ContractV2[] = [];
    nextActive.forEach(contract => {
        if (newlyCompletedContractIdsFromThisOp.has(contract.id)) {
            if (!nextCompleted.find(c => c.id === contract.id)) { // Avoid duplicates
                nextCompleted.push(contract);
                contractsThatBecameCompleteMessages.push({
                    title: "Contract Complete",
                    description: `Contract ${contract.contractNumber} moved to Log Book.`
                });
            }
        } else {
            stillActive.push(contract);
        }
    });
    
    setActiveContracts(stillActive.sort((a,b) => a.contractNumber.localeCompare(b.contractNumber)));
    setCompletedContracts(nextCompleted.sort((a,b) => a.contractNumber.localeCompare(b.contractNumber)));

    setTimeout(() => {
        contractsThatBecameCompleteMessages.forEach(msg => toast(msg));
        if (anyTasksMarkedThisOperation) {
             toast({ title: "Destination Tasks Updated", description: `Pending tasks for ${destinationName} marked as delivered.` });
        } else if (contractsThatBecameCompleteMessages.length === 0) { 
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
          
          <div className="lg:col-span-2 lg:sticky lg:top-28 space-y-8">
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
            
            <Card className="shadow-xl bg-card/90">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Coins className="mr-2 h-5 w-5 text-primary" />
                  Pending Payout
                </CardTitle>
                <CardDescription>Total reward from all active contracts.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {totalPendingPayout.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">aUEC</span>
                </p>
                 {activeContracts.length === 0 && <p className="text-sm text-muted-foreground mt-2">No active contracts.</p>}
              </CardContent>
            </Card>
            
            <CargoInventoryDisplay contracts={activeContracts} />
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
    
