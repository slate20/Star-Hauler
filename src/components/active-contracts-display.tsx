
"use client";

import type React from 'react';
import type { ContractV2, DestinationTask } from '@/lib/types'; 
import { DestinationTaskCard } from './destination-task-card'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { FileText, PackageSearch } from 'lucide-react';

type ActiveContractsDisplayProps = {
  contracts: ContractV2[];
  onUpdateGoodQuantity: (contractId: string, taskId: string, goodId: string, newQuantity: number) => void;
  onRemoveGood: (contractId: string, taskId: string, goodId: string) => void;
  onAddGoodToTask: (contractId: string, taskId: string, goodData: { productName: string; quantity: number }) => void;
  onToggleTaskStatus: (contractId: string, taskId: string) => void;
};

export const ActiveContractsDisplay: React.FC<ActiveContractsDisplayProps> = ({ 
  contracts, 
  onUpdateGoodQuantity, 
  onRemoveGood, 
  onAddGoodToTask,
  onToggleTaskStatus,
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
              <AccordionItem key={contract.id} value={contract.id} className="border bg-card/80 rounded-lg shadow-sm">
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
                  <div className="text-sm text-muted-foreground ml-2 text-right flex-shrink-0">
                    {completedTasks}/{totalTasks} tasks complete
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
