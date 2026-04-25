import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface LootRoom {
  name: string;
  loot: number;   // gold in the room
  trapDice: number; // number of d6 trap dice (result >= 5 = trap triggered)
}

const ROOMS: LootRoom[] = [
  { name: "Dusty Alcove",      loot: 5,   trapDice: 1 },
  { name: "Guard's Quarters",  loot: 10,  trapDice: 1 },
  { name: "Treasury Annex",    loot: 15,  trapDice: 2 },
  { name: "Armory",            loot: 20,  trapDice: 2 },
  { name: "Trophy Hall",       loot: 25,  trapDice: 2 },
  { name: "The Vault",         loot: 35,  trapDice: 3 },
  { name: "Dragon's Hoard",    loot: 50,  trapDice: 3 },
  { name: "Forbidden Chamber", loot: 65,  trapDice: 4 },
  { name: "Throne Room",       loot: 80,  trapDice: 4 },
  { name: "The Sanctum",       loot: 100, trapDice: 5 },
];

export interface DiceResult {
  rolls: readonly number[];
  trapCount: number;
}

export interface LootGoblinState {
  rngSeed: number;
  gold: number;
  currentRoom: number; // index into ROOMS
  heldGold: number;   // gold collected this run, not yet banked
  trapTokens: number; // accumulated trap triggers (3 = dead)
  lastDice: readonly number[] | null;
  totalRooms: number;
  phase: "choose" | "rolled" | "done" | "dead";
  log: readonly string[];
}

export type LootGoblinAction =
  | { type: "enterRoom" }
  | { type: "bankAndEscape" }
  | { type: "pressOn" };

export function initialState(seed: number): LootGoblinState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    gold: 0,
    currentRoom: 0,
    heldGold: 0,
    trapTokens: 0,
    lastDice: null,
    totalRooms: ROOMS.length,
    phase: "choose",
    log: ["You sneak into the dungeon. Loot rooms and escape before traps catch you!"],
  };
}

export function getRooms(): readonly LootRoom[] { return ROOMS; }

export function reducer(state: LootGoblinState, action: LootGoblinAction): LootGoblinState {
  if (state.phase === "done" || state.phase === "dead") return state;

  switch (action.type) {
    case "enterRoom": {
      if (state.phase !== "choose") return state;
      const room = ROOMS[state.currentRoom]!;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const rolls: number[] = [];
      for (let i = 0; i < room.trapDice; i++) {
        rolls.push(Math.floor(rng() * 6) + 1);
      }
      const trapCount = rolls.filter(r => r >= 5).length;
      const newTraps = state.trapTokens + trapCount;
      const newHeldGold = state.heldGold + room.loot;
      const logLine = `${room.name}: rolled [${rolls.join(",")}] → ${trapCount} trap(s). Got ${room.loot}g.`;

      if (newTraps >= 3) {
        return {
          ...state,
          rngSeed: nextSeed,
          heldGold: 0,
          trapTokens: newTraps,
          lastDice: rolls,
          phase: "dead",
          log: [...state.log, logLine, "3 traps! You are captured — all held gold lost!"],
        };
      }

      const isLastRoom = state.currentRoom >= ROOMS.length - 1;
      if (isLastRoom) {
        return {
          ...state,
          rngSeed: nextSeed,
          gold: state.gold + newHeldGold,
          heldGold: newHeldGold,
          trapTokens: newTraps,
          lastDice: rolls,
          phase: "done",
          log: [...state.log, logLine, `Escaped! Banked ${newHeldGold}g. Total: ${state.gold + newHeldGold}g.`],
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        heldGold: newHeldGold,
        trapTokens: newTraps,
        lastDice: rolls,
        currentRoom: state.currentRoom + 1,
        phase: "rolled",
        log: [...state.log, logLine],
      };
    }

    case "bankAndEscape": {
      if (state.phase !== "rolled") return state;
      const banked = state.gold + state.heldGold;
      return {
        ...state,
        gold: banked,
        heldGold: 0,
        phase: "done",
        log: [...state.log, `Escaped! Banked ${state.heldGold}g. Total: ${banked}g.`],
      };
    }

    case "pressOn": {
      if (state.phase !== "rolled") return state;
      return { ...state, phase: "choose" };
    }
  }
}

export function isTerminal(state: LootGoblinState): { score: number } | null {
  if (state.phase === "done") {
    // Max possible gold is sum of all rooms = 405
    return { score: Math.min(100, Math.round((state.gold / 200) * 100)) };
  }
  if (state.phase === "dead") {
    return { score: Math.min(100, Math.round((state.gold / 200) * 100)) };
  }
  return null;
}
