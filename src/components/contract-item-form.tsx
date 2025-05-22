
"use client";

import type React from 'react';
import { useEffect, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addContractItemAction } from '@/lib/actions';
import type { ContractItemData, ContractFormState } from '@/lib/types';
import type { UEXLocation, UEXCommodity } from '@/lib/uexcorp-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Package, Warehouse, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  destination: z.string().min(1, "Please select a destination"),
  productName: z.string().min(1, "Please select a product"),
  quantity: z.coerce.number().positive("Quantity must be a positive number").int("Quantity must be a whole number"),
});

type ContractItemFormProps = {
  onItemAdded: (newItem: ContractItemData) => void;
  destinations: UEXLocation[];
  commodities: UEXCommodity[];
};

export const ContractItemForm: React.FC<ContractItemFormProps> = ({ onItemAdded, destinations, commodities }) => {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState<ContractFormState, FormData>(addContractItemAction, null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      productName: "",
      quantity: '',
    },
  });

  useEffect(() => {
    if (state?.success && state.item) {
      form.reset(); 
      // Reset to actual empty strings which Select needs to show placeholder
      form.setValue('destination', '');
      form.setValue('productName', '');
      form.setValue('quantity', '' as unknown as number); // Keep quantity as empty string for UI
      onItemAdded(state.item);
      toast({
        title: "Contract Item Processed!",
        description: state.message,
      });
    } else if (state?.message && !state.success) {
      if (state.errors?._form) {
         toast({ variant: "destructive", title: "Error", description: state.errors._form.join(', ') });
      } else if (!state.errors) {
         toast({ variant: "destructive", title: "Error", description: state.message });
      }
    }
  }, [state, form, onItemAdded, toast]);

  useEffect(() => {
    if (state?.errors) {
      const errors = state.errors;
      (Object.keys(errors) as Array<keyof typeof errors>).forEach((key) => {
        if (key !== '_form' && errors[key]) {
          form.setError(key as "destination" | "productName" | "quantity", { type: "server", message: errors[key]?.join(', ') });
        }
      });
    }
  }, [state, form]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Rocket className="mr-2 h-4 w-4 text-accent" />Destination</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""} defaultValue="">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a destination" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    {destinations.map((dest) => (
                      <SelectItem key={dest.uuid} value={dest.name}>
                        {dest.name} ({dest.celestial_body.name})
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Package className="mr-2 h-4 w-4 text-accent" />Product Name</FormLabel>
               <Select onValueChange={field.onChange} value={field.value || ""} defaultValue="">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    {commodities.map((com) => (
                      <SelectItem key={com.uuid} value={com.name}>
                        {com.name}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Warehouse className="mr-2 h-4 w-4 text-accent" />Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 150" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || '')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending || form.formState.isSubmitting}>
          <Send className="mr-2 h-4 w-4" />
          {isPending || form.formState.isSubmitting ? "Processing..." : "Add/Update Contract Item"}
        </Button>
        {state?.message && !state.success && state.errors?._form && (
          <p className="text-sm font-medium text-destructive">{state.errors._form.join(', ')}</p>
        )}
      </form>
    </Form>
  );
};
