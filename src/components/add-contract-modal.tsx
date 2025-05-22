
"use client";

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form'; // Removed Controller, not directly used here
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NewContractFormData } from '@/lib/types'; // ModalDestinationEntry is implicitly used by NewContractFormData
import { Button } from '@/components/ui/button';
// Input is not directly used here anymore, but through DestinationEntryFields
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
  // FormControl, FormField, FormItem, FormLabel, FormMessage are used in sub-component
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, XCircle, MapPin } from 'lucide-react'; // Removed PlusCircle, Trash2, PackagePlus as they are in sub-component
// Separator is not used here anymore
import { DestinationEntryFields } from './destination-entry-fields'; // Import the new component

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
    // The decision to reset form and close modal is typically handled by the parent (HomePage)
    // based on submission success/failure by toggling the 'isOpen' prop.
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
        <Form {...form}> {/* FormProvider for useFormContext in child components */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-grow overflow-hidden flex flex-col">
            <ScrollArea className="flex-grow pr-6 -mr-2">
              <div className="space-y-6 p-1">
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
                  Add Another Destination Entry
                </Button>
                {form.formState.errors.destinationEntries?.message && (
                    <p className="text-sm font-medium text-destructive mt-2 text-center">
                        {form.formState.errors.destinationEntries.message}
                    </p>
                )}
                 {form.formState.errors.destinationEntries?.root?.message && (
                    <p className="text-sm font-medium text-destructive mt-2 text-center">
                        {form.formState.errors.destinationEntries.root.message}
                    </p>
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
