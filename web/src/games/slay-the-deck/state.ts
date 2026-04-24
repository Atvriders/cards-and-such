import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type SlayCardType = "strike" | "block" | "power" | "draw" | "burn";

export interface SlayCard {
  id: number;
  type: SlayCardType;
  name: string;
  cost: number;
  value: number;
  desc: string;
}

export interface SlayEnemy {
  name: string;
  hp: number;
  maxHp: number;
  intent: number; // damage it will deal this turn
}

export interface SlayTheDeckState {
  rngSeed: number;
  act: number;
  totalActs: number;
  playerHp: number;
  playerMaxHp: number;
  energy: number;
  maxEnergy: number;
  block: number;
  strength: number; // bonus to all attacks
  hand: readonly SlayCard[];
  drawPile: readonly SlayCard[];
  discardPile: readonly SlayCard[];
  enemy: SlayEnemy;
  phase: "player" | "enemy" | "reward" | "dead" | "won";
  log: readonly string[];
}

export type SlayTheDeckAction =
  | { type: "playCard"; id: number }
  | { type: "endTurn" }
  | { type: "nextAct" };

let _id = 0;
function card(type: SlayCardType, name: string, cost: number, value: number, desc: string): SlayCard {
  return { id: _id++, type, name, cost, value, desc };
}

const STARTER_DECK: SlayCard[] = [
  card("strike", "Strike", 1, 6, "Deal 6 dmg"),
  card("strike", "Strike", 1, 6, "Deal 6 dmg"),
  card("strike", "Strike", 1, 6, "Deal 6 dmg"),
  card("block",  "Defend", 1, 5, "+5 block"),
  card("block",  "Defend", 1, 5, "+5 block"),
  card("power",  "Power Up", 2, 3, "+3 strength"),
  card("draw",   "Card Draw", 1, 2, "Draw 2 cards"),
  card("burn",   "Fireball", 2, 14, "Deal 14 dmg"),
  card("strike", "Slice",   1, 8, "Deal 8 dmg"),
  card("block",  "Iron Wall", 2, 10, "+10 block"),
];

function shuffleArr<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function drawN(drawPile: SlayCard[], discardPile: SlayCard[], n: number, rng: () => number): { hand: SlayCard[]; draw: SlayCard[]; discard: SlayCard[] } {
  let draw = [...drawPile];
  let discard = [...discardPile];
  const hand: SlayCard[] = [];
  for (let i = 0; i < n; i++) {
    if (draw.length === 0) { draw = shuffleArr(discard, rng); discard = []; }
    if (draw.length > 0) hand.push(draw.pop()!);
  }
  return { hand, draw, discard };
}

const ENEMIES: Array<{ name: string; hp: number; intent: number }> = [
  { name: "Rat",      hp: 12,  intent: 4 },
  { name: "Goblin",   hp: 20,  intent: 7 },
  { name: "Bandit",   hp: 28,  intent: 9 },
  { name: "Orc",      hp: 38,  intent: 11 },
  { name: "BOSS",     hp: 60,  intent: 15 },
];

export function initialState(seed: number): SlayTheDeckState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  const shuffled = shuffleArr(STARTER_DECK, rng2);
  const drawn = drawN(shuffled, [], 5, rng2);
  const enemy = ENEMIES[0]!;
  return {
    rngSeed: nextSeed,
    act: 1,
    totalActs: ENEMIES.length,
    playerHp: 40,
    playerMaxHp: 40,
    energy: 3,
    maxEnergy: 3,
    block: 0,
    strength: 0,
    hand: drawn.hand,
    drawPile: drawn.draw,
    discardPile: drawn.discard,
    enemy: { ...enemy, maxHp: enemy.hp },
    phase: "player",
    log: ["Draw cards, spend energy, end turn!"],
  };
}

