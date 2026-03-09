import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useReps } from "@/hooks/useQueries";
import {
  getCommissionSettings,
  setDefaultCommission,
  setRepCommissionOverride,
} from "@/lib/commissionSettings";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CommissionSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommissionSettingsDialog({
  open,
  onOpenChange,
}: CommissionSettingsDialogProps) {
  const { data: reps = [] } = useReps();
  const [defaultRate, setDefaultRate] = useState("30");
  const [overrides, setOverrides] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open) {
      const settings = getCommissionSettings();
      setDefaultRate(String(settings.defaultCommission));
      const overrideMap: Record<number, string> = {};
      for (const [repId, rate] of Object.entries(settings.repOverrides)) {
        overrideMap[Number(repId)] = String(rate);
      }
      setOverrides(overrideMap);
    }
  }, [open]);

  const handleSave = () => {
    const rate = Number.parseFloat(defaultRate);
    if (Number.isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("Default commission must be between 0 and 100");
      return;
    }

    setDefaultCommission(rate);

    for (const [repId, value] of Object.entries(overrides)) {
      const overrideRate = value ? Number.parseFloat(value) : null;
      if (
        overrideRate !== null &&
        (Number.isNaN(overrideRate) || overrideRate < 0 || overrideRate > 100)
      ) {
        toast.error(`Invalid commission rate for rep ${repId}`);
        return;
      }
      setRepCommissionOverride(Number(repId), overrideRate);
    }

    toast.success("Commission settings saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Commission Settings</DialogTitle>
          <DialogDescription>
            Configure default commission rate and per-rep overrides
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="default-rate">Default Commission Rate (%)</Label>
            <Input
              id="default-rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={defaultRate}
              onChange={(e) => setDefaultRate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Rep-Specific Overrides</Label>
            {reps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reps available</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rep</TableHead>
                    <TableHead>Commission Rate (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reps.map((rep, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: index is the rep identifier
                    <TableRow key={index}>
                      <TableCell className="font-medium">{rep.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder={`Default (${defaultRate}%)`}
                          value={overrides[index] || ""}
                          onChange={(e) =>
                            setOverrides({
                              ...overrides,
                              [index]: e.target.value,
                            })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
