import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const HERO_MAX_HP = 24;
export const DRAGON_MAX_HP = 60;

export interface DiceDragonFightSettings { dummy: boolean; }

export type Choice = "strike" | "guard" | "focus";

export interface DiceDragonFightState {
  rngSeed: number;
  turn: number;
  heroHp: number;
  dragonHp: number;
  dragonRage: number;
  shield: number;
  rolls: number[];
  score: number;
  phase: "choose" | "result" | "done";
  lastDmg: number;
  lastBreath: number;
  log: string;
}

export type DiceDragonFightAction = { type: "act"; choice: Choice } | { type: "next" };

export function initialState(seed: number, _settings: DiceDragonFightSettings): DiceDragonFightState {
  return { rngSeed: seed, turn: 1, heroHp: HERO_MAX_HP, dragonHp: DRAGON_MAX_HP, dragonRage: 0, shield: 0, rolls: [], score: 0, phase: "choose", lastDmg: 0, lastBreath: 0, log: "" };
}

export function reducer(state: DiceDragonFightState, action: DiceDragonFightAction): DiceDragonFightState {
  if (state.phase === "done") return state;
  if (action.type === "act" && state.phase === "choose") {
    const rng = mulberry32(state.rngSeed);
    const r1 = 1 + Math.floor(rng() * 6);
    const r2 = 1 + Math.floor(rng() * 6);
    const r3 = 1 + Math.floor(rng() * 6);
    const breath = 1 + Math.floor(rng() * 6) + Math.floor(state.dragonRage / 3);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let dmg = 0; let shield = state.shield; let score = state.score; let log = "";
    const rolls = [r1, r2, r3];
    if (action.choice === "strike") {
      const high = rolls.filter(r => r >= 4).length;
      dmg = r1 + r2 + r3 + high * 2;
      log = `Sword strike: ${dmg} dmg.`;
    } else if (action.choice === "guard") {
      shield = Math.max(shield, r1 + r2);
      dmg = r3;
      log = `Guard up (${shield}). Counter ${dmg}.`;
    } else {
      dmg = Math.max(...rolls);
      score += 4;
      log = `Focus chant. Hit ${dmg}, +4 score.`;
    }
    const dragonHp = Math.max(0, state.dragonHp - dmg);
    let incoming = breath;
    if (shield > 0) {
      const used = Math.min(shield, incoming);
      incoming -= used;
      shield -= used;
    }
    const heroHp = Math.max(0, state.heroHp - incoming);
    if (incoming > 0) log += ` Breath ${breath} (${incoming} through).`;
    else log += ` Breath blocked!`;
    let phase: DiceDragonFightState["phase"] = "result";
    if (dragonHp === 0) {
      phase = "done";
      const bonus = 80 + state.heroHp * 3;
      score += bonus;
      log += ` DRAGON SLAIN +${bonus}`;
    } else if (heroHp === 0) {
      phase = "done";
      log += ` Hero falls.`;
    }
    return { ...state, rngSeed: nextSeed, rolls, dragonHp, heroHp, shield, score, phase, lastDmg: dmg, lastBreath: breath, log, dragonRage: state.dragonRage + 1 };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, turn: state.turn + 1, phase: "choose", rolls: [], lastDmg: 0, lastBreath: 0, log: "" };
  }
  return state;
}

export function isTerminal(state: DiceDragonFightState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
