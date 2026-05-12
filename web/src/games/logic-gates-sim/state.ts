import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface LogicGatesSettings {
  difficulty: "easy" | "medium" | "hard";
}

export type GateType = "AND" | "OR" | "NOT" | "NAND" | "NOR" | "XOR";
export type WireValue = 0 | 1;

export interface Gate {
  id: number;
  type: GateType;
  inputA: number | null; // gate id or -1/null for user input
  inputB: number | null; // null for NOT gate
}

export interface LogicGatesState {
  settings: LogicGatesSettings;
  gates: readonly Gate[];
  // User-controlled input switches (indices)
  inputs: readonly WireValue[];
  targetOutput: WireValue;
  numInputs: number;
  movesMade: number;
  won: boolean;
}

export type LogicGatesAction = { type: "toggle"; inputIndex: number };

// Evaluate the gate network
function evaluate(gates: readonly Gate[], inputs: readonly WireValue[]): WireValue {
  const cache = new Map<number, WireValue>();

  function evalGate(id: number): WireValue {
    if (cache.has(id)) return cache.get(id)!;
    const gate = gates.find((g) => g.id === id)!;
    const a: WireValue = gate.inputA === null ? 0 : gate.inputA < 0 ? (inputs[~gate.inputA] ?? 0) : evalGate(gate.inputA);
    const b: WireValue = gate.inputB === null ? 0 : gate.inputB < 0 ? (inputs[~gate.inputB] ?? 0) : evalGate(gate.inputB);
    let out: WireValue;
    switch (gate.type) {
      case "AND":  out = (a & b) as WireValue; break;
      case "OR":   out = (a | b) as WireValue; break;
      case "NOT":  out = (a === 0 ? 1 : 0) as WireValue; break;
      case "NAND": out = ((a & b) === 0 ? 1 : 0) as WireValue; break;
      case "NOR":  out = ((a | b) === 0 ? 1 : 0) as WireValue; break;
      case "XOR":  out = ((a ^ b) as WireValue); break;
    }
    cache.set(id, out);
    return out;
  }

  // Last gate in list is the output
  return evalGate(gates[gates.length - 1]!.id);
}

// Encode input index as negative: ~0=-1, ~1=-2, ~2=-3 etc.
function inputRef(i: number): number { return ~i; }

function buildPuzzle(rng: () => number, difficulty: string): { gates: Gate[]; inputs: WireValue[]; target: WireValue } {
  const numInputs = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
  const numGates = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 5;

  const gateTypes: GateType[] = ["AND", "OR", "NOT", "NAND", "NOR", "XOR"];
  const gates: Gate[] = [];
  let idCounter = 0;

  for (let i = 0; i < numGates; i++) {
    const type = gateTypes[Math.floor(rng() * gateTypes.length)]!;
    const isFirst = i === 0;
    const isNot = type === "NOT";

    let inputA: number;
    let inputB: number | null;

    if (isFirst) {
      inputA = inputRef(Math.floor(rng() * numInputs));
      inputB = isNot ? null : inputRef(Math.floor(rng() * numInputs));
    } else {
      // Mix of prior gates and raw inputs
      const prevGates = gates.map((g) => g.id);
      const candidatesA = [...prevGates, ...Array.from({ length: numInputs }, (_, k) => inputRef(k))];
      inputA = candidatesA[Math.floor(rng() * candidatesA.length)]!;
      inputB = isNot ? null : candidatesA[Math.floor(rng() * candidatesA.length)]!;
    }

    gates.push({ id: idCounter++, type, inputA, inputB });
  }

  // Generate random inputs and compute target output
  const inputs: WireValue[] = Array.from({ length: numInputs }, () => (Math.floor(rng() * 2) as WireValue));
  const target = evaluate(gates, inputs);

  // Flip one input so the user has to work
  const flipIdx = Math.floor(rng() * numInputs);
  const startInputs = inputs.slice() as WireValue[];
  startInputs[flipIdx] = (1 - startInputs[flipIdx]!) as WireValue;

  return { gates, inputs: startInputs, target };
}

export function initialState(seed: number, settings: LogicGatesSettings): LogicGatesState {
  const rng = mulberry32(seed);
  const { gates, inputs, target } = buildPuzzle(rng, settings.difficulty);
  return {
    settings,
    gates,
    inputs,
    targetOutput: target,
    numInputs: inputs.length,
    movesMade: 0,
    // Fresh puzzles aren't "won" yet — the player must toggle at least once
    // to register a solution. Without this, degenerate gate networks (where
    // every input combo yields the target) trip isTerminal on the fresh state.
    won: false,
  };
}

export function reducer(state: LogicGatesState, action: LogicGatesAction): LogicGatesState {
  if (state.won) return state;
  if (action.type !== "toggle") return state;
  const { inputIndex } = action;
  if (inputIndex < 0 || inputIndex >= state.numInputs) return state;

  const newInputs = state.inputs.slice() as WireValue[];
  newInputs[inputIndex] = (1 - newInputs[inputIndex]!) as WireValue;
  const output = evaluate(state.gates, newInputs);
  const won = output === state.targetOutput;
  return { ...state, inputs: newInputs, won, movesMade: state.movesMade + 1 };
}

export function isTerminal(state: LogicGatesState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 500 - state.movesMade * 20) };
}
