import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Download, Search } from 'lucide-react';
import { useReps, useAddRep } from '@/hooks/useQueries';
import { generateCSV, downloadCSV } from '@/lib/csv';
import { getCommissionSettings } from '@/lib/commissionSettings';
import { toast } from 'sonner';

export default function RepsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reps = [], isLoading } = useReps();
  const addRep = useAddRep();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Rep name is required');
      return;
    }

    try {
      await addRep.mutateAsync({ name: name.trim() });
      toast.success('Rep added successfully');
      setName('');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add rep');
      console.error(error);
    }
  };

  const exportReps = () => {
    const settings = getCommissionSettings();
    const headers = ['Name', 'Commission Rate (%)'];
    const rows = reps.map((r, index) => [
      r.name,
      settings.repOverrides[index] ?? settings.defaultCommission,
    ]);
    const csv = generateCSV(headers, rows);
    downloadCSV('reps.csv', csv);
  };

  const filteredReps = reps.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Reps</h1>
          <p className="text-muted-foreground">Manage your sales representatives</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportReps} disabled={reps.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Rep
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Rep</DialogTitle>
                <DialogDescription>Enter the rep details below</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rep Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter rep name"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addRep.isPending}>
                    {addRep.isPending ? 'Adding...' : 'Add Rep'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reps</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading reps...</div>
          ) : filteredReps.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {searchTerm ? 'No reps match your search.' : 'No reps yet. Add your first rep to get started.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReps.map((rep, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{rep.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
