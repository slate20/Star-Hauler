
"use client";

import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NewContractFormData, ModalGoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Send, XCircle } from 'lucide-react';

const goodItemSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  quantity: z.coerce.number().positive("Quantity must be a positive number").int(),
});

const newContractFormSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  goods: z.array(goodItemSchema).min(1, "At least one good must be added"),
});

type AddContractModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onContractSubmit: (data: NewContractFormData) => void;
};

export const AddContractModal: React.FC<AddContractModalProps> = ({ isOpen, onOpenChange, onContractSubmit }) => {
  const { toast } = useToast();
  const form = useForm<NewContractFormData>({
    resolver: zodResolver(newContractFormSchema),
    defaultValues: {
      destination: "",
      goods: [{ productName: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "goods",
  });

  const onSubmit = (data: NewContractFormData) => {
    onContractSubmit(data);
    form.reset(); // Reset form after successful submission
    onOpenChange(false); // Close modal
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Log New Hauling Contract</DialogTitle>
          <DialogDescription>
            Enter the destination and the list of goods to be delivered.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-grow overflow-hidden flex flex-col">
            <ScrollArea className="flex-grow pr-6">
              <div className="space-y-4 p-1">
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Terra Prime" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Goods to Deliver</FormLabel>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 mt-2 p-3 border rounded-md bg-background/30">
                      <FormField
                        control={form.control}
                        name={`goods.${index}.productName`}
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
                        name={`goods.${index}.quantity`}
                        render={({ field: fieldProps }) => (
                          <FormItem className="w-28">
                            <FormLabel className="text-xs">Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="SCU" {...fieldProps} onChange={e => fieldProps.onChange(parseInt(e.target.value, 10) || '')} min="1"/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
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
                    onClick={() => append({ productName: "", quantity: 1 })}
                    className="mt-3"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Another Good
                  </Button>
                  {form.formState.errors.goods && !form.formState.errors.goods.root && (
                     <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.goods.message}</p>
                  )}
                   {form.formState.errors.goods?.root && (
                     <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.goods.root.message}</p>
                  )}


                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                 <XCircle className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" /> Submit Contract
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
