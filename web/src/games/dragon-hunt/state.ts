import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_FLOORS = 8;

export interface DragonHuntState {
  rngSeed: number;
  floor: number;
  playerHp: number;
  playerMaxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  magic: number;
  enemyName: string;
  enemyHp: number;
  enemyMaxHp: number;
  enemyAtk: number;
  shield: number;
  phase: "combat" | "reward" | "dead" | "won";
  log: readonly string[];
}

export type DragonHuntAction =
  | { type: "strike" }
  | { type: "spellfire" }
  | { type: "ward" }
  | { type: "rest" }
  | { type: "nextFloor" };

const FLOORS = [
  { name: "Guard",       hp: 16,  atk: 4 },
  { name: "Knight",      hp: 24,  atk: 6 },
  { name: "Mage",        hp: 30,  atk: 8 },
  { name: "Warlord",     hp: 38,  atk: 10 },
  { name: "Demon",       hp: 46,  atk: 13 },
  { name: "Lich",        hp: 56,  atk: 15 },
  { name: "Wyvern",      hp: 68,  atk: 18 },
  { name: "DRAGON",      hp: 90,  atk: 22 },
];

export function initialState(seed: number): DragonHuntState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const f = FLOORS[0]!;
  return {
    rngSeed: nextSeed,
    floor: 1,
    playerHp: 50,
    playerMaxHp: 50,
    mana: 5,
    maxMana: 5,
    attack: 10,
    magic: 12,
    enemyName: f.name,
    enemyHp: f.hp,
    enemyMaxHp: f.hp,
    enemyAtk: f.atk,
    shield: 0,
    phase: "combat",
    log: ["Scale the tower! Fight your way to the Dragon!"],
  };
}

function enemyAttack(state: DragonHuntState, rng: () => number): { playerHp: number; log: string } {
  const variance = Math.floor(rng() * 5) - 2;
  const raw = Math.max(1, state.enemyAtk + variance);
  const dmg = Math.max(0, raw - state.shield);
  return { playerHp: Math.max(0, state.playerHp - dmg), log: `${state.enemyName} attacks for ${raw} (${dmg} past shield ${state.shield})` };
}

export function reducer(state: DragonHuntState, action: DragonHuntAction): DragonHuntState {
  if (state.phase === "dead" || state.phase === "won") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (action.type === "strike") {
    if (state.phase !== "combat") return state;
    const variance = Math.floor(rng() * 5) - 2;
    const dmg = Math.max(1, state.attack + variance);
    let newEnemyHp = state.enemyHp - dmg;
    const logLines = [`Strike: ${dmg} damage to ${state.enemyName}`];
    if (newEnemyHp <= 0) {
      newEnemyHp = 0;
      const phase: DragonHuntState["phase"] = state.floor >= TOTAL_FLOORS ? "won" : "reward";
      return { ...state, rngSeed: nextSeed, enemyHp: newEnemyHp, shield: 0, phase, log: [...state.log, ...logLines, `${state.enemyName} slain!`] };
    }
    const ea = enemyAttack({ ...state, enemyHp: newEnemyHp }, rng);
    let phase: DragonHuntState["phase"] = "combat";
    if (ea.playerHp <= 0) phase = "dead";
    return { ...state, rngSeed: nextSeed, enemyHp: newEnemyHp, playerHp: ea.playerHp, shield: 0, phase, log: [...state.log, ...logLines, ea.log, ...(phase === "dead" ? ["You died!"] : [])] };
  }

  if (action.type === "spellfire") {
    if (state.phase !== "combat") return state;
    if (state.mana < 2) return state;
    const dmg = state.magic + Math.floor(rng() * 8);
    let newEnemyHp = state.enemyHp - dmg;
    const logLines = [`Spellfire: ${dmg} magic damage!`];
    if (newEnemyHp <= 0) {
      newEnemyHp = 0;
      const phase: DragonHuntState["phase"] = state.floor >= TOTAL_FLOORS ? "won" : "reward";
      return { ...state, rngSeed: nextSeed, mana: state.mana - 2, enemyHp: newEnemyHp, shield: 0, phase, log: [...state.log, ...logLines, `${state.enemyName} slain!`] };
    }
    const ea = enemyAttack({ ...state, enemyHp: newEnemyHp }, rng);
    let phase: DragonHuntState["phase"] = "combat";
    if (ea.playerHp <= 0) phase = "dead";
    return { ...state, rngSeed: nextSeed, mana: state.mana - 2, enemyHp: newEnemyHp, playerHp: ea.playerHp, shield: 0, phase, log: [...state.log, ...logLines, ea.log, ...(phase === "dead" ? ["You died!"] : [])] };
  }

  if (action.type === "ward") {
    if (state.phase !== "combat") return state;
    const ward = 8 + Math.floor(rng() * 5);
    const ea = enemyAttack({ ...state, shield: ward }, rng);
    let phase: DragonHuntState["phase"] = "combat";
    if (ea.playerHp <= 0) phase = "dead";
    return { ...state, rngSeed: nextSeed, shield: ward, playerHp: ea.playerHp, phase, log: [...state.log, `Ward: +${ward} shield`, ea.log, ...(phase === "dead" ? ["You died!"] : [])] };
  }

  if (action.type === "rest") {
    if (state.phase !== "combat") return state;
    const healAmt = 6;
    const manaGain = 2;
    const ea = enemyAttack(state, rng);
    let phase: DragonHuntState["phase"] = "combat";
    if (ea.playerHp <= 0) phase = "dead";
    const newHp = Math.min(state.playerMaxHp, ea.playerHp + healAmt);
    const newMana = Math.min(state.maxMana, state.mana + manaGain);
    return { ...state, rngSeed: nextSeed, playerHp: newHp, mana: newMana, shield: 0, phase, log: [...state.log, `Rest: +${healAmt} HP, +${manaGain} mana`, ea.log, ...(phase === "dead" ? ["You died!"] : [])] };
  }

  if (action.type === "nextFloor") {
    if (state.phase !== "reward") return state;
    const nextFloor = state.floor + 1;
    const f = FLOORS[nextFloor - 1]!;
    const healAmt = 8;
    return {
      ...state,
      rngSeed: nextSeed,
      floor: nextFloor,
      enemyName: f.name,
      enemyHp: f.hp,
      enemyMaxHp: f.hp,
      enemyAtk: f.atk,
      shield: 0,
      mana: state.maxMana,
      attack: state.attack + 1,
      magic: state.magic + 1,
      playerHp: Math.min(state.playerMaxHp, state.playerHp + healAmt),
      phase: "combat",
      log: [...state.log, `Floor ${nextFloor}: ${f.name}! +${healAmt} HP, mana restored.`],
    };
  }

  return state;
}

export function isTerminal(state: DragonHuntState): { score: number } | null {
  if (state.phase === "won") return { score: 100 + state.playerHp + state.mana * 5 };
  if (state.phase === "dead") return { score: Math.max(0, (state.floor - 1) * 10 + state.mana * 2) };
  return null;
}
