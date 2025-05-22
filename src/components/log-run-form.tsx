"use client";

import type React from 'react';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { logHaulingRunAction } from '@/lib/actions';
import type { HaulingRun, HaulingRunFormState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Package, Hash, Send } from 'lucide-react';

const formSchema = z.object({
  destination: z.string().min(3, "Destination must be at least 3 characters"),
  cargo: z.string().min(3, "Cargo type must be at least 3 characters"),
  scu: z.coerce.number().positive("SCU must be a positive number").int("SCU must be a whole number"),
});

type LogRunFormProps = {
  onRunLogged: (newRun: HaulingRun) => void;
};

export const LogRunForm: React.FC<LogRunFormProps> = ({ onRunLogged }) => {
  const { toast } = useToast();
  const [state, formAction] = useFormState<HaulingRunFormState, FormData>(logHaulingRunAction, null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      cargo: "",
      scu: undefined, // Use undefined for number input placeholder
    },
  });

  useEffect(() => {
    if (state?.success && state.run) {
      form.reset();
      onRunLogged(state.run);
      toast({
        title: "Mission Logged!",
        description: state.message,
      });
    } else if (state?.message && !state.success) {
      // Handle general form errors (not field-specific)
      if (state.errors?._form) {
         toast({ variant: "destructive", title: "Error", description: state.errors._form.join(', ') });
      } else if (!state.errors) { // Only show toast if no field errors are present (they show inline)
         toast({ variant: "destructive", title: "Error", description: state.message });
      }
    }
  }, [state, form, onRunLogged, toast]);
  
  // Set field errors from server action
  useEffect(() => {
    if (state?.errors) {
      const errors = state.errors;
      (Object.keys(errors) as Array<keyof typeof errors>).forEach((key) => {
        if (key !== '_form' && errors[key]) {
          form.setError(key as "destination" | "cargo" | "scu", { type: "server", message: errors[key]?.join(', ') });
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
              <FormControl>
                <Input placeholder="e.g., Mars Colony, Titan Orbital" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cargo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Package className="mr-2 h-4 w-4 text-accent" />Cargo Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Water Ice, Starship Components" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="scu"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Hash className="mr-2 h-4 w-4 text-accent" />SCU (Standard Cargo Units)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 150" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          <Send className="mr-2 h-4 w-4" />
          {form.formState.isSubmitting ? "Logging Run..." : "Log Hauling Run"}
        </Button>
        {state?.message && !state.success && state.errors?._form && (
          <p className="text-sm font-medium text-destructive">{state.errors._form.join(', ')}</p>
        )}
      </form>
    </Form>
  );
};
