
"use client";

import type React from 'react';
import type { ContractV2 } from '@/lib/types';
import { DestinationTaskCard } from './destination-task-card'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { BookOpen, FileText, Trash2, X } from 'lucide-react';
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

type LogBookDisplayProps = {
  contracts: ContractV2[];
  onToggleTaskStatus: (contractId: string, taskId: string) => void; // To allow reopening
  onDeleteContract?: (contractId: string) => void; // To delete a single contract
  onClearLogBook?: () => void; // To clear the entire log book
};

export const LogBookDisplay: React.FC<LogBookDisplayProps> = ({ 
  contracts,
  onToggleTaskStatus,
  onDeleteContract,
  onClearLogBook,
}) => {
  
  if (!contracts || contracts.length === 0) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <BookOpen className="mr-2 h-6 w-6 text-primary" /> Log Book
            </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No completed contracts yet.</p>
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
                <BookOpen className="mr-2 h-6 w-6 text-primary" /> Log Book ({sortedContracts.length} contracts)
            </CardTitle>
            
            {onClearLogBook && sortedContracts.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:text-destructive/80 border-destructive/50 hover:border-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Log Book
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Log Book</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to clear the entire log book? This will permanently delete all {sortedContracts.length} completed contracts.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={onClearLogBook}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-4">
          {sortedContracts.map((contract) => {
            const completedTasks = contract.destinationTasks.filter(t => t.isComplete).length;
            const totalTasks = contract.destinationTasks.length;
            const rewardFormatted = contract.reward.toLocaleString();
            return (
              <AccordionItem key={contract.id} value={contract.id} className="border bg-card/70 rounded-lg shadow-sm data-[state=open]:bg-card/80">
                <AccordionTrigger className="p-4 hover:no-underline">
                  <div className="flex flex-col items-start text-left flex-grow gap-1">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-green-500" />
                      <span className="font-semibold text-lg">{contract.contractNumber}</span>
                    </div>
                    <div className="text-xs text-muted-foreground ml-8">
                       Reward: {rewardFormatted} aUEC
                    </div>
                  </div>
                  <div className="flex items-center">
                    {onDeleteContract && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 mr-2 text-destructive hover:text-destructive/80"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Delete contract ${contract.contractNumber} from log book`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete from Log Book</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete contract {contract.contractNumber} from the log book? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteContract(contract.id);
                              }}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <div className="text-sm text-green-400 ml-2 text-right flex-shrink-0">
                      {completedTasks}/{totalTasks} tasks delivered
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
                          onUpdateGoodQuantity={() => { /* No-op: Read-only in log book */ }}
                          onRemoveGood={() => { /* No-op: Read-only in log book */ }}
                          onAddGoodToTask={() => { /* No-op: Read-only in log book */ }}
                          onToggleTaskStatus={onToggleTaskStatus} // Allow reopening
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
