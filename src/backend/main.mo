import Map "mo:core/Map";
import Nat64 "mo:core/Nat64";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

actor {
  type Timestamp = Int;

  type Product = {
    name : Text;
    price : Nat64;
  };

  type Rep = {
    name : Text;
  };

  type Consignment = {
    repId : Nat;
    productId : Nat;
    quantity : Nat;
    date : Timestamp;
  };

  type Sale = {
    repId : Nat;
    productId : Nat;
    quantity : Nat;
    unitPrice : Nat64;
    date : Timestamp;
  };

  type ReturnModel = {
    repId : Nat;
    productId : Nat;
    quantity : Nat;
    date : Timestamp;
  };

  type Payout = {
    repId : Nat;
    amount : Nat64;
    date : Timestamp;
    notes : Text;
  };

  let products = Map.empty<Nat, Product>();
  let reps = Map.empty<Nat, Rep>();
  let consignments = Map.empty<Nat, Consignment>();
  let sales = Map.empty<Nat, Sale>();
  let returns = Map.empty<Nat, ReturnModel>();
  let payouts = Map.empty<Nat, Payout>();

  var nextProductId = 0;
  var nextRepId = 0;
  var nextConsignmentId = 0;
  var nextSaleId = 0;
  var nextReturnId = 0;
  var nextPayoutId = 0;

  // Product CRUD
  public shared ({ caller }) func addProduct(name : Text, price : Nat64) : async Nat {
    let id = nextProductId;
    products.add(id, { name; price });
    nextProductId += 1;
    id;
  };

  public query ({ caller }) func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  // Rep CRUD
  public shared ({ caller }) func addRep(name : Text) : async Nat {
    let id = nextRepId;
    reps.add(id, { name });
    nextRepId += 1;
    id;
  };

  public query ({ caller }) func getRep(id : Nat) : async Rep {
    switch (reps.get(id)) {
      case (null) { Runtime.trap("Rep does not exist") };
      case (?rep) { rep };
    };
  };

  public query ({ caller }) func getAllReps() : async [Rep] {
    reps.values().toArray();
  };

  // Consignment CRUD
  public shared ({ caller }) func addConsignment(repId : Nat, productId : Nat, quantity : Nat, date : Timestamp) : async Nat {
    let id = nextConsignmentId;
    consignments.add(
      id,
      {
        repId;
        productId;
        quantity;
        date;
      },
    );
    nextConsignmentId += 1;
    id;
  };

  public query ({ caller }) func getConsignment(id : Nat) : async Consignment {
    switch (consignments.get(id)) {
      case (null) { Runtime.trap("Consignment does not exist") };
      case (?consignment) { consignment };
    };
  };

  public query ({ caller }) func getAllConsignments() : async [Consignment] {
    consignments.values().toArray();
  };

  // Sale CRUD
  public shared ({ caller }) func addSale(repId : Nat, productId : Nat, quantity : Nat, unitPrice : Nat64, date : Timestamp) : async Nat {
    let id = nextSaleId;
    sales.add(
      id,
      {
        repId;
        productId;
        quantity;
        unitPrice;
        date;
      },
    );
    nextSaleId += 1;
    id;
  };

  public query ({ caller }) func getSale(id : Nat) : async Sale {
    switch (sales.get(id)) {
      case (null) { Runtime.trap("Sale does not exist") };
      case (?sale) { sale };
    };
  };

  public query ({ caller }) func getAllSales() : async [Sale] {
    sales.values().toArray();
  };

  // Return CRUD
  public shared ({ caller }) func addReturn(repId : Nat, productId : Nat, quantity : Nat, date : Timestamp) : async Nat {
    let id = nextReturnId;
    returns.add(
      id,
      {
        repId;
        productId;
        quantity;
        date;
      },
    );
    nextReturnId += 1;
    id;
  };

  public query ({ caller }) func getReturn(id : Nat) : async ReturnModel {
    switch (returns.get(id)) {
      case (null) { Runtime.trap("Return does not exist") };
      case (?returnEntry) { returnEntry };
    };
  };

  public query ({ caller }) func getAllReturns() : async [ReturnModel] {
    returns.values().toArray();
  };

  // Payout CRUD
  public shared ({ caller }) func addPayout(repId : Nat, amount : Nat64, date : Timestamp, notes : Text) : async Nat {
    let id = nextPayoutId;
    payouts.add(
      id,
      {
        repId;
        amount;
        date;
        notes;
      },
    );
    nextPayoutId += 1;
    id;
  };

  public query ({ caller }) func getPayout(id : Nat) : async Payout {
    switch (payouts.get(id)) {
      case (null) { Runtime.trap("Payout does not exist") };
      case (?payout) { payout };
    };
  };

  public query ({ caller }) func getAllPayouts() : async [Payout] {
    payouts.values().toArray();
  };

  // Filter functions
  public query ({ caller }) func getConsignmentsByRep(repId : Nat) : async [Consignment] {
    consignments.values().toArray().filter(func(c) { c.repId == repId });
  };

  public query ({ caller }) func getSalesByRep(repId : Nat) : async [Sale] {
    sales.values().toArray().filter(func(s) { s.repId == repId });
  };

  public query ({ caller }) func getReturnsByRep(repId : Nat) : async [ReturnModel] {
    returns.values().toArray().filter(func(r) { r.repId == repId });
  };

  public query ({ caller }) func getPayoutsByRep(repId : Nat) : async [Payout] {
    payouts.values().toArray().filter(func(p) { p.repId == repId });
  };
};
