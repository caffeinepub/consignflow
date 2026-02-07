import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, Rep, Consignment, Sale, ReturnModel, Payout } from '../backend';

// Products
export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, price }: { name: string; price: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addProduct(name, price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Reps
export function useReps() {
  const { actor, isFetching } = useActor();
  return useQuery<Rep[]>({
    queryKey: ['reps'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReps();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddRep() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addRep(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reps'] });
    },
  });
}

// Consignments
export function useConsignments() {
  const { actor, isFetching } = useActor();
  return useQuery<Consignment[]>({
    queryKey: ['consignments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllConsignments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddConsignment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ repId, productId, quantity, date }: { repId: bigint; productId: bigint; quantity: bigint; date: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addConsignment(repId, productId, quantity, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consignments'] });
    },
  });
}

// Sales
export function useSales() {
  const { actor, isFetching } = useActor();
  return useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSales();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSale() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ repId, productId, quantity, unitPrice, date }: { repId: bigint; productId: bigint; quantity: bigint; unitPrice: bigint; date: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addSale(repId, productId, quantity, unitPrice, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}

// Returns
export function useReturns() {
  const { actor, isFetching } = useActor();
  return useQuery<ReturnModel[]>({
    queryKey: ['returns'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReturns();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddReturn() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ repId, productId, quantity, date }: { repId: bigint; productId: bigint; quantity: bigint; date: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addReturn(repId, productId, quantity, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
    },
  });
}

// Payouts
export function usePayouts() {
  const { actor, isFetching } = useActor();
  return useQuery<Payout[]>({
    queryKey: ['payouts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayouts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPayout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ repId, amount, date, notes }: { repId: bigint; amount: bigint; date: bigint; notes: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addPayout(repId, amount, date, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
  });
}
