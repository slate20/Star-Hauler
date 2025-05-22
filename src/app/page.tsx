
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ActiveContractsDisplay } from '@/components/active-contracts-display';
import { CargoInventoryDisplay } from '@/components/cargo-inventory-display';
import { DestinationsOverviewDisplay } from '@/components/destinations-overview-display';
import type { ContractV2, DestinationTask, Good, NewContractFormData, EditContractFormData, DestinationOverview } from '@/lib/types';
import { SpaceHaulerLogo } from '@/components/space-hauler-logo';
import { Button } from '@/components/ui/button';
import { AddContractModal } from '@/components/add-contract-modal';
import { EditContractModal } from '@/components/edit-contract-modal';
import { StopwatchDisplay } from '@/components/stopwatch-display';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, BookOpen, History, Globe, User, Coins } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogBookDisplay } from '@/components/log-book-display';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


const ACTIVE_CONTRACTS_STORAGE_KEY = 'spaceHauler_activeContracts_v2';
const COMPLETED_CONTRACTS_STORAGE_KEY = 'spaceHauler_completedContracts_v2';
const CREW_SIZE_STORAGE_KEY = 'spaceHauler_crewSize_v1';

export default function HomePage() {
  const [activeContracts, setActiveContracts] = useState<ContractV2[]>([]);
  const [completedContracts, setCompletedContracts] = useState<ContractV2[]>([]);
  const [crewSize, setCrewSize] = useState<number>(1);
  const [isClient, setIsClient] = useState(false);
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
  const [isEditContractModalOpen, setIsEditContractModalOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<ContractV2 | null>(null);
  const { toast } = useToast();

  // Stopwatch State
  const [stopwatchState, setStopwatchState] = useState<'stopped' | 'running'>('stopped');
  const [elapsedTimeInSeconds, setElapsedTimeInSeconds] = useState<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalAUECAtStopwatchStartRef = useRef<number>(0);
  const [sessionAUECPerHour, setSessionAUECPerHour] = useState<number | null>(null);
  const [sessionDurationInSeconds, setSessionDurationInSeconds] = useState<number | null>(null);
  const [sessionReward, setSessionReward] = useState<number | null>(null);
  const [isStopwatchAlertOpen, setIsStopwatchAlertOpen] = useState<boolean>(false);


  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load data from localStorage on initial client-side mount
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
        const storedCrewSize = localStorage.getItem(CREW_SIZE_STORAGE_KEY);
        if (storedCrewSize) {
          const parsedCrewSize = parseInt(storedCrewSize, 10);
          if (!isNaN(parsedCrewSize) && parsedCrewSize >= 1) {
            setCrewSize(parsedCrewSize);
          }
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
        setTimeout(() => toast({ variant: "destructive", title: "Load Error", description: "Could not load saved data." }),0);
      }
    }
  }, [isClient, toast]);

  // Save active contracts to localStorage
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(ACTIVE_CONTRACTS_STORAGE_KEY, JSON.stringify(activeContracts));
      } catch (error) {
        console.error("Error saving active contracts to localStorage:", error);
        setTimeout(() => toast({ variant: "destructive", title: "Save Error", description: "Could not save active contracts." }), 0);
      }
    }
  }, [activeContracts, isClient, toast]);

  // Save completed contracts to localStorage
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(COMPLETED_CONTRACTS_STORAGE_KEY, JSON.stringify(completedContracts));
      } catch (error) {
        console.error("Error saving completed contracts to localStorage:", error);
         setTimeout(() => toast({ variant: "destructive", title: "Save Error", description: "Could not save completed contracts." }), 0);
      }
    }
  }, [completedContracts, isClient, toast]);

  // Save crew size to localStorage
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(CREW_SIZE_STORAGE_KEY, String(crewSize));
      } catch (error) {
        console.error("Error saving crew size to localStorage:", error);
        setTimeout(() => toast({ variant: "destructive", title: "Save Error", description: "Could not save crew size." }), 0);
      }
    }
  }, [crewSize, isClient, toast]);


  const destinationsOverviewData = useMemo((): DestinationOverview[] => {
    const overviewMap = new Map<string, { goodsMap: Map<string, number>, contributingTaskRefs: Array<{ contractId: string; taskId: string }> }>();

    activeContracts.forEach(contract => {
      contract.destinationTasks.forEach(task => {
        if (!task.isComplete) {
          if (!overviewMap.has(task.destination)) {
            overviewMap.set(task.destination, { goodsMap: new Map(), contributingTaskRefs: [] });
          }
          const destEntry = overviewMap.get(task.destination)!;
          destEntry.contributingTaskRefs.push({ contractId: contract.id, taskId: task.id });
          
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
      contributingTaskRefs: data.contributingTaskRefs,
    })).sort((a,b) => a.destinationName.localeCompare(b.destinationName));
  }, [activeContracts]);

  const totalPendingPayout = useMemo(() => {
    return activeContracts.reduce((total, contract) => total + contract.reward, 0);
  }, [activeContracts]);

  const payoutPerCrewMember = useMemo(() => {
    if (crewSize < 1 || totalPendingPayout === 0) return 0;
    return Math.floor(totalPendingPayout / crewSize);
  }, [totalPendingPayout, crewSize]);


  const handleModalContractSubmit = useCallback((data: NewContractFormData) => {
    const newDestinationTasks: DestinationTask[] = data.destinationEntries.flatMap(entry => {
      if (!entry.destination.trim() || entry.goods.length === 0) {
        return [];
      }
      const taskGoods: Good[] = entry.goods.map(good => ({
        id: crypto.randomUUID(),
        productName: good.productName,
        quantity: good.quantity
      })).filter(g => g.productName.trim() && g.quantity > 0)
         .sort((a,b) => a.productName.localeCompare(b.productName));

      if (taskGoods.length === 0) return [];

      return [{
        id: crypto.randomUUID(),
        destination: entry.destination,
        goods: taskGoods,
        isComplete: false,
      }];
    });

    if (newDestinationTasks.length === 0) {
       setTimeout(() => toast({ variant: "destructive", title: "Input Error", description: "Contract must have at least one valid destination task with goods." }), 0);
      return;
    }
    
    const newContract: ContractV2 = {
      id: crypto.randomUUID(),
      contractNumber: data.contractNumber,
      reward: data.rewardK * 1000, 
      destinationTasks: newDestinationTasks.sort((a,b) => a.destination.localeCompare(b.destination)),
    };

    setActiveContracts(prev => [...prev, newContract].sort((a,b) => a.contractNumber.localeCompare(b.contractNumber)));
    setTimeout(() => toast({ title: "Contract Logged", description: `Contract ${data.contractNumber} with ${newDestinationTasks.length} task(s) added.` }), 0);
    setIsAddContractModalOpen(false); 
    
  }, [toast]);

  const handleOpenEditModal = useCallback((contract: ContractV2) => {
    setContractToEdit(contract);
    setIsEditContractModalOpen(true);
  }, []);

  const handleContractUpdate = useCallback((updatedData: EditContractFormData) => {
    setActiveContracts(prevContracts =>
      prevContracts.map(c =>
        c.id === updatedData.id
          ? { ...c, contractNumber: updatedData.contractNumber, reward: updatedData.rewardK * 1000 }
          : c
      ).sort((a,b) => a.contractNumber.localeCompare(b.contractNumber))
    );
    setTimeout(() => {
        toast({ title: "Contract Updated", description: `Contract ${updatedData.contractNumber} has been updated.` });
    }, 0);
    setIsEditContractModalOpen(false);
    setContractToEdit(null);
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
    let contractStatusChangeTitle: string | null = null;
    let contractStatusChangeDescription: string | null = null;
    let contractMoved = false;

    let currentActiveContracts = activeContracts;
    let currentCompletedContracts = completedContracts;

    // Try to find and update in active contracts
    const activeContractIndex = currentActiveContracts.findIndex(c => c.id === contractId);
    if (activeContractIndex !== -1) {
        const contractToUpdate = { ...currentActiveContracts[activeContractIndex] };
        contractToUpdate.destinationTasks = contractToUpdate.destinationTasks.map(task => {
            if (task.id === taskId) {
                const newStatus = !task.isComplete;
                taskChangeDescription = `Task for ${task.destination} (${contractToUpdate.contractNumber}) marked as ${newStatus ? 'delivered' : 'pending'}.`;
                return { ...task, isComplete: newStatus };
            }
            return task;
        });

        currentActiveContracts = [
            ...currentActiveContracts.slice(0, activeContractIndex),
            contractToUpdate,
            ...currentActiveContracts.slice(activeContractIndex + 1),
        ];

        if (contractToUpdate.destinationTasks.every(t => t.isComplete)) {
            // Move to completed
            if (!currentCompletedContracts.find(compC => compC.id === contractToUpdate.id)) {
                currentCompletedContracts = [...currentCompletedContracts, contractToUpdate].sort((a, b) => a.contractNumber.localeCompare(b.contractNumber));
            }
            currentActiveContracts = currentActiveContracts.filter(c => c.id !== contractId).sort((a,b) => a.contractNumber.localeCompare(b.contractNumber));
            contractStatusChangeTitle = "Contract Complete";
            contractStatusChangeDescription = `Contract ${contractToUpdate.contractNumber} moved to Log Book.`;
            contractMoved = true;
        }
    } else {
        // Try to find and update in completed contracts (for reopening)
        const completedContractIndex = currentCompletedContracts.findIndex(c => c.id === contractId);
        if (completedContractIndex !== -1) {
            const contractToUpdate = { ...currentCompletedContracts[completedContractIndex] };
            let taskMadePending = false;
            contractToUpdate.destinationTasks = contractToUpdate.destinationTasks.map(task => {
                if (task.id === taskId) {
                    const newStatus = !task.isComplete; // Should be false if reopening
                    if (!newStatus) taskMadePending = true;
                    taskChangeDescription = `Task for ${task.destination} (${contractToUpdate.contractNumber}) marked as ${newStatus ? 'delivered' : 'pending'}.`;
                    return { ...task, isComplete: newStatus };
                }
                return task;
            });

            if (taskMadePending) { // If a task was made pending, move contract back to active
                if (!currentActiveContracts.find(actC => actC.id === contractToUpdate.id)) {
                    currentActiveContracts = [...currentActiveContracts, contractToUpdate].sort((a, b) => a.contractNumber.localeCompare(b.contractNumber));
                }
                currentCompletedContracts = currentCompletedContracts.filter(c => c.id !== contractId).sort((a,b) => a.contractNumber.localeCompare(b.contractNumber));
                contractStatusChangeTitle = "Contract Reopened";
                contractStatusChangeDescription = `Contract ${contractToUpdate.contractNumber} moved back to Active Contracts.`;
                contractMoved = true;
            } else { // If no task was made pending (e.g. toggling a complete task to complete again), just update it in completed.
                 currentCompletedContracts = [
                    ...currentCompletedContracts.slice(0, completedContractIndex),
                    contractToUpdate,
                    ...currentCompletedContracts.slice(completedContractIndex + 1),
                ].sort((a,b) => a.contractNumber.localeCompare(b.contractNumber));
            }
        }
    }
    
    setActiveContracts(currentActiveContracts);
    setCompletedContracts(currentCompletedContracts);

    setTimeout(() => {
        if (taskChangeDescription) {
            toast({ title: "Task Status Updated", description: taskChangeDescription });
        }
        if (contractStatusChangeTitle && contractStatusChangeDescription && contractMoved) {
            toast({ title: contractStatusChangeTitle, description: contractStatusChangeDescription });
        }
    }, 0);
}, [activeContracts, completedContracts, toast]);


const handleMarkDestinationTasksComplete = useCallback((destinationName: string) => {
    let anyTasksMarkedThisOperation = false;
    const contractsThatBecameCompleteMessages: Array<{ title: string; description: string }> = [];
    
    let nextActiveContracts = [...activeContracts];
    let nextCompletedContracts = [...completedContracts];
    
    const stillActive: ContractV2[] = [];
    const nowCompleted: ContractV2[] = [];

    nextActiveContracts.forEach(contract => {
        let tasksModifiedInThisContract = false;
        const newDestinationTasks = contract.destinationTasks.map(task => {
            if (task.destination === destinationName && !task.isComplete) {
                tasksModifiedInThisContract = true;
                anyTasksMarkedThisOperation = true;
                return { ...task, isComplete: true };
            }
            return task;
        });

        const updatedContract = { ...contract, destinationTasks: newDestinationTasks };

        if (tasksModifiedInThisContract) {
            if (updatedContract.destinationTasks.every(t => t.isComplete)) {
                 if (!nextCompletedContracts.find(c => c.id === updatedContract.id) && !nowCompleted.find(c => c.id === updatedContract.id)) {
                    nowCompleted.push(updatedContract);
                    contractsThatBecameCompleteMessages.push({
                        title: "Contract Complete",
                        description: `Contract ${updatedContract.contractNumber} moved to Log Book.`
                    });
                }
            } else {
                stillActive.push(updatedContract);
            }
        } else {
            stillActive.push(contract); // No changes to this contract's tasks for the destination
        }
    });
    
    nextCompletedContracts = [...nextCompletedContracts, ...nowCompleted].filter((value, index, self) =>
        index === self.findIndex((t) => (t.id === value.id))
    ).sort((a, b) => a.contractNumber.localeCompare(b.contractNumber));
    
    setActiveContracts(stillActive.sort((a, b) => a.contractNumber.localeCompare(b.contractNumber)));
    setCompletedContracts(nextCompletedContracts);

    setTimeout(() => {
        contractsThatBecameCompleteMessages.forEach(msg => toast(msg));
        if (anyTasksMarkedThisOperation) {
             toast({ title: "Destination Tasks Updated", description: `Pending tasks for ${destinationName} marked as delivered.` });
        } else if (contractsThatBecameCompleteMessages.length === 0) { // Only show "No Changes" if no other toasts fired for this op
            toast({ title: "No Changes", description: `No pending tasks found for ${destinationName}.` });
        }
    }, 0);

}, [activeContracts, completedContracts, toast]);

  const handleCrewSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newSize = parseInt(event.target.value, 10);
    if (isNaN(newSize) || newSize < 1) {
      newSize = 1; 
    }
    setCrewSize(newSize);
  };

  // Stopwatch Timer Effect
  useEffect(() => {
    if (stopwatchState === 'running') {
      timerIntervalRef.current = setInterval(() => {
        setElapsedTimeInSeconds(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [stopwatchState]);

  const calculateAndSetSessionStats = useCallback(() => {
    const currentTotalCompletedReward = completedContracts.reduce((sum, c) => sum + c.reward, 0);
    const rewardForSession = Math.max(0, currentTotalCompletedReward - totalAUECAtStopwatchStartRef.current);

    setSessionReward(rewardForSession);
    setSessionDurationInSeconds(elapsedTimeInSeconds);

    if (elapsedTimeInSeconds > 0 && rewardForSession > 0) {
      const auecPerHourCalc = (rewardForSession / elapsedTimeInSeconds) * 3600;
      setSessionAUECPerHour(auecPerHourCalc);
      setTimeout(() => toast({ title: "Session Complete!", description: `Earned ${rewardForSession.toLocaleString()} aUEC. Rate: ${Math.round(auecPerHourCalc).toLocaleString()} aUEC/hr.` }), 0);
    } else if (rewardForSession > 0) {
      setSessionAUECPerHour(0); 
      setTimeout(() => toast({ title: "Session Complete!", description: `Earned ${rewardForSession.toLocaleString()} aUEC. Duration too short for rate calculation.` }), 0);
    } else {
      setSessionAUECPerHour(0); 
      setTimeout(() => toast({ title: "Session Complete", description: "No new aUEC recorded for this session." }), 0);
    }
  }, [completedContracts, elapsedTimeInSeconds, toast]);


  const handleStartStopwatch = useCallback(() => {
    setStopwatchState('running');
    setElapsedTimeInSeconds(0);
    setSessionAUECPerHour(null);
    setSessionDurationInSeconds(null);
    setSessionReward(null);
    totalAUECAtStopwatchStartRef.current = completedContracts.reduce((sum, c) => sum + c.reward, 0);
    setTimeout(() => toast({ title: "Stopwatch Started", description: "Hauling session tracking initiated." }),0);
  }, [completedContracts, toast]);

  const handleStopStopwatch = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setStopwatchState('stopped');

    const hasIncompleteActiveTasks = activeContracts.some(c => c.destinationTasks.some(t => !t.isComplete));

    if (hasIncompleteActiveTasks) {
      setIsStopwatchAlertOpen(true);
    } else {
      calculateAndSetSessionStats();
    }
  }, [activeContracts, calculateAndSetSessionStats]);

  const handleResetStopwatch = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setStopwatchState('stopped');
    setElapsedTimeInSeconds(0);
    setSessionAUECPerHour(null);
    setSessionDurationInSeconds(null);
    setSessionReward(null);
    totalAUECAtStopwatchStartRef.current = 0;
     setTimeout(() => toast({ title: "Stopwatch Reset" }), 0);
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
      <header className="py-3 px-4 md:px-8 border-b border-border shadow-md sticky top-0 bg-background/90 backdrop-blur-md z-50">
        <div className="container mx-auto flex justify-between items-center gap-4">
          <SpaceHaulerLogo />
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-wrap justify-end">
             <div className="text-xs sm:text-sm text-right">
               <p className="font-semibold text-primary">
                 {totalPendingPayout.toLocaleString()} <span className="text-xs text-muted-foreground">aUEC Total</span>
               </p>
               {activeContracts.length > 0 && crewSize > 1 && (
                 <p className="text-xs text-accent">
                   ({payoutPerCrewMember.toLocaleString()} aUEC/crew)
                 </p>
               )}
             </div>
             <div className="flex items-center gap-1 sm:gap-2">
               <Label htmlFor="crewSizeInputHeader" className="text-xs sm:text-sm whitespace-nowrap">Crew:</Label>
               <Input
                 id="crewSizeInputHeader"
                 type="number"
                 value={crewSize}
                 onChange={handleCrewSizeChange}
                 min="1"
                 className="w-12 sm:w-14 h-8 text-xs sm:text-sm"
               />
             </div>
             <StopwatchDisplay
                elapsedTimeInSeconds={elapsedTimeInSeconds}
                stopwatchState={stopwatchState}
                onStart={handleStartStopwatch}
                onStop={handleStopStopwatch}
                onReset={handleResetStopwatch}
                sessionAUECPerHour={sessionAUECPerHour}
                sessionDurationInSeconds={sessionDurationInSeconds}
                sessionReward={sessionReward}
              />
           </div>
         </div>
       </header>
      
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 md:gap-8 items-start">
          
          <div className="lg:col-span-2 lg:sticky lg:top-28 space-y-6 md:space-y-8"> 
            <Button onClick={() => setIsAddContractModalOpen(true)} className="w-full text-base py-3">
              <PlusCircle className="mr-2 h-5 w-5" />
              Log New Contract
            </Button>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <Tabs defaultValue="active" className="w-full flex flex-col">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                <TabsTrigger value="active" className="text-xs sm:text-sm py-1.5 sm:py-2.5">
                  <History className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Active ({activeContracts.length})
                </TabsTrigger>
                <TabsTrigger value="destinations" className="text-xs sm:text-sm py-1.5 sm:py-2.5">
                  <Globe className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Destinations ({destinationsOverviewData.length}) 
                </TabsTrigger>
                <TabsTrigger value="logbook" className="text-xs sm:text-sm py-1.5 sm:py-2.5">
                  <BookOpen className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Log Book ({completedContracts.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="w-full mt-6">
                <ActiveContractsDisplay 
                  contracts={activeContracts} 
                  onUpdateGoodQuantity={handleUpdateGoodQuantity}
                  onRemoveGood={handleRemoveGood}
                  onAddGoodToTask={handleAddGoodToTask}
                  onToggleTaskStatus={handleToggleTaskStatus}
                  onOpenEditModal={handleOpenEditModal}
                />
              </TabsContent>
              <TabsContent value="destinations" className="w-full mt-6">
                <DestinationsOverviewDisplay
                  destinations={destinationsOverviewData}
                  onMarkComplete={handleMarkDestinationTasksComplete}
                />
              </TabsContent>
              <TabsContent value="logbook" className="w-full mt-6">
                 <LogBookDisplay 
                  contracts={completedContracts}
                  onToggleTaskStatus={handleToggleTaskStatus} 
                 />
              </TabsContent>
            </Tabs>
            <CargoInventoryDisplay contracts={activeContracts} />
          </div>
        </div>
      </main>
      
      <AddContractModal
        isOpen={isAddContractModalOpen}
        onOpenChange={setIsAddContractModalOpen}
        onContractSubmit={handleModalContractSubmit}
      />

      <EditContractModal
        isOpen={isEditContractModalOpen}
        onOpenChange={setIsEditContractModalOpen}
        onContractUpdate={handleContractUpdate}
        contractToEdit={contractToEdit}
      />

      <AlertDialog open={isStopwatchAlertOpen} onOpenChange={setIsStopwatchAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Incomplete Active Tasks</AlertDialogTitle>
            <AlertDialogDescription>
              You have active contracts with tasks not yet delivered. These will not be included in this session's aUEC/hr calculation. Proceed anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setIsStopwatchAlertOpen(false);
              calculateAndSetSessionStats();
            }}>
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <footer className="text-center p-6 text-muted-foreground text-sm border-t border-border mt-12">
        Space Hauler &copy; {new Date().getFullYear()} | Managing Galactic Contracts.
      </footer>
    </div>
  );
}
    

    