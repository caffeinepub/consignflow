import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Migration "migration";

(with migration = Migration.run)
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

  type SettlementPeriod = {
    id : Nat;
    startDate : Timestamp;
    endDate : Timestamp;
    status : SettlementStatus;
    openingBalances : Map.Map<Nat, RepBalance>;
    closingBalances : Map.Map<Nat, RepBalance>;
    statementIds : [Nat];
  };

  type RepBalance = {
    consignmentValue : Nat64;
    salesValue : Nat64;
    returnsValue : Nat64;
    payoutValue : Nat64;
    adjustmentValue : Nat64;
    finalBalance : Nat64;
  };

  type SettlementStatus = {
    #open;
    #closed;
  };

  type Adjustment = {
    repId : Nat;
    amount : Nat64;
    date : Timestamp;
    notes : Text;
  };

  // API records (Immutable Views)
  public type SettlementPeriodView = {
    id : Nat;
    startDate : Timestamp;
    endDate : Timestamp;
    status : SettlementStatus;
    openingBalances : [(Nat, RepBalance)];
    closingBalances : [(Nat, RepBalance)];
    statementIds : [Nat];
  };

  let products = Map.empty<Nat, Product>();
  let reps = Map.empty<Nat, Rep>();
  let consignments = Map.empty<Nat, Consignment>();
  let sales = Map.empty<Nat, Sale>();
  let returns = Map.empty<Nat, ReturnModel>();
  let payouts = Map.empty<Nat, Payout>();
  let settlements = Map.empty<Nat, SettlementPeriod>();
  let adjustments = Map.empty<Nat, Adjustment>();

  var nextProductId = 0;
  var nextRepId = 0;
  var nextConsignmentId = 0;
  var nextSaleId = 0;
  var nextReturnId = 0;
  var nextPayoutId = 0;
  var nextSettlementId = 0;
  var nextAdjustmentId = 0;

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
    products.toArray().map(func((_, product)) { product : Product });
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
    reps.toArray().map(func((_, rep)) { rep : Rep });
  };

  // Consignment CRUD
  public shared ({ caller }) func addConsignment(repId : Nat, productId : Nat, quantity : Nat, date : Timestamp) : async Nat {
    enforceSettlementLock(date, "Cannot add consignment in closed settlement period");
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
    consignments.toArray().map(func((_, consignment)) { consignment : Consignment });
  };

  // Sale CRUD
  public shared ({ caller }) func addSale(repId : Nat, productId : Nat, quantity : Nat, unitPrice : Nat64, date : Timestamp) : async Nat {
    enforceSettlementLock(date, "Cannot add sale in closed settlement period");
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
    sales.toArray().map(func((_, sale)) { sale : Sale });
  };

  // Return CRUD
  public shared ({ caller }) func addReturn(repId : Nat, productId : Nat, quantity : Nat, date : Timestamp) : async Nat {
    enforceSettlementLock(date, "Cannot add return in closed settlement period");
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
    returns.toArray().map(func((_, returnModel)) { returnModel : ReturnModel });
  };

  // Payout CRUD
  public shared ({ caller }) func addPayout(repId : Nat, amount : Nat64, date : Timestamp, notes : Text) : async Nat {
    enforceSettlementLock(date, "Cannot add payout in closed settlement period");
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
    payouts.toArray().map(func((_, payout)) { payout : Payout });
  };

  // Adjustment CRUD
  public shared ({ caller }) func addAdjustment(repId : Nat, amount : Nat64, date : Timestamp, notes : Text) : async Nat {
    enforceAdjustmentWindow(date);
    let id = nextAdjustmentId;
    adjustments.add(
      id,
      {
        repId;
        amount;
        date;
        notes;
      },
    );
    nextAdjustmentId += 1;
    id;
  };

  public query ({ caller }) func getAdjustment(id : Nat) : async Adjustment {
    switch (adjustments.get(id)) {
      case (null) { Runtime.trap("Adjustment does not exist") };
      case (?adjustment) { adjustment };
    };
  };

  public query ({ caller }) func getAllAdjustments() : async [Adjustment] {
    adjustments.toArray().map(func((_, adjustment)) { adjustment : Adjustment });
  };

  // Filtering by rep
  public query ({ caller }) func getConsignmentsByRep(repId : Nat) : async [Consignment] {
    consignments.toArray().map(func((_, consignment)) { consignment : Consignment }).filter(func(c) { c.repId == repId });
  };

  public query ({ caller }) func getSalesByRep(repId : Nat) : async [Sale] {
    sales.toArray().map(func((_, sale)) { sale }).filter(func(s) { s.repId == repId });
  };

  public query ({ caller }) func getReturnsByRep(repId : Nat) : async [ReturnModel] {
    returns.toArray().map(func((_, returnModel)) { returnModel : ReturnModel }).filter(func(r) { r.repId == repId });
  };

  public query ({ caller }) func getPayoutsByRep(repId : Nat) : async [Payout] {
    payouts.toArray().map(func((_, payout)) { payout : Payout }).filter(func(p) { p.repId == repId });
  };

  public query ({ caller }) func getAdjustmentsByRep(repId : Nat) : async [Adjustment] {
    adjustments.toArray().map(func((_, adjustment)) { adjustment : Adjustment }).filter(func(a) { a.repId == repId });
  };

  // Settlement Period CRUD
  public shared ({ caller }) func createSettlementPeriod(startDate : Timestamp, endDate : Timestamp) : async Nat {
    if (startDate >= endDate) {
      Runtime.trap("Start date must be before end date");
    };

    let id = nextSettlementId;
    let period : SettlementPeriod = {
      id;
      startDate;
      endDate;
      status = #open;
      openingBalances = Map.empty<Nat, RepBalance>();
      closingBalances = Map.empty<Nat, RepBalance>();
      statementIds = [];
    };
    settlements.add(id, period);
    nextSettlementId += 1;
    id;
  };

  public shared ({ caller }) func closeSettlementPeriod(settlementId : Nat) : async () {
    let period = switch (settlements.get(settlementId)) {
      case (null) { Runtime.trap("Settlement period does not exist") };
      case (?period) { period };
    };

    if (period.status == #closed) {
      Runtime.trap("Settlement period is already closed");
    };

    let closingBalances = calculateAllRepBalancesForPeriod(period.startDate, period.endDate);

    // Carry over balances to next period if exists
    let nextPeriodOpt = findNextOpenPeriod(period.endDate);
    switch (nextPeriodOpt) {
      case (?nextPeriod) {
        for ((repId, balance) in closingBalances.entries()) {
          nextPeriod.openingBalances.add(repId, balance);
        };
      };
      case (null) {};
    };

    let closedPeriod : SettlementPeriod = {
      period with
      status = #closed;
      closingBalances;
    };

    settlements.add(settlementId, closedPeriod);
  };

  public query ({ caller }) func getSettlementPeriod(id : Nat) : async SettlementPeriodView {
    switch (settlements.get(id)) {
      case (null) { Runtime.trap("Settlement period does not exist") };
      case (?period) { toSettlementPeriodView(period) };
    };
  };

  public query ({ caller }) func getAllSettlementPeriods() : async [SettlementPeriodView] {
    settlements.values().toArray().map(toSettlementPeriodView);
  };

  public query ({ caller }) func getSettlementPeriodsByStatus(status : SettlementStatus) : async [SettlementPeriodView] {
    settlements.values().toArray().map(toSettlementPeriodView).filter(func(s) { s.status == status });
  };

  public query ({ caller }) func getSettlementPeriodsForRep(repId : Nat) : async [SettlementPeriodView] {
    let allPeriods = settlements.values().toArray().map(toSettlementPeriodView);
    let validPeriods = allPeriods.filter(
      func(period) {
        switch (period.status) {
          case (#open) {
            period.openingBalances.find(func((key, _)) { key == repId }) != null or period.closingBalances.find(func((key, _)) { key == repId }) != null;
          };
          case (#closed) {
            period.openingBalances.find(func((key, _)) { key == repId }) != null or period.closingBalances.find(
              func((key, _)) { key == repId }
            ) != null;
          };
        };
      }
    );
    validPeriods;
  };

  // Conversion helpers
  func toSettlementPeriodView(period : SettlementPeriod) : SettlementPeriodView {
    {
      period with
      openingBalances = period.openingBalances.toArray();
      closingBalances = period.closingBalances.toArray();
    };
  };

  // Helper Functions
  func enforceSettlementLock(date : Timestamp, errorMessage : Text) {
    switch (findSettlementPeriodForDate(date)) {
      case (?period) {
        if (period.status == #closed) {
          Runtime.trap(errorMessage);
        };
      };
      case (null) {};
    };
  };

  func enforceAdjustmentWindow(date : Timestamp) {
    switch (findSettlementPeriodForDate(date)) {
      case (?period) {
        if (period.status != #closed) {
          Runtime.trap("Adjustments can only be made within a closed settlement period");
        };
      };
      case (null) { Runtime.trap("No settlement period found for adjustment date") };
    };
  };

  func findSettlementPeriodForDate(date : Timestamp) : ?SettlementPeriod {
    for ((_, period) in settlements.entries()) {
      if (date >= period.startDate and date <= period.endDate) {
        return ?period;
      };
    };
    null;
  };

  func findNextOpenPeriod(afterDate : Timestamp) : ?SettlementPeriod {
    let filtered = settlements.values().toArray().filter(
      func(p) {
        p.startDate > afterDate and p.status == #open
      }
    );
    if (filtered.size() > 0) { ?filtered[0] } else { null };
  };

  func calculateAllRepBalancesForPeriod(startDate : Timestamp, endDate : Timestamp) : Map.Map<Nat, RepBalance> {
    let repMap = Map.empty<Nat, RepBalance>();
    let repEntries = reps.toArray();

    for ((repId, _) in repEntries.values()) {
      let consignmentValue = calculateTotalConsignmentValue(repId, startDate, endDate);
      let salesValue = calculateTotalSalesValue(repId, startDate, endDate);
      let returnsValue = calculateTotalReturnsValue(repId, startDate, endDate);
      let payoutValue = calculateTotalPayoutValue(repId, startDate, endDate);
      let adjustmentValue = calculateTotalAdjustmentValue(repId, startDate, endDate);

      let repBalance : RepBalance = {
        consignmentValue;
        salesValue;
        returnsValue;
        payoutValue;
        adjustmentValue;
        finalBalance = consignmentValue + salesValue - returnsValue - payoutValue + adjustmentValue;
      };
      repMap.add(repId, repBalance);
    };

    repMap;
  };

  func calculateTotalConsignmentValue(repId : Nat, startDate : Timestamp, endDate : Timestamp) : Nat64 {
    consignments.toArray().filter(
      func((_, c)) {
        c.repId == repId and c.date >= startDate and c.date <= endDate
      }
    ).foldLeft<(Nat, Consignment), Nat64>(
      0,
      func(acc, (_, c)) {
        let product = switch (products.get(c.productId)) {
          case (null) { Runtime.trap("Product not found for consignment") };
          case (?product) { product };
        };
        acc + (product.price * Nat64.fromNat(c.quantity));
      },
    );
  };

  func calculateTotalSalesValue(repId : Nat, startDate : Timestamp, endDate : Timestamp) : Nat64 {
    sales.toArray().filter(
      func((_, s)) {
        s.repId == repId and s.date >= startDate and s.date <= endDate
      }
    ).foldLeft<(Nat, Sale), Nat64>(
      0,
      func(acc, (_, s)) {
        acc + (s.unitPrice * Nat64.fromNat(s.quantity));
      },
    );
  };

  func calculateTotalReturnsValue(repId : Nat, startDate : Timestamp, endDate : Timestamp) : Nat64 {
    returns.toArray().filter(
      func((_, r)) {
        r.repId == repId and r.date >= startDate and r.date <= endDate
      }
    ).foldLeft<(Nat, ReturnModel), Nat64>(
      0,
      func(acc, _) {
        acc : Nat64;
      },
    );
  };

  func calculateTotalPayoutValue(repId : Nat, startDate : Timestamp, endDate : Timestamp) : Nat64 {
    payouts.toArray().filter(
      func((_, p)) {
        p.repId == repId and p.date >= startDate and p.date <= endDate
      }
    ).foldLeft<(Nat, Payout), Nat64>(
      0,
      func(acc, (_, p)) {
        acc + p.amount;
      },
    );
  };

  func calculateTotalAdjustmentValue(repId : Nat, startDate : Timestamp, endDate : Timestamp) : Nat64 {
    adjustments.toArray().filter(
      func((_, a)) {
        a.repId == repId and a.date >= startDate and a.date <= endDate
      }
    ).foldLeft<(Nat, Adjustment), Nat64>(
      0,
      func(acc, (_, a)) {
        acc + a.amount;
      },
    );
  };
};
