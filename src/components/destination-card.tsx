
"use client";

import React, { useState } from 'react';
import type { Contract, Good } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rocket, Package, Warehouse, Plus, Minus, Trash2, Check, X, PlusSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type DestinationCardProps = {
  contract: Contract;
  onUpdateGoodQuantity: (contractId: string, goodId: string, newQuantity: number) => void;
  onRemoveGood: (contractId: string, goodId: string) => void;
  onAddGoodToContract: (contractId: string, goodData: { productName: string; quantity: number }) => void;
};

export const DestinationCard: React.FC<DestinationCardProps> = ({ 
  contract, 
  onUpdateGoodQuantity, 
  onRemoveGood, 
  onAddGoodToContract 
}) => {
  const [isAddingGood, setIsAddingGood] = useState(false);
  const [newGoodName, setNewGoodName] = useState("");
  const [newGoodQuantity, setNewGoodQuantity] = useState<string | number>("");

  const handleAddNewGood = () => {
    const quantity = parseInt(String(newGoodQuantity), 10);
    if (newGoodName.trim() && !isNaN(quantity) && quantity > 0) {
      onAddGoodToContract(contract.id, { productName: newGoodName, quantity });
      setNewGoodName("");
      setNewGoodQuantity("");
      setIsAddingGood(false);
    } else {
      // Basic validation feedback, could use toast here
      alert("Product name cannot be empty and quantity must be a positive number.");
    }
  };
  
  // Sort goods by product name for consistent display
  const sortedGoods = [...contract.goods].sort((a,b) => a.productName.localeCompare(b.productName));

  return (
    <Card className="shadow-lg hover:shadow-accent/20 transition-shadow duration-300 animate-in fade-in-50 slide-in-from-bottom-10">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Rocket className="mr-2 h-5 w-5 text-primary" />
          {contract.destination}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedGoods.length > 0 ? (
          sortedGoods.map((good) => (
            <div key={good.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-card-foreground/5 rounded-md gap-2">
              <div className="flex items-center flex-grow">
                <Package className="mr-2 h-5 w-5 text-accent flex-shrink-0" />
                <span className="font-medium mr-2 truncate" title={good.productName}>{good.productName}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                <Warehouse className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className="mr-2 w-12 text-right">{good.quantity.toLocaleString()}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onUpdateGoodQuantity(contract.id, good.id, good.quantity - 1)}
                  disabled={good.quantity <= 0} //Technically it removes at 0, but UX might be better to disable at 1 if you don't want it to disappear immediately
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onUpdateGoodQuantity(contract.id, good.id, good.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive/80"
                  onClick={() => onRemoveGood(contract.id, good.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-2">No goods assigned to this destination yet.</p>
        )}
      </CardContent>
      <Separator className="my-2" />
      <CardFooter className="flex flex-col items-stretch p-4">
        {isAddingGood ? (
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="New Product Name"
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
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setIsAddingGood(false); setNewGoodName(""); setNewGoodQuantity(""); }}>
                <X className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button size="sm" onClick={handleAddNewGood}>
                <Check className="mr-1 h-4 w-4" /> Add to Destination
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsAddingGood(true)} className="w-full">
            <PlusSquare className="mr-2 h-4 w-4" /> Add New Good to {contract.destination}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
