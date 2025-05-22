
"use client";

import React, { useMemo } from 'react';
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
import { FormCombobox } from '@/components/form-combobox';
import { ComboboxOption } from '@/components/ui/combobox';
import { destinations, commodities } from '@/lib/data/game-data';

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
  
  // Convert destinations and commodities to combobox options format
  const destinationOptions = useMemo<ComboboxOption[]>(() => {
    // Add an option for each destination from the data file
    const dataOptions = destinations.map(dest => ({
      value: dest.name, // Use name instead of ID for the value
      label: dest.name + (dest.system ? ` (${dest.system})` : '')
    }));
    
    // Add custom option for backward compatibility with existing data
    // This ensures that any custom destinations already entered still show up
    const currentDestination = watch(`destinationEntries.${destIndex}.destination`);
    if (currentDestination && 
        !dataOptions.some(opt => opt.value === currentDestination) && 
        !dataOptions.some(opt => opt.label === currentDestination)) {
      dataOptions.push({
        value: currentDestination,
        label: currentDestination
      });
    }
    
    return dataOptions;
  }, [watch, destIndex]);

  const commodityOptions = useMemo<ComboboxOption[]>(() => {
    // Add an option for each commodity from the data file
    const dataOptions = commodities.map(commodity => ({
      value: commodity.name, // Use name instead of ID for the value
      label: commodity.name
    }));
    
    // Add custom options for backward compatibility
    const currentGoods = watch(`destinationEntries.${destIndex}.goods`) || [];
    currentGoods.forEach(good => {
      if (good.productName && 
          !dataOptions.some(opt => opt.value === good.productName) && 
          !dataOptions.some(opt => opt.label === good.productName)) {
        dataOptions.push({
          value: good.productName,
          label: good.productName
        });
      }
    });
    
    return dataOptions;
  }, [watch, destIndex]);

  const { fields: goodFields, append: appendGood, remove: removeGood } = useFieldArray({
    control,
    name: `destinationEntries.${destIndex}.goods`,
  });

  const currentDestinationName = watch(`destinationEntries.${destIndex}.destination`);

  return (
    <div className="p-4 border rounded-lg bg-card/60 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <FormCombobox
          control={control}
          name={`destinationEntries.${destIndex}.destination`}
          options={destinationOptions}
          label={`Destination #${destIndex + 1}`}
          placeholder="Select a destination"
          emptyMessage="No destinations found."
          icon={<MapPin className="h-5 w-5" />}
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
          <FormCombobox
            control={control}
            name={`destinationEntries.${destIndex}.goods.${goodIndex}.productName`}
            options={commodityOptions}
            label="Product Name"
            placeholder="Select a commodity"
            emptyMessage="No commodities found."
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
