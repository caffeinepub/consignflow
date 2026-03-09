import DateRangeFilter from "@/components/DateRangeFilter";
import LineItemsEditor, { type LineItem } from "@/components/LineItemsEditor";
import RepSelect from "@/components/RepSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  useAddConsignment,
  useClosedSettlementPeriods,
  useConsignments,
  useProducts,
  useReps,
} from "@/hooks/useQueries";
import { downloadCSV, formatDate, generateCSV } from "@/lib/csv";
import { checkSettlementLock } from "@/lib/settlementLock";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Download, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ConsignmentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [repId, setRepId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<LineItem[]>([
    { productId: "", quantity: "1" },
  ]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { data: consignments = [], isLoading } = useConsignments();
  const { data: reps = [] } = useReps();
  const { data: products = [] } = useProducts();
  const { data: closedPeriods = [] } = useClosedSettlementPeriods();
  const addConsignment = useAddConsignment();

  const lockCheck = checkSettlementLock(new Date(date), closedPeriods);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repId) {
      toast.error("Please select a rep");
      return;
    }
    if (
      items.length === 0 ||
      items.some((item) => !item.productId || !item.quantity)
    ) {
      toast.error("Please add at least one complete line item");
      return;
    }
    if (lockCheck.isLocked) {
      toast.error("Cannot add consignment in closed settlement period");
      return;
    }
    try {
      const timestamp = BigInt(new Date(date).getTime() * 1_000_000);
      for (const item of items) {
        await addConsignment.mutateAsync({
          repId: BigInt(repId),
          productId: BigInt(item.productId),
          quantity: BigInt(item.quantity),
          date: timestamp,
        });
      }
      toast.success("Consignment added successfully");
      setRepId("");
      setDate(new Date().toISOString().split("T")[0]);
      setItems([{ productId: "", quantity: "1" }]);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to add consignment");
      console.error(error);
    }
  };

  const exportConsignments = () => {
    const headers = ["Rep", "Product", "Quantity", "Date"];
    const rows = filteredConsignments.map((c) => [
      reps[Number(c.repId)]?.name || "Unknown",
      products[Number(c.productId)]?.name || "Unknown",
      Number(c.quantity),
      formatDate(c.date),
    ]);
    downloadCSV("consignments.csv", generateCSV(headers, rows));
  };

  const filteredConsignments = consignments.filter((c) => {
    const d = new Date(Number(c.date) / 1_000_000);
    return (!startDate || d >= startDate) && (!endDate || d <= endDate);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consignments</h1>
          <p className="text-muted-foreground">
            Track inventory consigned to reps
          </p>
        </div>
        <div className="flex gap-2">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={exportConsignments}
            disabled={filteredConsignments.length === 0}
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Consignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Consignment</DialogTitle>
                <DialogDescription>
                  Record items consigned to a rep
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rep">Rep</Label>
                    <RepSelect value={repId} onValueChange={setRepId} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
                {lockCheck.isLocked && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {lockCheck.message}{" "}
                      <Link to="/adjustments" className="font-medium underline">
                        Go to Adjustments
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}
                <LineItemsEditor items={items} onChange={setItems} />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addConsignment.isPending || lockCheck.isLocked}
                  >
                    {addConsignment.isPending ? "Adding..." : "Add Consignment"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Consignments</CardTitle>
          <CardDescription>
            Complete history of consigned inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading consignments...
            </div>
          ) : filteredConsignments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                No consignments found. Add your first consignment to start
                tracking inventory.
              </p>
              <p className="text-xs text-muted-foreground italic">
                Consignment clarity, in a single pane.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rep</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsignments.map((consignment, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: no unique ID available
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {reps[Number(consignment.repId)]?.name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {products[Number(consignment.productId)]?.name ||
                        "Unknown"}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(consignment.quantity)}
                    </TableCell>
                    <TableCell>{formatDate(consignment.date)}</TableCell>
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
