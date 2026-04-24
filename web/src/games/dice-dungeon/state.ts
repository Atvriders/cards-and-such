import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiceDungeonState {
  rngSeed: number;
  room: number;
  totalRooms: number;
  playerHp: number;
  playerMaxHp: number;
  playerDice: number; // number of attack dice (d6)
  shield: number; // current block
  enemyHp: number;
  enemyMaxHp: number;
  enemyName: string;
  enemyDice: number; // enemy attack dice
  lastRoll: readonly number[];
  lastEnemyRoll: readonly number[];
  phase: "roll" | "reward" | "dead" | "won";
  log: readonly string[];
}

export type DiceDungeonAction =
  | { type: "rollAttack" }
  | { type: "rollDefend" }
  | { type: "nextRoom" };

const ROOMS = [
  { name: "Goblin",   hp: 14,  dice: 1 },
  { name: "Skeleton", hp: 20,  dice: 2 },
  { name: "Orc",      hp: 28,  dice: 2 },
  { name: "Witch",    hp: 35,  dice: 3 },
  { name: "Vampire",  hp: 42,  dice: 3 },
  { name: "Dragon",   hp: 55,  dice: 4 },
  { name: "Lich",     hp: 70,  dice: 5 },
];

function rollDice(n: number, rng: () => number): number[] {
  return Array.from({ length: n }, () => Math.floor(rng() * 6) + 1);
}

export function initialState(seed: number): DiceDungeonState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const room = ROOMS[0]!;
  return {
    rngSeed: nextSeed,
    room: 1,
    totalRooms: ROOMS.length,
    playerHp: 30,
    playerMaxHp: 30,
    playerDice: 2,
    shield: 0,
    enemyHp: room.hp,
    enemyMaxHp: room.hp,
    enemyName: room.name,
    enemyDice: room.dice,
    lastRoll: [],
    lastEnemyRoll: [],
    phase: "roll",
    log: ["Roll to attack or defend each round!"],
  };
}

export function reducer(state: DiceDungeonState, action: DiceDungeonAction): DiceDungeonState {
  if (state.phase === "dead" || state.phase === "won") return state;

  if (action.type === "rollAttack") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const playerRoll = rollDice(state.playerDice, rng);
    const enemyRoll = rollDice(state.enemyDice, rng);
    const playerTotal = playerRoll.reduce((a, b) => a + b, 0);
    const enemyTotal = enemyRoll.reduce((a, b) => a + b, 0);
    const dmgToEnemy = playerTotal;
    const rawDmgToPlayer = enemyTotal;
    const actualDmg = Math.max(0, rawDmgToPlayer - state.shield);
    let newEnemyHp = state.enemyHp - dmgToEnemy;
    let newPlayerHp = state.playerHp - actualDmg;
    const logLines: string[] = [
      `You roll [${playerRoll.join(",")}]=${playerTotal} vs ${state.enemyName} [${enemyRoll.join(",")}]=${enemyTotal}`,
      `Dealt ${dmgToEnemy} to ${state.enemyName}, took ${actualDmg} damage (shield ${state.shield})`,
    ];

    let phase: DiceDungeonState["phase"] = "roll";
    if (newEnemyHp <= 0) {
      newEnemyHp = 0;
      phase = state.room >= state.totalRooms ? "won" : "reward";
      logLines.push(`${state.enemyName} defeated!`);
    }
    if (newPlayerHp <= 0) {
      newPlayerHp = 0;
      phase = "dead";
      logLines.push("You died!");
    }

    return {
      ...state,
      rngSeed: nextSeed,
      enemyHp: newEnemyHp,
      playerHp: newPlayerHp,
      shield: 0,
      lastRoll: playerRoll,
      lastEnemyRoll: enemyRoll,
      phase,
      log: [...state.log, ...logLines],
    };
  }

  if (action.type === "rollDefend") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const defRoll = rollDice(state.playerDice, rng);
    const shield = defRoll.reduce((a, b) => a + b, 0);
    return {
      ...state,
      rngSeed: nextSeed,
      shield,
      lastRoll: defRoll,
      log: [...state.log, `Defended! Shield = ${shield} (roll [${defRoll.join(",")}])`],
    };
  }

  if (action.type === "nextRoom") {
    if (state.phase !== "reward") return state;
    const nextRoom = state.room + 1;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const roomDef = ROOMS[nextRoom - 1]!;
    const healAmt = 8;
    return {
      ...state,
      rngSeed: nextSeed,
      room: nextRoom,
      enemyHp: roomDef.hp,
      enemyMaxHp: roomDef.hp,
      enemyName: roomDef.name,
      enemyDice: roomDef.dice,
      playerHp: Math.min(state.playerMaxHp, state.playerHp + healAmt),
      playerDice: state.playerDice + (nextRoom % 3 === 0 ? 1 : 0),
      shield: 0,
      lastRoll: [],
      lastEnemyRoll: [],
      phase: "roll",
      log: [...state.log, `Room ${nextRoom}: ${roomDef.name} (${roomDef.hp} HP). +${healAmt} HP restored.`],
    };
  }

  return state;
}

export function isTerminal(state: DiceDungeonState): { score: number } | null {
  if (state.phase === "won") return { score: 100 + state.playerHp };
  if (state.phase === "dead") return { score: Math.max(0, (state.room - 1) * 12) };
  return null;
}