export function reducer(state: SlayTheDeckState, action: SlayTheDeckAction): SlayTheDeckState {
  if (state.phase === "dead" || state.phase === "won") return state;

  if (action.type === "playCard") {
    if (state.phase !== "player") return state;
    const idx = state.hand.findIndex(c => c.id === action.id);
    if (idx < 0) return state;
    const c = state.hand[idx]!;
    if (state.energy < c.cost) return state;
    let { energy, block, strength, playerHp, playerMaxHp } = state;
    let enemyHp = state.enemy.hp;
    const log: string[] = [];
    energy -= c.cost;
    switch (c.type) {
      case "strike": { const dmg = c.value + strength; enemyHp -= dmg; log.push(`${c.name}: ${dmg} dmg`); break; }
      case "burn":   { const dmg = c.value + strength; enemyHp -= dmg; log.push(`${c.name}: ${dmg} dmg`); break; }
      case "block":  block += c.value; log.push(`${c.name}: +${c.value} block`); break;
      case "power":  strength += c.value; log.push(`${c.name}: +${c.value} strength`); break;
      case "draw": {
        const rng = mulberry32(state.rngSeed);
        const nextSeed = Math.floor(rng() * 2 ** 31);
        const drawn = drawN([...state.drawPile], [...state.discardPile], c.value, rng);
        log.push(`${c.name}: drew ${c.value} cards`);
        const newHand = [...state.hand.filter((_, i) => i !== idx), ...drawn.hand];
        return {
          ...state,
          rngSeed: nextSeed,
          energy,
          hand: newHand,
          drawPile: drawn.draw,
          discardPile: [...drawn.discard, c],
          log: [...state.log, ...log],
        };
      }
    }
    const newHand = state.hand.filter((_, i) => i !== idx);
    const newDiscard = [...state.discardPile, c];
    const newEnemy = { ...state.enemy, hp: Math.max(0, enemyHp) };
    if (enemyHp <= 0) {
      const phase: SlayTheDeckState["phase"] = state.act >= state.totalActs ? "won" : "reward";
      return { ...state, energy, block, strength, playerHp, hand: newHand, discardPile: newDiscard, enemy: newEnemy, phase, log: [...state.log, ...log, `${state.enemy.name} defeated!`] };
    }
    return { ...state, energy, block, strength, playerHp, hand: newHand, discardPile: newDiscard, enemy: newEnemy, log: [...state.log, ...log] };
  }

  if (action.type === "endTurn") {
    if (state.phase !== "player") return state;
    // Enemy attacks
    const dmg = Math.max(0, state.enemy.intent - state.block);
    let newHp = Math.max(0, state.playerHp - dmg);
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const log = [`${state.enemy.name} attacks for ${state.enemy.intent} (${dmg} after block ${state.block})`];
    if (newHp <= 0) {
      return { ...state, rngSeed: nextSeed, playerHp: 0, block: 0, phase: "dead", log: [...state.log, ...log, "You died!"] };
    }
    // Draw new hand
    const drawn = drawN([...state.discardPile, ...state.hand], [], 5, rng);
    return {
      ...state,
      rngSeed: nextSeed,
      playerHp: newHp,
      block: 0,
      energy: state.maxEnergy,
      hand: drawn.hand,
      drawPile: drawn.draw,
      discardPile: drawn.discard,
      log: [...state.log, ...log],
    };
  }

  if (action.type === "nextAct") {
    if (state.phase !== "reward") return state;
    const nextAct = state.act + 1;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const enemyDef = ENEMIES[nextAct - 1]!;
    const drawn = drawN([...state.discardPile, ...state.hand], [], 5, rng);
    return {
      ...state,
      rngSeed: nextSeed,
      act: nextAct,
      enemy: { ...enemyDef, maxHp: enemyDef.hp },
      playerHp: Math.min(state.playerMaxHp, state.playerHp + 10),
      block: 0,
      energy: state.maxEnergy,
      hand: drawn.hand,
      drawPile: drawn.draw,
      discardPile: drawn.discard,
      phase: "player",
      log: [...state.log, `Act ${nextAct}: ${enemyDef.name}! +10 HP`],
    };
  }

  return state;
}

export function isTerminal(state: SlayTheDeckState): { score: number } | null {
  if (state.phase === "won") return { score: 100 + state.playerHp * 2 };
  if (state.phase === "dead") return { score: Math.max(0, (state.act - 1) * 18) };
  return null;
}
