
"use client";

import React, { useState } from 'react';
import type { Contract } from '@/lib/types';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rocket, Package, Warehouse, Plus, Minus, Trash2, Check, X, PlusSquare, ChevronDown, PackageCheck } from 'lucide-react'; // Added PackageCheck
import { Separator } from '@/components/ui/separator';

type ContractAccordionItemProps = {
  contract: Contract;
  onUpdateGoodQuantity: (contractId: string, goodId: string, newQuantity: number) => void;
  onRemoveGood: (contractId: string, goodId: string) => void;
  onAddGoodToContract: (contractId: string, goodData: { productName: string; quantity: number }) => void;
  onCompleteContract: (contractId: string) => void; // New prop
};

export const ContractAccordionItem: React.FC<ContractAccordionItemProps> = ({ 
  contract, 
  onUpdateGoodQuantity, 
  onRemoveGood, 
  onAddGoodToContract,
  onCompleteContract, // Destructure new prop
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
      // Consider using toast for better UX here
      alert("Product name cannot be empty and quantity must be a positive number.");
    }
  };
  
  const sortedGoods = [...contract.goods].sort((a,b) => a.productName.localeCompare(b.productName));

  return (
    <AccordionItem value={contract.id} className="border-none">
      <Card className="shadow-lg bg-card/95 animate-in fade-in-50 slide-in-from-bottom-5">
        <AccordionTrigger className="p-0 hover:no-underline [&[data-state=open]>div>svg.lucide-chevron-down]:rotate-180">
          <div className="flex flex-1 items-center justify-between p-6 w-full">
            <div className="flex items-center">
              <Rocket className="mr-3 h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">{contract.destination}</span>
            </div>
            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-0">
          <CardContent className="space-y-3 pb-4">
            {sortedGoods.length > 0 ? (
              sortedGoods.map((good) => (
                <div key={good.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-background/50 rounded-md gap-2">
                  <div className="flex items-center flex-grow min-w-0">
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
                      onClick={(e) => { e.stopPropagation(); onUpdateGoodQuantity(contract.id, good.id, good.quantity - 1);}}
                      disabled={good.quantity <= 0} // Keep quantity > 0; parent handles removal if it hits 0
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); onUpdateGoodQuantity(contract.id, good.id, good.quantity + 1);}}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive/80"
                      onClick={(e) => { e.stopPropagation(); onRemoveGood(contract.id, good.id);}}
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
          <CardFooter className="flex flex-col items-stretch p-4 space-y-3">
            {isAddingGood ? (
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Product Name"
                  value={newGoodName}
                  onChange={(e) => setNewGoodName(e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
                  className="h-9"
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={newGoodQuantity}
                  onChange={(e) => setNewGoodQuantity(e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
                  min="1"
                  className="h-9"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setIsAddingGood(false); setNewGoodName(""); setNewGoodQuantity(""); }}>
                    <X className="mr-1 h-4 w-4" /> Cancel
                  </Button>
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); handleAddNewGood();}}>
                    <Check className="mr-1 h-4 w-4" /> Add to Destination
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); setIsAddingGood(true);}} className="w-full">
                <PlusSquare className="mr-2 h-4 w-4" /> Add New Good to {contract.destination}
              </Button>
            )}
             <Separator className="my-1" />
            <Button 
              variant="default" 
              onClick={(e) => { e.stopPropagation(); onCompleteContract(contract.id); }} 
              className="w-full bg-green-600 hover:bg-green-700 text-white" // Example styling
            >
              <PackageCheck className="mr-2 h-4 w-4" /> Mark Contract as Delivered
            </Button>
          </CardFooter>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
};
