
"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import type { CapTableEntry } from "@/lib/types";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const entrySchema = z.object({
  holder: z.string().min(2, "Shareholder name is required."),
  type: z.enum(["Founder", "Investor", "ESOP"], { required_error: "Please select a type." }),
  grantDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  vesting: z.string().min(3, "Vesting details are required."),
  value: z.coerce.number().min(0.0001, "Value must be greater than zero."),
  inputType: z.enum(['shares', 'percentage']).default('shares'),
  investmentAmount: z.coerce.number().optional(),
  valuation: z.coerce.number().optional(),
});

type FormData = z.infer<typeof entrySchema>;

interface CapTableModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (entry: Omit<CapTableEntry, 'id'> & { id?: string }) => void;
  entryToEdit?: CapTableEntry | null;
  totalShares: number;
}

export function CapTableModal({ isOpen, onOpenChange, onSave, entryToEdit, totalShares }: CapTableModalProps) {
  const isEditMode = !!entryToEdit;
  const { toast } = useToast();

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<FormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      holder: "",
      type: undefined,
      grantDate: "",
      vesting: "",
      value: 0,
      inputType: 'shares',
      investmentAmount: 0,
      valuation: 0,
    }
  });

  const inputType = watch("inputType");
  const type = watch("type");

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && entryToEdit) {
        // When editing, lock to "shares" mode and pre-fill the value.
        // It's ambiguous to edit by percentage after issuance.
        reset({ 
            ...entryToEdit, 
            value: entryToEdit.shares, 
            inputType: 'shares',
            investmentAmount: entryToEdit.investmentAmount || 0,
            valuation: entryToEdit.valuation || 0,
        });
      } else {
        reset({
            holder: "",
            type: undefined,
            grantDate: "",
            vesting: "",
            value: 0,
            inputType: 'shares',
            investmentAmount: 0,
            valuation: 0,
        });
      }
    }
  }, [isOpen, entryToEdit, isEditMode, reset]);

  const onSubmit = (data: FormData) => {
    let finalShares = 0;
    
    if (data.inputType === 'percentage') {
        if (data.value >= 100) {
            toast({
                variant: 'destructive',
                title: 'Invalid Percentage',
                description: 'Ownership percentage must be less than 100%.',
            });
            return;
        }
        // Formula to calculate new shares for a desired percentage of the *new* total:
        // new_shares = (total_existing_shares * desired_percentage) / (100 - desired_percentage)
        finalShares = (totalShares * data.value) / (100 - data.value);

    } else {
        finalShares = data.value;
    }

    onSave({ 
        ...data, 
        shares: Math.round(finalShares), // Ensure shares are whole numbers
        id: entryToEdit?.id 
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Issuance" : "Add New Issuance"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details for this equity issuance." : "Record a new share issuance on your cap table."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="holder">Shareholder Name</Label>
                <Controller name="holder" control={control} render={({ field }) => <Input id="holder" {...field} />} />
                {errors.holder && <p className="text-sm text-destructive">{errors.holder.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Issue by</Label>
              <Controller
                name="inputType"
                control={control}
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-2" disabled={isEditMode}>
                    <Label htmlFor="by-shares" className={cn("flex items-center space-x-2 border rounded-md p-3 hover:bg-muted transition-colors", field.value === 'shares' && "border-primary", isEditMode && "cursor-not-allowed opacity-70")}>
                        <RadioGroupItem value="shares" id="by-shares" disabled={isEditMode}/>
                        <span>By Shares</span>
                    </Label>
                    <Label htmlFor="by-percentage" className={cn("flex items-center space-x-2 border rounded-md p-3 hover:bg-muted transition-colors", field.value === 'percentage' && "border-primary", isEditMode && "cursor-not-allowed opacity-70")}>
                        <RadioGroupItem value="percentage" id="by-percentage" disabled={isEditMode}/>
                        <span>By Percentage</span>
                    </Label>
                  </RadioGroup>
                )}
              />
              {isEditMode && <p className="text-xs text-muted-foreground">Editing by percentage is disabled. Please edit the share count directly.</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Controller name="type" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="type"><SelectValue placeholder="Select..."/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Founder">Founder</SelectItem>
                                <SelectItem value="Investor">Investor</SelectItem>
                                <SelectItem value="ESOP">ESOP</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                    {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="value">{inputType === 'shares' ? 'Number of Shares' : 'Percentage (%)'}</Label>
                    <Controller name="value" control={control} render={({ field }) => <Input id="value" type="number" {...field} step="any" />} />
                    {errors.value && <p className="text-sm text-destructive">{errors.value.message}</p>}
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="grantDate">Grant / Issue Date</Label>
                <Controller name="grantDate" control={control} render={({ field }) => <Input id="grantDate" type="date" {...field} />} />
                {errors.grantDate && <p className="text-sm text-destructive">{errors.grantDate.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="vesting">Vesting Details</Label>
                <Controller name="vesting" control={control} render={({ field }) => <Textarea id="vesting" placeholder="e.g., 4-year vest, 1-year cliff" {...field} />} />
                {errors.vesting && <p className="text-sm text-destructive">{errors.vesting.message}</p>}
            </div>
             {type === 'Investor' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="investmentAmount">Investment Amount</Label>
                        <Controller name="investmentAmount" control={control} render={({ field }) => <Input id="investmentAmount" type="number" placeholder="e.g. 5000000" {...field} />} />
                        {errors.investmentAmount && <p className="text-sm text-destructive">{errors.investmentAmount.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="valuation">Post-Money Valuation</Label>
                        <Controller name="valuation" control={control} render={({ field }) => <Input id="valuation" type="number" placeholder="e.g. 100000000" {...field} />} />
                        {errors.valuation && <p className="text-sm text-destructive">{errors.valuation.message}</p>}
                    </div>
                </div>
              </>
            )}
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {isEditMode ? "Save Changes" : "Add Issuance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
