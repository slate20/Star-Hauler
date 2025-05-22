
"use client";

import type React from 'react';
import { useMemo } from 'react';
import type { ContractV2 } from '@/lib/types'; // Updated to use ContractV2
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Boxes, Package, BarChart3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type CargoInventoryDisplayProps = {
  contracts: ContractV2[]; // Expects active contracts
};

export const CargoInventoryDisplay: React.FC<CargoInventoryDisplayProps> = ({ contracts }) => {
  const { aggregatedGoods, grandTotalScu } = useMemo(() => {
    const goodsMap = new Map<string, number>();
    let currentGrandTotalScu = 0;

    contracts.forEach(contract => {
      contract.destinationTasks.forEach(task => {
        if (!task.isComplete) { // Only count goods from incomplete tasks
          task.goods.forEach(good => {
            goodsMap.set(
              good.productName,
              (goodsMap.get(good.productName) || 0) + good.quantity
            );
            currentGrandTotalScu += good.quantity;
          });
        }
      });
    });

    const currentAggregatedGoods = Array.from(goodsMap.entries())
      .map(([productName, totalQuantity]) => ({ productName, totalQuantity }))
      .sort((a, b) => a.productName.localeCompare(b.productName));

    return { aggregatedGoods: currentAggregatedGoods, grandTotalScu: currentGrandTotalScu };
  }, [contracts]);

  if (contracts.length === 0 || aggregatedGoods.length === 0 && grandTotalScu === 0) {
    return (
       <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Boxes className="mr-2 h-5 w-5 text-primary" />
            Cargo Inventory
          </CardTitle>
          <CardDescription>No pending cargo in active contracts.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Boxes className="mr-2 h-5 w-5 text-primary" />
          Cargo Inventory
        </CardTitle>
        <CardDescription>Total SCU for each pending good across all active, incomplete tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        {aggregatedGoods.length > 0 ? (
          <>
            <ScrollArea className="h-[200px] pr-4 mb-4">
              <ul className="space-y-3">
                {aggregatedGoods.map(({ productName, totalQuantity }) => (
                  <li key={productName} className="flex justify-between items-center p-3 bg-card-foreground/5 rounded-lg">
                    <div className="flex items-center">
                      <Package className="mr-3 h-5 w-5 text-accent" />
                      <span className="font-medium">{productName}</span>
                    </div>
                    <div className="flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-primary">{totalQuantity.toLocaleString()} SCU</span>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Grand Total Pending SCU:</span>
                <span className="text-primary">{grandTotalScu.toLocaleString()} SCU</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">No pending goods in active contracts.</p>
        )}
      </CardContent>
    </Card>
  );
};
