
"use client";

import { useForm, Controller } from "react-hook-form";
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
import { useEffect } from "react";

const entrySchema = z.object({
  holder: z.string().min(2, "Shareholder name is required."),
  type: z.enum(["Founder", "Investor", "ESOP"], { required_error: "Please select a type." }),
  shares: z.coerce.number().min(1, "Number of shares must be at least 1."),
  grantDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  vesting: z.string().min(3, "Vesting details are required."),
});

type FormData = z.infer<typeof entrySchema>;

interface CapTableModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (entry: Omit<CapTableEntry, 'id'> & { id?: string }) => void;
  entryToEdit?: CapTableEntry | null;
}

export function CapTableModal({ isOpen, onOpenChange, onSave, entryToEdit }: CapTableModalProps) {
  const isEditMode = !!entryToEdit;

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      holder: "",
      type: undefined,
      shares: 0,
      grantDate: "",
      vesting: "",
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        reset(entryToEdit);
      } else {
        reset({
            holder: "",
            type: undefined,
            shares: 0,
            grantDate: "",
            vesting: "",
        });
      }
    }
  }, [isOpen, entryToEdit, isEditMode, reset]);

  const onSubmit = (data: FormData) => {
    onSave({ ...data, id: entryToEdit?.id });
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
                    <Label htmlFor="shares">Number of Shares</Label>
                    <Controller name="shares" control={control} render={({ field }) => <Input id="shares" type="number" {...field} />} />
                    {errors.shares && <p className="text-sm text-destructive">{errors.shares.message}</p>}
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
