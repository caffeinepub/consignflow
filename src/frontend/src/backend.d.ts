import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface Payout {
    date: Timestamp;
    notes: string;
    amount: bigint;
    repId: bigint;
}
export interface Consignment {
    date: Timestamp;
    productId: bigint;
    quantity: bigint;
    repId: bigint;
}
export interface Rep {
    name: string;
}
export interface Sale {
    date: Timestamp;
    productId: bigint;
    quantity: bigint;
    unitPrice: bigint;
    repId: bigint;
}
export interface ReturnModel {
    date: Timestamp;
    productId: bigint;
    quantity: bigint;
    repId: bigint;
}
export interface Product {
    name: string;
    price: bigint;
}
export interface backendInterface {
    addConsignment(repId: bigint, productId: bigint, quantity: bigint, date: Timestamp): Promise<bigint>;
    addPayout(repId: bigint, amount: bigint, date: Timestamp, notes: string): Promise<bigint>;
    addProduct(name: string, price: bigint): Promise<bigint>;
    addRep(name: string): Promise<bigint>;
    addReturn(repId: bigint, productId: bigint, quantity: bigint, date: Timestamp): Promise<bigint>;
    addSale(repId: bigint, productId: bigint, quantity: bigint, unitPrice: bigint, date: Timestamp): Promise<bigint>;
    getAllConsignments(): Promise<Array<Consignment>>;
    getAllPayouts(): Promise<Array<Payout>>;
    getAllProducts(): Promise<Array<Product>>;
    getAllReps(): Promise<Array<Rep>>;
    getAllReturns(): Promise<Array<ReturnModel>>;
    getAllSales(): Promise<Array<Sale>>;
    getConsignment(id: bigint): Promise<Consignment>;
    getConsignmentsByRep(repId: bigint): Promise<Array<Consignment>>;
    getPayout(id: bigint): Promise<Payout>;
    getPayoutsByRep(repId: bigint): Promise<Array<Payout>>;
    getProduct(id: bigint): Promise<Product>;
    getRep(id: bigint): Promise<Rep>;
    getReturn(id: bigint): Promise<ReturnModel>;
    getReturnsByRep(repId: bigint): Promise<Array<ReturnModel>>;
    getSale(id: bigint): Promise<Sale>;
    getSalesByRep(repId: bigint): Promise<Array<Sale>>;
}
