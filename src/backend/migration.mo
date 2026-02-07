import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  public func run(old : {
    products : Map.Map<Nat, { name : Text; price : Nat64 }>;
    reps : Map.Map<Nat, { name : Text }>;
    consignments : Map.Map<Nat, { repId : Nat; productId : Nat; quantity : Nat; date : Int }>;
    sales : Map.Map<Nat, { repId : Nat; productId : Nat; quantity : Nat; unitPrice : Nat64; date : Int }>;
    returns : Map.Map<Nat, { repId : Nat; productId : Nat; quantity : Nat; date : Int }>;
    payouts : Map.Map<Nat, { repId : Nat; amount : Nat64; date : Int; notes : Text }>;
    nextProductId : Nat;
    nextRepId : Nat;
    nextConsignmentId : Nat;
    nextSaleId : Nat;
    nextReturnId : Nat;
    nextPayoutId : Nat;
  }) : {
    products : Map.Map<Nat, { name : Text; price : Nat64 }>;
    reps : Map.Map<Nat, { name : Text }>;
    consignments : Map.Map<Nat, { repId : Nat; productId : Nat; quantity : Nat; date : Int }>;
    sales : Map.Map<Nat, { repId : Nat; productId : Nat; quantity : Nat; unitPrice : Nat64; date : Int }>;
    returns : Map.Map<Nat, { repId : Nat; productId : Nat; quantity : Nat; date : Int }>;
    payouts : Map.Map<Nat, { repId : Nat; amount : Nat64; date : Int; notes : Text }>;
    adjustments : Map.Map<Nat, { repId : Nat; amount : Nat64; date : Int; notes : Text }>;
    settlements : Map.Map<
      Nat,
      {
        id : Nat;
        startDate : Int;
        endDate : Int;
        status : { #open; #closed };
        openingBalances : Map.Map<Nat, { consignmentValue : Nat64; salesValue : Nat64; returnsValue : Nat64; payoutValue : Nat64; adjustmentValue : Nat64; finalBalance : Nat64 }>;
        closingBalances : Map.Map<Nat, { consignmentValue : Nat64; salesValue : Nat64; returnsValue : Nat64; payoutValue : Nat64; adjustmentValue : Nat64; finalBalance : Nat64 }>;
        statementIds : [Nat];
      }
    >;
    nextProductId : Nat;
    nextRepId : Nat;
    nextConsignmentId : Nat;
    nextSaleId : Nat;
    nextReturnId : Nat;
    nextPayoutId : Nat;
    nextAdjustmentId : Nat;
    nextSettlementId : Nat;
  } {
    {
      old with
      adjustments = Map.empty<Nat, { repId : Nat; amount : Nat64; date : Int; notes : Text }>();
      settlements = Map.empty<Nat, {
        id : Nat;
        startDate : Int;
        endDate : Int;
        status : { #open; #closed };
        openingBalances : Map.Map<Nat, { consignmentValue : Nat64; salesValue : Nat64; returnsValue : Nat64; payoutValue : Nat64; adjustmentValue : Nat64; finalBalance : Nat64 }>;
        closingBalances : Map.Map<Nat, { consignmentValue : Nat64; salesValue : Nat64; returnsValue : Nat64; payoutValue : Nat64; adjustmentValue : Nat64; finalBalance : Nat64 }>;
        statementIds : [Nat];
      }>();
      nextAdjustmentId = 0;
      nextSettlementId = 0;
    };
  };
};
