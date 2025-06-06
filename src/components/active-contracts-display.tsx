
"use client";

import type React from 'react';
import type { ContractV2 } from '@/lib/types'; 
import { DestinationTaskCard } from './destination-task-card'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { FileText, PackageSearch, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ActiveContractsDisplayProps = {
  contracts: ContractV2[];
  onUpdateGoodQuantity: (contractId: string, taskId: string, goodId: string, newQuantity: number) => void;
  onRemoveGood: (contractId: string, taskId: string, goodId: string) => void;
  onAddGoodToTask: (contractId: string, taskId: string, goodData: { productName: string; quantity: number }) => void;
  onToggleTaskStatus: (contractId: string, taskId: string) => void;
  onOpenEditModal: (contract: ContractV2) => void;
  onAbandonContract?: (contractId: string) => void;
};

export const ActiveContractsDisplay: React.FC<ActiveContractsDisplayProps> = ({ 
  contracts, 
  onUpdateGoodQuantity, 
  onRemoveGood, 
  onAddGoodToTask,
  onToggleTaskStatus,
  onOpenEditModal,
  onAbandonContract,
}) => {
  
  if (!contracts || contracts.length === 0) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <PackageSearch className="mr-2 h-6 w-6 text-primary" /> Active Contracts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No active contracts. Log a new haul to get started!</p>
        </CardContent>
      </Card>
    );
  }

  const sortedContracts = [...contracts].sort((a, b) => a.contractNumber.localeCompare(b.contractNumber));
  
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <CardTitle className="text-xl flex items-center">
            <PackageSearch className="mr-2 h-6 w-6 text-primary" /> Active Contracts ({sortedContracts.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-4" defaultValue={sortedContracts.map(c => c.id)}>
          {sortedContracts.map((contract) => {
            const completedTasks = contract.destinationTasks.filter(t => t.isComplete).length;
            const totalTasks = contract.destinationTasks.length;
            const rewardFormatted = contract.reward.toLocaleString();
            return (
              <AccordionItem key={contract.id} value={contract.id} className="border bg-card/80 rounded-lg shadow-sm group">
                <AccordionTrigger className="p-4 hover:no-underline">
                  <div className="flex flex-col items-start text-left flex-grow gap-1">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">{contract.contractNumber}</span>
                    </div>
                    <div className="text-xs text-muted-foreground ml-8">
                       Reward: {rewardFormatted} aUEC
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      asChild 
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 mr-1 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        onOpenEditModal(contract);
                      }}
                      aria-label={`Edit contract ${contract.contractNumber}`}
                    >
                      <span>
                        <Pencil className="h-4 w-4" />
                      </span>
                    </Button>
                    
                    {onAbandonContract && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 mr-2 text-destructive hover:text-destructive/80"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Abandon contract ${contract.contractNumber}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Abandon Contract</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to abandon contract {contract.contractNumber}? 
                              This action cannot be undone and the contract will be permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={(e) => {
                                e.stopPropagation();
                                onAbandonContract(contract.id);
                              }}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Abandon
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    
                    <div className="text-sm text-muted-foreground ml-2 text-right flex-shrink-0">
                      {completedTasks}/{totalTasks} tasks complete
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0">
                  <div className="space-y-3">
                    {contract.destinationTasks.length > 0 ? (
                       contract.destinationTasks.sort((a,b) => a.destination.localeCompare(b.destination)).map(task => (
                        <DestinationTaskCard
                          key={task.id}
                          contractId={contract.id}
                          task={task}
                          onUpdateGoodQuantity={onUpdateGoodQuantity}
                          onRemoveGood={onRemoveGood}
                          onAddGoodToTask={onAddGoodToTask}
                          onToggleTaskStatus={onToggleTaskStatus}
                        />
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-2">No destination tasks for this contract.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

