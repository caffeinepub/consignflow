import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReps } from '@/hooks/useQueries';

interface RepSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export default function RepSelect({ value, onValueChange, placeholder = 'Select rep' }: RepSelectProps) {
  const { data: reps, isLoading } = useReps();

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
        {reps?.map((rep, index) => (
          <SelectItem key={index} value={String(index)}>
            {rep.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
