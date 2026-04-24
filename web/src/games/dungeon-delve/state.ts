import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROOMS = 10;

export type CardType =
  | "strike" | "heavy" | "shield" | "potion" | "fireball" | "ice" | "dodge" | "poison" | "rage" | "heal";

export interface Card {
  id: number;
  type: CardType;
  name: string;
  cost: number;
  value: number;
}

export const CARD_DEFS: Record<CardType, { name: string; cost: number; value: number; desc: string }> = {
  strike:   { name: "Strike",   cost: 1, value: 6,  desc: "Deal 6 damage" },
  heavy:    { name: "Heavy",    cost: 2, value: 12, desc: "Deal 12 damage" },
  shield:   { name: "Shield",   cost: 1, value: 5,  desc: "Block 5 damage" },
  potion:   { name: "Potion",   cost: 0, value: 8,  desc: "Heal 8 HP" },
  fireball: { name: "Fireball", cost: 2, value: 18, desc: "Deal 18 damage" },
  ice:      { name: "Ice",      cost: 2, value: 10, desc: "Deal 10 + block 5" },
  dodge:    { name: "Dodge",    cost: 1, value: 8,  desc: "Block 8 damage" },
  poison:   { name: "Poison",   cost: 1, value: 4,  desc: "Deal 4 + 4 next turn" },
  rage:     { name: "Rage",     cost: 0, value: 0,  desc: "+3 energy this turn" },
  heal:     { name: "Heal",     cost: 1, value: 12, desc: "Heal 12 HP" },
};

const DECK_TEMPLATE: CardType[] = [
  "strike","strike","strike","heavy","shield","shield",
  "potion","fireball","ice","dodge","poison","rage","heal",
  "strike","heavy","shield","dodge","fireball","potion","heal",
];

export interface Enemy {
  name: string;
  maxHp: number;
  hp: number;
  attack: number;
  poisoned: number;
}

export interface DungeonDelveState {
  rngSeed: number;
  room: number;
  playerHp: number;
  playerMaxHp: number;
  energy: number;
  maxEnergy: number;
  block: number;
  poisonApplied: number; // poison to deal next enemy turn
  hand: readonly Card[];
  deck: readonly Card[];
  discard: readonly Card[];
  enemy: Enemy;
  phase: "combat" | "reward" | "done" | "dead";
  log: readonly string[];
}

export type DungeonDelveAction =
  | { type: "playCard"; cardId: number }
  | { type: "endTurn" }
  | { type: "nextRoom" };

const ENEMIES = [
  { name: "Goblin",    maxHp: 20,  attack: 4 },
  { name: "Orc",       maxHp: 35,  attack: 7 },
  { name: "Skeleton",  maxHp: 28,  attack: 5 },
  { name: "Troll",     maxHp: 50,  attack: 10 },
  { name: "Witch",     maxHp: 40,  attack: 9 },
  { name: "Vampire",   maxHp: 45,  attack: 8 },
  { name: "Dragon",    maxHp: 80,  attack: 15 },
  { name: "Golem",     maxHp: 60,  attack: 11 },
  { name: "Bandit",    maxHp: 30,  attack: 6 },
  { name: "Boss",      maxHp: 100, attack: 18 },
];

let cardIdCounter = 0;
function makeCard(type: CardType): Card {
  const def = CARD_DEFS[type];
  return { id: cardIdCounter++, type, ...def };
}

function shuffleDeck(deck: Card[], rng: () => number): Card[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function drawCards(deck: Card[], discard: Card[], count: number, rng: () => number): { hand: Card[]; deck: Card[]; discard: Card[] } {
  let d = [...deck];
  let disc = [...discard];
  const hand: Card[] = [];
  for (let i = 0; i < count; i++) {
    if (d.length === 0) {
      d = shuffleDeck(disc, rng);
      disc = [];
    }
    if (d.length > 0) {
      hand.push(d.pop()!);
    }
  }
  return { hand, deck: d, discard: disc };
}

export function initialState(seed: number): DungeonDelveState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  const deck = shuffleDeck(DECK_TEMPLATE.map(makeCard), rng2);
  const drawn = drawCards(deck.slice(), [], 5, rng2);
  const enemy = { ...ENEMIES[0]!, hp: ENEMIES[0]!.maxHp, poisoned: 0 };
  return {
    rngSeed: nextSeed,
    room: 1,
    playerHp: 50,
    playerMaxHp: 50,
    energy: 3,
    maxEnergy: 3,
    block: 0,
    poisonApplied: 0,
    hand: drawn.hand,
    deck: drawn.deck,
    discard: drawn.discard,
    enemy,
    phase: "combat",
    log: [],
  };
}

