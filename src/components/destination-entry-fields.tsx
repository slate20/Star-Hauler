
"use client";

import React from 'react';
import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import type { NewContractFormData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PlusCircle, Trash2, MapPin, PackagePlus } from 'lucide-react';

type DestinationEntryFieldsProps = {
  destIndex: number;
  removeDestination: (index: number) => void;
  canRemoveDestination: boolean;
};

export const DestinationEntryFields: React.FC<DestinationEntryFieldsProps> = ({
  destIndex,
  removeDestination,
  canRemoveDestination,
}) => {
  const { control, watch, formState: { errors } } = useFormContext<NewContractFormData>();

  const { fields: goodFields, append: appendGood, remove: removeGood } = useFieldArray({
    control,
    name: `destinationEntries.${destIndex}.goods`,
  });

  const currentDestinationName = watch(`destinationEntries.${destIndex}.destination`);

  return (
    <div className="p-4 border rounded-lg bg-card/60 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <FormField
          control={control}
          name={`destinationEntries.${destIndex}.destination`}
          render={({ field }) => (
            <FormItem className="flex-grow mr-2">
              <FormLabel className="text-base">Destination #{destIndex + 1}</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                  <Input placeholder="e.g., Terra Prime" {...field} className="text-base"/>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {canRemoveDestination && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeDestination(destIndex)}
            className="text-destructive hover:text-destructive/80 mt-6"
          >
            <Trash2 className="h-5 w-5" />
            <span className="sr-only">Remove Destination</span>
          </Button>
        )}
      </div>
      
      <FormLabel className="block mb-2 text-sm font-medium">
        Goods for {currentDestinationName || `Destination #${destIndex + 1}`}:
      </FormLabel>
      {goodFields.map((goodField, goodIndex) => (
        <div key={goodField.id} className="flex items-end gap-2 mt-2 p-3 border rounded-md bg-background/50">
          <PackagePlus className="h-5 w-5 mr-1 text-muted-foreground self-center mb-3" />
          <FormField
            control={control}
            name={`destinationEntries.${destIndex}.goods.${goodIndex}.productName`}
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel className="text-xs">Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Agricium" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`destinationEntries.${destIndex}.goods.${goodIndex}.quantity`}
            render={({ field }) => (
              <FormItem className="w-28">
                <FormLabel className="text-xs">Quantity (SCU)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="SCU" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || '')} min="1"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {goodFields.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeGood(goodIndex)}
              className="text-destructive hover:text-destructive/80 h-9 w-9"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove Good</span>
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => appendGood({ productName: "", quantity: 1 })}
        className="mt-3"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Good to this Destination
      </Button>
      {/* Message for "At least one good must be added" from Zod schema */}
      {errors.destinationEntries?.[destIndex]?.goods?.message && (
         <p className="text-sm font-medium text-destructive mt-1">{errors.destinationEntries?.[destIndex]?.goods?.message}</p>
      )}
      {/* Fallback for other root errors on the goods array */}
      {errors.destinationEntries?.[destIndex]?.goods?.root?.message && (
         <p className="text-sm font-medium text-destructive mt-1">{errors.destinationEntries?.[destIndex]?.goods?.root?.message}</p>
      )}
    </div>
  );
};
