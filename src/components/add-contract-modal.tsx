
"use client";

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NewContractFormData, ModalDestinationEntry } from '@/lib/types'; // Ensure ModalDestinationEntry is imported if not already
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, XCircle, MapPin } from 'lucide-react';
import { DestinationEntryFields } from './destination-entry-fields';

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

  useEffect(() => {
    if (!isOpen) {
      form.reset({
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
          <DialogTitle>Log New Hauling Contract(s)</DialogTitle>
          <DialogDescription>
            Enter one or more destinations, and the list of goods for each.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow overflow-hidden flex flex-col min-h-0"> {/* Added min-h-0 */}
            <ScrollArea className="flex-grow pr-6 -mr-2">
              <div className="space-y-6 p-4"> {/* Changed p-1 to p-4 */}
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
              <Button type="button" variant="outline" onClick={handleCancel}>
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
