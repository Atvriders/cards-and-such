import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Apple Picking — pick apples to meet a target count before time runs out

export interface AppleSettings {
  goal: "10" | "15" | "20";
}

export interface Tree {
  id: number;
  apples: number; // 0..5
}

export interface AppleState {
  settings: AppleSettings;
  rngSeed: number;
  trees: Tree[];
  basket: number; // total apples picked
  goal: number;
  turnsLeft: number;
  message: string;
  done: boolean;
}

export type AppleAction = { type: "pick"; treeId: number };

function makeTree(id: number, rng: () => number): Tree {
  return { id, apples: 1 + Math.floor(rng() * 5) };
}

export function initialState(seed: number, settings: AppleSettings): AppleState {
  const rng = mulberry32(seed);
  const trees: Tree[] = Array.from({ length: 5 }, (_, i) => makeTree(i, rng));
  const goal = parseInt(settings.goal);
  return {
    settings,
    rngSeed: Math.floor(rng() * 2 ** 31),
    trees,
    basket: 0,
    goal,
    turnsLeft: goal + 3, // slight challenge
    message: `Pick apples to fill your basket! Goal: ${goal}`,
    done: false,
  };
}

function refillTree(tree: Tree, rng: () => number): Tree {
  if (tree.apples > 0) return tree;
  return { ...tree, apples: 1 + Math.floor(rng() * 4) };
}

export function reducer(state: AppleState, action: AppleAction): AppleState {
  if (state.done) return state;
  if (action.type !== "pick") return state;

  const tree = state.trees.find(t => t.id === action.treeId);
  if (!tree || tree.apples === 0) return { ...state, message: "That tree is empty! Pick another." };

  const picked = tree.apples;
  const basket = state.basket + picked;
  const turnsLeft = state.turnsLeft - 1;

  const rng = mulberry32(state.rngSeed);
  const newTrees = state.trees.map(t => (t.id === action.treeId ? { ...t, apples: 0 } : refillTree(t, rng)));
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (basket >= state.goal) {
    return { ...state, trees: newTrees, rngSeed: nextSeed, basket, turnsLeft, done: true, message: `You filled the basket with ${basket} apples! Great work!` };
  }
  if (turnsLeft <= 0) {
    return { ...state, trees: newTrees, rngSeed: nextSeed, basket, turnsLeft: 0, done: true, message: `Out of turns! You got ${basket}/${state.goal} apples.` };
  }

  return {
    ...state,
    trees: newTrees,
    rngSeed: nextSeed,
    basket,
    turnsLeft,
    message: `Picked ${picked} apples! Basket: ${basket}/${state.goal}. Turns left: ${turnsLeft}`,
  };
}

export function isTerminal(state: AppleState): { score: number } | null {
  if (!state.done) return null;
  return { score: state.basket >= state.goal ? 100 : Math.round((state.basket / state.goal) * 60) };
}
