
"use client";

import type React from 'react';
import type { ContractV2 } from '@/lib/types';
import { DestinationTaskCard } from './destination-task-card'; // Re-use for display
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { BookOpen, FileText } from 'lucide-react';

type LogBookDisplayProps = {
  contracts: ContractV2[];
  onToggleTaskStatus: (contractId: string, taskId: string) => void; // To allow reopening
};

export const LogBookDisplay: React.FC<LogBookDisplayProps> = ({ 
  contracts,
  onToggleTaskStatus,
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
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-4">
          {sortedContracts.map((contract) => {
            const completedTasks = contract.destinationTasks.filter(t => t.isComplete).length;
            const totalTasks = contract.destinationTasks.length;
            return (
              <AccordionItem key={contract.id} value={contract.id} className="border bg-card/70 rounded-lg shadow-sm data-[state=open]:bg-card/80">
                <AccordionTrigger className="p-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                     <FileText className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-lg">{contract.contractNumber}</span>
                     <span className="text-sm text-muted-foreground">({contract.description || 'No description'})</span>
                  </div>
                  <div className="text-sm text-green-400">
                    {completedTasks}/{totalTasks} tasks delivered
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
                          onUpdateGoodQuantity={() => { /* No-op for completed */ }}
                          onRemoveGood={() => { /* No-op for completed */ }}
                          onAddGoodToTask={() => { /* No-op for completed */ }}
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
