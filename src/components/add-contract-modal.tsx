
"use client";

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NewContractFormData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, XCircle, MapPin, FileText, DollarSign } from 'lucide-react';
import { DestinationEntryFields } from './destination-entry-fields';

const goodItemSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  quantity: z.coerce.number().positive("Quantity must be a positive number").int(),
});

const destinationEntrySchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  goods: z.array(goodItemSchema).min(1, "At least one good must be added per destination task."),
});

const newContractFormSchema = z.object({
  contractNumber: z.string().min(1, "Contract Number/ID is required"),
  rewardK: z.coerce.number().min(0, "Reward must be zero or a positive number"),
  destinationEntries: z.array(destinationEntrySchema).min(1, "At least one destination task is required."),
});

type AddContractModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onContractSubmit: (data: NewContractFormData) => void;
};

const ADD_CONTRACT_FORM_ID = "addContractForm";

export const AddContractModal: React.FC<AddContractModalProps> = ({ isOpen, onOpenChange, onContractSubmit }) => {
  const form = useForm<NewContractFormData>({
    resolver: zodResolver(newContractFormSchema),
    defaultValues: {
      contractNumber: `CN-${Date.now().toString().slice(-6)}`,
      rewardK: 0,
      destinationEntries: [{ destination: "", goods: [{ productName: "", quantity: 1 }] }],
    },
  });

  const { fields: destinationFields, append: appendDestination, remove: removeDestination } = useFieldArray({
    control: form.control,
    name: "destinationEntries",
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        contractNumber: `CN-${Date.now().toString().slice(-6)}`,
        rewardK: 0,
        destinationEntries: [{ destination: "", goods: [{ productName: "", quantity: 1 }] }],
      });
    }
  }, [isOpen, form]);

  const onSubmit = (data: NewContractFormData) => {
    onContractSubmit(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Log New Hauling Contract</DialogTitle>
          <DialogDescription>
            Enter contract details, including all destination tasks and their respective goods.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id={ADD_CONTRACT_FORM_ID}
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col min-h-0" 
          >
            <ScrollArea className="flex-1 overflow-y-auto" >
              <div className="space-y-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Contract Number/ID</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                            <Input placeholder="e.g., CX-12345 or Client Name" {...field} className="text-base"/>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rewardK"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Contract Reward (K aUEC)</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                            <Input 
                              type="number" 
                              placeholder="e.g., 50 for 50,000" 
                              {...field} 
                              className="text-base" 
                              onChange={e => field.onChange(e.target.value)} 
                              min="0" 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormLabel className="text-lg block pt-2">Destination Tasks:</FormLabel>
                {destinationFields.map((destField, destIndex) => (
                  <DestinationEntryFields
                    key={destField.id}
                    destIndex={destIndex}
                    removeDestination={removeDestination}
                    canRemoveDestination={destinationFields.length > 1}
                  />
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => appendDestination({ destination: "", goods: [{ productName: "", quantity: 1 }] })}
                  className="mt-4 w-full"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Add Another Destination Task
                </Button>
                {(form.formState.errors.destinationEntries?.message || form.formState.errors.destinationEntries?.root?.message) && (
                    <p className="text-sm font-medium text-destructive mt-2 text-center">
                        {form.formState.errors.destinationEntries?.message || form.formState.errors.destinationEntries?.root?.message}
                    </p>
                )}
              </div>
            </ScrollArea>
          </form>
        </Form>
        <DialogFooter className="pt-4 border-t mt-auto">
          <Button type="button" variant="outline" onClick={handleCancel}>
             <XCircle className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" form={ADD_CONTRACT_FORM_ID}>
            <Send className="mr-2 h-4 w-4" /> Submit Contract
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