export function reducer(state: DungeonDelveState, action: DungeonDelveAction): DungeonDelveState {
  if (state.phase === "done" || state.phase === "dead") return state;

  switch (action.type) {
    case "playCard": {
      if (state.phase !== "combat") return state;
      const cardIdx = state.hand.findIndex(c => c.id === action.cardId);
      if (cardIdx < 0) return state;
      const card = state.hand[cardIdx]!;
      if (card.type !== "rage" && state.energy < card.cost) return state;

      let { energy, block, playerHp, playerMaxHp } = state;
      let enemyHp = state.enemy.hp;
      let poisonApplied = state.poisonApplied;
      const logLines: string[] = [];

      if (card.type === "rage") {
        energy = Math.min(energy + 3, 6);
        logLines.push("Rage: +3 energy");
      } else {
        energy -= card.cost;
        switch (card.type) {
          case "strike":   enemyHp -= card.value; logLines.push(`Strike: -${card.value} enemy HP`); break;
          case "heavy":    enemyHp -= card.value; logLines.push(`Heavy: -${card.value} enemy HP`); break;
          case "fireball": enemyHp -= card.value; logLines.push(`Fireball: -${card.value} enemy HP`); break;
          case "shield":   block += card.value; logLines.push(`Shield: +${card.value} block`); break;
          case "dodge":    block += card.value; logLines.push(`Dodge: +${card.value} block`); break;
          case "ice":      enemyHp -= card.value; block += 5; logLines.push(`Ice: -${card.value} dmg, +5 block`); break;
          case "potion":   playerHp = Math.min(playerMaxHp, playerHp + card.value); logLines.push(`Potion: +${card.value} HP`); break;
          case "heal":     playerHp = Math.min(playerMaxHp, playerHp + card.value); logLines.push(`Heal: +${card.value} HP`); break;
          case "poison":   enemyHp -= card.value; poisonApplied += 4; logLines.push(`Poison: -${card.value} dmg + 4 DoT`); break;
        }
      }

      const newHand = state.hand.filter((_, i) => i !== cardIdx);
      const newDiscard = [...state.discard, card];
      const enemy = { ...state.enemy, hp: Math.max(0, enemyHp) };

      return {
        ...state,
        energy,
        block,
        playerHp,
        poisonApplied,
        hand: newHand,
        discard: newDiscard,
        enemy,
        log: [...state.log, ...logLines],
      };
    }

    case "endTurn": {
      if (state.phase !== "combat") return state;

      let { enemy, playerHp, playerMaxHp, block, rngSeed, poisonApplied } = state;
      const logLines: string[] = [];

      // Poison tick on enemy
      if (poisonApplied > 0) {
        enemy = { ...enemy, hp: Math.max(0, enemy.hp - poisonApplied) };
        logLines.push(`Poison deals ${poisonApplied} to ${enemy.name}`);
      }

      // Check enemy death
      if (enemy.hp <= 0) {
        const rng = mulberry32(rngSeed);
        const nextSeed = Math.floor(rng() * 2 ** 31);
        return {
          ...state,
          rngSeed: nextSeed,
          enemy,
          phase: state.room >= TOTAL_ROOMS ? "done" : "reward",
          log: [...state.log, ...logLines, `${enemy.name} defeated!`],
        };
      }

      // Enemy attacks
      const rng = mulberry32(rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const attackVariance = Math.floor(rng() * 5) - 2;
      const enemyDmg = Math.max(1, enemy.attack + attackVariance);
      const dmgAfterBlock = Math.max(0, enemyDmg - block);
      playerHp = Math.max(0, playerHp - dmgAfterBlock);
      logLines.push(`${enemy.name} attacks for ${enemyDmg} (${dmgAfterBlock} after block ${block})`);

      if (playerHp <= 0) {
        return {
          ...state,
          rngSeed: nextSeed,
          playerHp: 0,
          block: 0,
          phase: "dead",
          log: [...state.log, ...logLines, "You have been defeated!"],
        };
      }

      // Draw new hand
      const drawn = drawCards([...state.deck], [...state.discard], 5, rng);
      return {
        ...state,
        rngSeed: nextSeed,
        playerHp,
        playerMaxHp,
        block: 0,
        poisonApplied: 0,
        energy: state.maxEnergy,
        hand: drawn.hand,
        deck: drawn.deck,
        discard: [...drawn.discard],
        enemy: { ...enemy, hp: Math.max(0, enemy.hp) },
        log: [...state.log, ...logLines],
      };
    }

    case "nextRoom": {
      if (state.phase !== "reward") return state;
      const nextRoom = state.room + 1;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const rng2 = mulberry32(nextSeed);
      const enemyDef = ENEMIES[Math.min(nextRoom - 1, ENEMIES.length - 1)]!;
      const enemy: Enemy = { ...enemyDef, hp: enemyDef.maxHp, poisoned: 0 };
      const drawn = drawCards([...state.deck], [...state.discard], 5, rng2);
      const healAmount = Math.round(state.playerMaxHp * 0.2);
      return {
        ...state,
        rngSeed: nextSeed,
        room: nextRoom,
        enemy,
        phase: "combat",
        block: 0,
        poisonApplied: 0,
        energy: state.maxEnergy,
        playerHp: Math.min(state.playerMaxHp, state.playerHp + healAmount),
        hand: drawn.hand,
        deck: drawn.deck,
        discard: drawn.discard,
        log: [...state.log, `Entered room ${nextRoom}: ${enemy.name} appears!`],
      };
    }
  }
}

export function isTerminal(state: DungeonDelveState): { score: number } | null {
  if (state.phase === "done") return { score: 100 };
  if (state.phase === "dead") {
    return { score: Math.max(0, Math.round(((state.room - 1) / TOTAL_ROOMS) * 80)) };
  }
  return null;
}
