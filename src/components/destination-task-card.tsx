
"use client";

import React, { useState } from 'react';
import type { DestinationTask, Good } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rocket, Package, Warehouse, Plus, Minus, Trash2, Check, X, PlusSquare, CheckCircle2, Circle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type DestinationTaskCardProps = {
  contractId: string;
  task: DestinationTask;
  onUpdateGoodQuantity: (contractId: string, taskId: string, goodId: string, newQuantity: number) => void;
  onRemoveGood: (contractId: string, taskId: string, goodId: string) => void;
  onAddGoodToTask: (contractId: string, taskId: string, goodData: { productName: string; quantity: number }) => void;
  onToggleTaskStatus: (contractId: string, taskId: string) => void;
};

export const DestinationTaskCard: React.FC<DestinationTaskCardProps> = ({ 
  contractId,
  task, 
  onUpdateGoodQuantity, 
  onRemoveGood, 
  onAddGoodToTask,
  onToggleTaskStatus,
}) => {
  const [isAddingGood, setIsAddingGood] = useState(false);
  const [newGoodName, setNewGoodName] = useState("");
  const [newGoodQuantity, setNewGoodQuantity] = useState<string | number>("");

  const handleAddNewGoodToTask = () => {
    const quantity = parseInt(String(newGoodQuantity), 10);
    if (newGoodName.trim() && !isNaN(quantity) && quantity > 0) {
      onAddGoodToTask(contractId, task.id, { productName: newGoodName, quantity });
      setNewGoodName("");
      setNewGoodQuantity("");
      setIsAddingGood(false);
    } else {
      // Consider using toast for better UX here
      alert("Product name cannot be empty and quantity must be a positive number.");
    }
  };
  
  const sortedGoods = [...task.goods].sort((a,b) => a.productName.localeCompare(b.productName));

  return (
    <Card className={`shadow-md ${task.isComplete ? 'bg-green-900/20 border-green-700' : 'bg-card/90'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Rocket className={`mr-3 h-6 w-6 ${task.isComplete ? 'text-green-500' : 'text-primary'}`} />
            <CardTitle className="text-lg font-semibold">{task.destination}</CardTitle>
          </div>
          <Badge variant={task.isComplete ? "default" : "secondary"} className={task.isComplete ? "bg-green-600 text-white" : ""}>
            {task.isComplete ? "Delivered" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-2 pb-3">
        {sortedGoods.length > 0 ? (
          sortedGoods.map((good) => (
            <div key={good.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2.5 bg-background/60 rounded-md gap-2">
              <div className="flex items-center flex-grow min-w-0">
                <Package className="mr-2 h-5 w-5 text-accent flex-shrink-0" />
                <span className="font-medium mr-2 truncate" title={good.productName}>{good.productName}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
               {/* <Warehouse className="mr-1 h-4 w-4 text-muted-foreground" /> */}
                <span className="mr-2 w-12 text-right">{good.quantity.toLocaleString()}</span>
                {!task.isComplete && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onUpdateGoodQuantity(contractId, task.id, good.id, good.quantity - 1)}
                      disabled={good.quantity <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onUpdateGoodQuantity(contractId, task.id, good.id, good.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive/80"
                      onClick={() => onRemoveGood(contractId, task.id, good.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-2">No goods assigned to this destination task.</p>
        )}
      </CardContent>
      {!task.isComplete && (
        <>
          <Separator className="my-1" />
          <CardFooter className="flex flex-col items-stretch p-3 space-y-2">
            {isAddingGood ? (
              <div className="space-y-2 p-2 border rounded-md bg-background/50">
                <Input
                  type="text"
                  placeholder="Product Name"
                  value={newGoodName}
                  onChange={(e) => setNewGoodName(e.target.value)}
                  className="h-9"
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={newGoodQuantity}
                  onChange={(e) => setNewGoodQuantity(e.target.value)}
                  min="1"
                  className="h-9"
                />
                <div className="flex gap-2 justify-end pt-1">
                  <Button variant="ghost" size="sm" onClick={() => { setIsAddingGood(false); setNewGoodName(""); setNewGoodQuantity(""); }}>
                    <X className="mr-1 h-4 w-4" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleAddNewGoodToTask}>
                    <Check className="mr-1 h-4 w-4" /> Add to Task
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsAddingGood(true)} className="w-full">
                <PlusSquare className="mr-2 h-4 w-4" /> Add Good to this Task
              </Button>
            )}
          </CardFooter>
        </>
      )}
      <Separator className="my-1" />
      <div className="p-3">
        <Button 
          variant={task.isComplete ? "secondary" : "default"} 
          onClick={() => onToggleTaskStatus(contractId, task.id)} 
          className={`w-full ${task.isComplete ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
        >
          {task.isComplete ? <Circle className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
          {task.isComplete ? "Mark as Pending" : "Mark Task as Delivered"}
        </Button>
      </div>
    </Card>
  );
};
