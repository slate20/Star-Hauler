
"use client";

import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NewContractFormData, ModalDestinationEntry } from '@/lib/types'; // Updated import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2, Send, XCircle, MapPin, PackagePlus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const goodItemSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  quantity: z.coerce.number().positive("Quantity must be a positive number").int(),
});

const destinationEntrySchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  goods: z.array(goodItemSchema).min(1, "At least one good must be added per destination"),
});

const newContractFormSchema = z.object({
  destinationEntries: z.array(destinationEntrySchema).min(1, "At least one destination entry is required"),
});

type AddContractModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onContractSubmit: (data: NewContractFormData) => void;
};

export const AddContractModal: React.FC<AddContractModalProps> = ({ isOpen, onOpenChange, onContractSubmit }) => {
  const form = useForm<NewContractFormData>({
    resolver: zodResolver(newContractFormSchema),
    defaultValues: {
      destinationEntries: [{ destination: "", goods: [{ productName: "", quantity: 1 }] }],
    },
  });

  const { fields: destinationFields, append: appendDestination, remove: removeDestination } = useFieldArray({
    control: form.control,
    name: "destinationEntries",
  });

  const onSubmit = (data: NewContractFormData) => {
    onContractSubmit(data);
    form.reset({ destinationEntries: [{ destination: "", goods: [{ productName: "", quantity: 1 }] }] });
    onOpenChange(false);
  };

  const handleClose = () => {
    form.reset({ destinationEntries: [{ destination: "", goods: [{ productName: "", quantity: 1 }] }] });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Log New Hauling Contract(s)</DialogTitle>
          <DialogDescription>
            Enter one or more destinations, and the list of goods for each.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-grow overflow-hidden flex flex-col">
            <ScrollArea className="flex-grow pr-6 -mr-2">
              <div className="space-y-6 p-1">
                {destinationFields.map((destField, destIndex) => {
                  const { fields: goodFields, append: appendGood, remove: removeGood } = useFieldArray({
                    control: form.control,
                    name: `destinationEntries.${destIndex}.goods`
                  });

                  return (
                    <div key={destField.id} className="p-4 border rounded-lg bg-card/60 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <FormField
                          control={form.control}
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
                        {destinationFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDestination(destIndex)}
                            className="text-destructive hover:text-destructive/80 mt-6" // Adjusted margin
                          >
                            <Trash2 className="h-5 w-5" />
                            <span className="sr-only">Remove Destination</span>
                          </Button>
                        )}
                      </div>
                      
                      <FormLabel className="block mb-2 text-sm font-medium">Goods for {form.watch(`destinationEntries.${destIndex}.destination`) || `Destination #${destIndex + 1}`}:</FormLabel>
                      {goodFields.map((goodField, goodIndex) => (
                        <div key={goodField.id} className="flex items-end gap-2 mt-2 p-3 border rounded-md bg-background/50">
                           <PackagePlus className="h-5 w-5 mr-1 text-muted-foreground self-center mb-3" />
                          <FormField
                            control={form.control}
                            name={`destinationEntries.${destIndex}.goods.${goodIndex}.productName`}
                            render={({ field: fieldProps }) => (
                              <FormItem className="flex-grow">
                                <FormLabel className="text-xs">Product Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Agricium" {...fieldProps} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`destinationEntries.${destIndex}.goods.${goodIndex}.quantity`}
                            render={({ field: fieldProps }) => (
                              <FormItem className="w-28">
                                <FormLabel className="text-xs">Quantity (SCU)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="SCU" {...fieldProps} onChange={e => fieldProps.onChange(parseInt(e.target.value, 10) || '')} min="1"/>
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
                       {form.formState.errors.destinationEntries?.[destIndex]?.goods?.message && (
                         <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.destinationEntries?.[destIndex]?.goods?.message}</p>
                      )}
                      {form.formState.errors.destinationEntries?.[destIndex]?.goods?.root?.message && (
                         <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.destinationEntries?.[destIndex]?.goods?.root?.message}</p>
                      )}
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => appendDestination({ destination: "", goods: [{ productName: "", quantity: 1 }] })}
                  className="mt-4 w-full"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Add Another Destination Entry
                </Button>
                 {form.formState.errors.destinationEntries?.root?.message && (
                    <p className="text-sm font-medium text-destructive mt-2 text-center">{form.formState.errors.destinationEntries.root.message}</p>
                  )}
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                 <XCircle className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" /> Submit All Contracts
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
