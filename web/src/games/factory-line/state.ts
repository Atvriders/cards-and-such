import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_SHIFTS = 24; // 24 production shifts (8-hour shifts, 3 per day x 8 days)

export type Product = "widget" | "gear" | "circuit" | "spring";
export type Phase = "plan" | "results" | "done";

export interface FactoryState {
  rngSeed: number;
  shift: number;
  cash: number;
  phase: Phase;
  activeProduct: Product;
  workers: number;         // 2-10 workers ($30/shift each)
  machineLevel: number;    // 0-4 upgrades ($100 each), boosts output per worker
  qualityControl: boolean; // costs $40/shift but reduces defects and improves sell price
  orderSize: number;       // units to fill (from a contract): 50-200
  contractPrice: number;   // price per unit for this order
  unitsProduced: number;   // accumulated toward order
  ordersFilled: number;    // completed orders
  lastOutput: number;
  lastDefects: number;
  lastRevenue: number;
  lastCost: number;
  lastProfit: number;
  log: readonly string[];
}

export type FactoryAction =
  | { type: "setWorkers"; value: number }
  | { type: "setProduct"; value: Product }
  | { type: "toggleQC" }
  | { type: "upgradeMachine" }
  | { type: "runShift" }
  | { type: "nextShift" };

export const PRODUCTS: Record<Product, { label: string; baseOutput: number; defectRate: number; baseSellPrice: number }> = {
  widget:  { label: "Widget",  baseOutput: 20, defectRate: 0.05, baseSellPrice: 8 },
  gear:    { label: "Gear",    baseOutput: 15, defectRate: 0.08, baseSellPrice: 12 },
  circuit: { label: "Circuit", baseOutput: 10, defectRate: 0.12, baseSellPrice: 20 },
  spring:  { label: "Spring",  baseOutput: 25, defectRate: 0.03, baseSellPrice: 5 },
};

export const MACHINE_UPGRADE_COST = 100;
export const WORKER_COST_PER_SHIFT = 30;
export const QC_COST = 40;

function generateOrder(rng: () => number, product: Product): { size: number; price: number } {
  const size = Math.round(50 + rng() * 150);
  const info = PRODUCTS[product];
  const priceVariance = 0.8 + rng() * 0.4;
  const price = Math.round(info.baseSellPrice * priceVariance);
  return { size, price };
}

export function initialState(seed: number): FactoryState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const orderRng = mulberry32(nextSeed);
  const order = generateOrder(orderRng, "widget");
  const seedAfterOrder = Math.floor(orderRng() * 2 ** 31);
  return {
    rngSeed: seedAfterOrder,
    shift: 1,
    cash: 400,
    phase: "plan",
    activeProduct: "widget",
    workers: 3,
    machineLevel: 0,
    qualityControl: false,
    orderSize: order.size,
    contractPrice: order.price,
    unitsProduced: 0,
    ordersFilled: 0,
    lastOutput: 0,
    lastDefects: 0,
    lastRevenue: 0,
    lastCost: 0,
    lastProfit: 0,
    log: [],
  };
}

export function calcOutput(workers: number, machineLevel: number, product: Product, rng: () => number): { output: number; defects: number } {
  const info = PRODUCTS[product];
  const machineBoost = 1 + machineLevel * 0.2;
  const rawOutput = Math.round(workers * info.baseOutput * machineBoost * (0.85 + rng() * 0.3));
  const defects = Math.round(rawOutput * info.defectRate * (0.5 + rng() * 1.0));
  const goodOutput = Math.max(0, rawOutput - defects);
  return { output: goodOutput, defects };
}

export function reducer(state: FactoryState, action: FactoryAction): FactoryState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "setWorkers":
      if (state.phase !== "plan") return state;
      return { ...state, workers: Math.max(2, Math.min(10, action.value)) };
    case "setProduct":
      if (state.phase !== "plan") return state;
      return { ...state, activeProduct: action.value };
    case "toggleQC":
      if (state.phase !== "plan") return state;
      return { ...state, qualityControl: !state.qualityControl };
    case "upgradeMachine":
      if (state.phase !== "plan" || state.machineLevel >= 4 || state.cash < MACHINE_UPGRADE_COST) return state;
      return { ...state, machineLevel: state.machineLevel + 1, cash: state.cash - MACHINE_UPGRADE_COST };

    case "runShift": {
      if (state.phase !== "plan") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const { output, defects } = calcOutput(state.workers, state.machineLevel, state.activeProduct, rng);
      // QC reduces defects but costs more
      const qcDefectReduction = state.qualityControl ? Math.round(defects * 0.6) : 0;
      const goodUnits = output + qcDefectReduction;
      const workerCost = state.workers * WORKER_COST_PER_SHIFT;
      const qcCost = state.qualityControl ? QC_COST : 0;
      const shiftCost = workerCost + qcCost;

      // Fill order
      const remaining = state.orderSize - state.unitsProduced;
      const unitsForOrder = Math.min(goodUnits, remaining);
      const newUnitsProduced = state.unitsProduced + unitsForOrder;
      let revenue = 0;
      let newOrderSize = state.orderSize;
      let newContractPrice = state.contractPrice;
      let newOrdersFilled = state.ordersFilled;
      let newUnitsProducedFinal = newUnitsProduced;

      if (newUnitsProduced >= state.orderSize) {
        // Order complete!
        revenue = state.orderSize * state.contractPrice;
        newOrdersFilled++;
        // Generate new order
        const orderRng = mulberry32(nextSeed);
        const newOrder = generateOrder(orderRng, state.activeProduct);
        newOrderSize = newOrder.size;
        newContractPrice = newOrder.price;
        newUnitsProducedFinal = 0;
      }

      const profit = revenue - shiftCost;
      const log = `Shift ${state.shift}: +${goodUnits} units (${defects - qcDefectReduction} defects) → ${revenue > 0 ? `Order filled! $${revenue}` : `${newUnitsProduced}/${state.orderSize} units`}`;
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "results",
        cash: state.cash + profit,
        unitsProduced: newUnitsProducedFinal,
        orderSize: newOrderSize,
        contractPrice: newContractPrice,
        ordersFilled: newOrdersFilled,
        lastOutput: goodUnits,
        lastDefects: defects,
        lastRevenue: revenue,
        lastCost: shiftCost,
        lastProfit: profit,
        log: [...state.log, log],
      };
    }

    case "nextShift": {
      if (state.phase !== "results") return state;
      if (state.shift >= TOTAL_SHIFTS) return { ...state, phase: "done" };
      return { ...state, shift: state.shift + 1, phase: "plan" };
    }
  }
}

export function isTerminal(state: FactoryState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.cash / 3000) * 100))) };
}
