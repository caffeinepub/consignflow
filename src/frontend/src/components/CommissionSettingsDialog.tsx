import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCommissionSettings, setDefaultCommission, setRepCommissionOverride } from '@/lib/commissionSettings';
import { useReps } from '@/hooks/useQueries';
import { toast } from 'sonner';

interface CommissionSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommissionSettingsDialog({ open, onOpenChange }: CommissionSettingsDialogProps) {
  const { data: reps = [] } = useReps();
  const [defaultRate, setDefaultRate] = useState('30');
  const [overrides, setOverrides] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open) {
      const settings = getCommissionSettings();
      setDefaultRate(String(settings.defaultCommission));
      const overrideMap: Record<number, string> = {};
      Object.entries(settings.repOverrides).forEach(([repId, rate]) => {
        overrideMap[Number(repId)] = String(rate);
      });
      setOverrides(overrideMap);
    }
  }, [open]);

  const handleSave = () => {
    const rate = parseFloat(defaultRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Default commission must be between 0 and 100');
      return;
    }

    setDefaultCommission(rate);

    Object.entries(overrides).forEach(([repId, value]) => {
      const overrideRate = value ? parseFloat(value) : null;
      if (overrideRate !== null && (isNaN(overrideRate) || overrideRate < 0 || overrideRate > 100)) {
        toast.error(`Invalid commission rate for rep ${repId}`);
        return;
      }
      setRepCommissionOverride(Number(repId), overrideRate);
    });

    toast.success('Commission settings saved');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Commission Settings</DialogTitle>
          <DialogDescription>Configure default commission rate and per-rep overrides</DialogDescription>
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
                    <TableRow key={index}>
                      <TableCell className="font-medium">{rep.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder={`Default (${defaultRate}%)`}
                          value={overrides[index] || ''}
                          onChange={(e) => setOverrides({ ...overrides, [index]: e.target.value })}
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
