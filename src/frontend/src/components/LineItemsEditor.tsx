import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import ProductSelect from './ProductSelect';

export interface LineItem {
  productId: string;
  quantity: string;
  unitPrice?: string;
}

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  showUnitPrice?: boolean;
}

export default function LineItemsEditor({ items, onChange, showUnitPrice = false }: LineItemsEditorProps) {
  const addItem = () => {
    onChange([...items, { productId: '', quantity: '1', unitPrice: showUnitPrice ? '' : undefined }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Line Items</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No items added. Click "Add Item" to get started.
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex gap-3 rounded-lg border border-border p-4">
            <div className="flex-1 space-y-3">
              <div>
                <Label className="text-xs">Product</Label>
                <ProductSelect value={item.productId} onValueChange={(value) => updateItem(index, 'productId', value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    placeholder="0"
                  />
                </div>
                {showUnitPrice && (
                  <div>
                    <Label className="text-xs">Unit Price ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="mt-6">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
