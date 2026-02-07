import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/useQueries';

interface ProductSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export default function ProductSelect({ value, onValueChange, placeholder = 'Select product' }: ProductSelectProps) {
  const { data: products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {products?.map((product, index) => (
          <SelectItem key={index} value={String(index)}>
            {product.name} - ${(Number(product.price) / 100).toFixed(2)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
