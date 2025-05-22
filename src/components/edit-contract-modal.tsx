
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ContractV2, EditContractFormData } from '@/lib/types';
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
import { Save, XCircle, FileText, DollarSign } from 'lucide-react';

const editContractFormSchema = z.object({
  id: z.string(), // Not directly edited by user but needed for submission
  contractNumber: z.string().min(1, "Contract Number/ID is required"),
  rewardK: z.coerce.number().min(0, "Reward must be zero or a positive number"),
});

type EditContractModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onContractUpdate: (data: EditContractFormData) => void;
  contractToEdit: ContractV2 | null;
};

const EDIT_CONTRACT_FORM_ID = "editContractForm";

export const EditContractModal: React.FC<EditContractModalProps> = ({
  isOpen,
  onOpenChange,
  onContractUpdate,
  contractToEdit,
}) => {
  const form = useForm<EditContractFormData>({
    resolver: zodResolver(editContractFormSchema),
    defaultValues: {
      id: "",
      contractNumber: "",
      rewardK: 0,
    },
  });

  useEffect(() => {
    if (contractToEdit && isOpen) {
      form.reset({
        id: contractToEdit.id,
        contractNumber: contractToEdit.contractNumber,
        rewardK: contractToEdit.reward / 1000, // Convert back to K for display
      });
    } else if (!isOpen) {
        form.reset({ // Reset to defaults when modal is closed
            id: "",
            contractNumber: "",
            rewardK: 0,
        });
    }
  }, [contractToEdit, isOpen, form]);

  const onSubmit = (data: EditContractFormData) => {
    onContractUpdate(data);
    // onOpenChange(false); // Let parent handle closing if needed, or rely on useEffect for reset
  };

  const handleCancel = () => {
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Contract Details</DialogTitle>
          <DialogDescription>
            Modify the contract number/ID and reward. Task details are managed separately.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id={EDIT_CONTRACT_FORM_ID}
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col min-h-0 py-4" 
          >
              <div className="space-y-6 px-1">
                <FormField
                  control={form.control}
                  name="contractNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Contract Number/ID</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                          <Input placeholder="e.g., CX-12345" {...field} className="text-base"/>
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
                      <FormLabel className="text-base">Contract Reward (K aUEC)</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                          <Input type="number" placeholder="e.g., 50 for 50,000" {...field} className="text-base" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} min="0" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Hidden field for ID, not typically needed if not part of form display but included for completeness in schema */}
                <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => <Input type="hidden" {...field} />}
                />
              </div>
          </form>
        </Form>
        <DialogFooter className="pt-4 border-t mt-auto">
          <Button type="button" variant="outline" onClick={handleCancel}>
             <XCircle className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" form={EDIT_CONTRACT_FORM_ID}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

