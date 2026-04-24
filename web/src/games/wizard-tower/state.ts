import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Spell = "fire" | "ice" | "lightning" | "arcane" | "shield" | "drain";

export interface SpellDef {
  name: string;
  cost: number;
  damage: number;
  shield: number;
  drain: number; // HP leech
  combo: Spell | null; // if last spell was this, bonus damage
  comboBonus: number;
  desc: string;
}

export const SPELLS: Record<Spell, SpellDef> = {
  fire:      { name: "Fireball",    cost: 2, damage: 14, shield: 0, drain: 0, combo: "ice",       comboBonus: 8,  desc: "14 dmg (22 if after Ice)" },
  ice:       { name: "Ice Lance",   cost: 1, damage: 8,  shield: 0, drain: 0, combo: "lightning",  comboBonus: 6,  desc: "8 dmg (14 if after Lightning)" },
  lightning: { name: "Lightning",   cost: 2, damage: 12, shield: 0, drain: 0, combo: "fire",       comboBonus: 10, desc: "12 dmg (22 if after Fire)" },
  arcane:    { name: "Arcane Bolt", cost: 1, damage: 6,  shield: 0, drain: 0, combo: null,    comboBonus: 0,  desc: "6 dmg, no cost bonus" },
  shield:    { name: "Mana Shield", cost: 1, damage: 0,  shield: 15, drain: 0, combo: null,   comboBonus: 0,  desc: "+15 shield" },
  drain:     { name: "Drain",       cost: 2, damage: 10, shield: 0, drain: 8, combo: "arcane",     comboBonus: 5,  desc: "10 dmg + 8 HP drain" },
};

export interface WaveEnemy {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
}

export interface WizardTowerState {
  rngSeed: number;
  wave: number;
  totalWaves: number;
  enemies: readonly WaveEnemy[];
  playerHp: number;
  playerMaxHp: number;
  mana: number;
  maxMana: number;
  shield: number;
  lastSpell: Spell | null;
  phase: "combat" | "waveClear" | "dead" | "won";
  log: readonly string[];
}

export type WizardTowerAction =
  | { type: "cast"; spell: Spell }
  | { type: "endRound" }
  | { type: "nextWave" };

const WAVES: Array<Array<{ name: string; hp: number; atk: number }>> = [
  [{ name: "Imp",       hp: 15, atk: 4 }],
  [{ name: "Goblin",    hp: 12, atk: 5 }, { name: "Goblin",  hp: 12, atk: 5 }],
  [{ name: "Orc",       hp: 28, atk: 8 }],
  [{ name: "Skeleton",  hp: 20, atk: 6 }, { name: "Skeleton", hp: 20, atk: 6 }],
  [{ name: "Golem",     hp: 50, atk: 12 }],
];

export function initialState(seed: number): WizardTowerState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const wave = WAVES[0]!;
  return {
    rngSeed: nextSeed,
    wave: 1,
    totalWaves: WAVES.length,
    enemies: wave.map(e => ({ ...e, maxHp: e.hp })),
    playerHp: 40,
    playerMaxHp: 40,
    mana: 6,
    maxMana: 6,
    shield: 0,
    lastSpell: null,
    phase: "combat",
    log: ["Cast spells to defeat enemy waves! Combos deal bonus damage."],
  };
}

export function reducer(state: WizardTowerState, action: WizardTowerAction): WizardTowerState {
  if (state.phase === "dead" || state.phase === "won") return state;

  if (action.type === "cast") {
    if (state.phase !== "combat") return state;
    const def = SPELLS[action.spell];
    if (state.mana < def.cost) return state;

    let { playerHp, mana, shield } = state;
    mana -= def.cost;

    // Combo check
    const isCombo = def.combo && state.lastSpell === def.combo;
    const totalDmg = def.damage + (isCombo ? def.comboBonus : 0);

    // Deal damage to front enemy
    let enemies = [...state.enemies];
    const logLines: string[] = [];
    if (isCombo) logLines.push(`COMBO! +${def.comboBonus} bonus damage`);

    if (totalDmg > 0 && enemies.length > 0) {
      const front = { ...enemies[0]! };
      front.hp = Math.max(0, front.hp - totalDmg);
      logLines.push(`${def.name}: ${totalDmg} dmg to ${front.name} (${front.hp} HP left)`);
      enemies[0] = front;
      // Remove dead enemies
      enemies = enemies.filter(e => e.hp > 0);
    }

    if (def.shield > 0) {
      shield += def.shield;
      logLines.push(`${def.name}: +${def.shield} shield`);
    }

    if (def.drain > 0) {
      playerHp = Math.min(state.playerMaxHp, playerHp + def.drain);
      logLines.push(`${def.name}: +${def.drain} HP drained`);
    }

    const allDead = enemies.length === 0;
    let phase: WizardTowerState["phase"] = "combat";
    if (allDead) {
      phase = state.wave >= state.totalWaves ? "won" : "waveClear";
      logLines.push(`Wave ${state.wave} cleared!`);
    }

    return {
      ...state,
      mana,
      playerHp,
      shield,
      enemies,
      lastSpell: action.spell,
      phase,
      log: [...state.log, ...logLines],
    };
  }

  if (action.type === "endRound") {
    if (state.phase !== "combat") return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let { playerHp, shield } = state;
    const logLines: string[] = [];

    for (const enemy of state.enemies) {
      const variance = Math.floor(rng() * 3) - 1;
      const raw = Math.max(1, enemy.atk + variance);
      const dmg = Math.max(0, raw - shield);
      shield = Math.max(0, shield - raw); // shield erodes
      playerHp = Math.max(0, playerHp - dmg);
      logLines.push(`${enemy.name}: ${raw} atk, ${dmg} after shield`);
    }

    // Regen 2 mana per round
    const newMana = Math.min(state.maxMana, state.mana + 2);
    let phase: WizardTowerState["phase"] = "combat";
    if (playerHp <= 0) { phase = "dead"; logLines.push("You died!"); }

    return { ...state, rngSeed: nextSeed, playerHp, shield: 0, mana: newMana, phase, log: [...state.log, ...logLines] };
  }

  if (action.type === "nextWave") {
    if (state.phase !== "waveClear") return state;
    const nextWave = state.wave + 1;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const waveDef = WAVES[nextWave - 1]!;
    return {
      ...state,
      rngSeed: nextSeed,
      wave: nextWave,
      enemies: waveDef.map(e => ({ ...e, maxHp: e.hp })),
      mana: state.maxMana,
      shield: 0,
      lastSpell: null,
      playerHp: Math.min(state.playerMaxHp, state.playerHp + 8),
      phase: "combat",
      log: [...state.log, `Wave ${nextWave}: ${waveDef.map(e => e.name).join(", ")}! +8 HP, mana restored.`],
    };
  }

  return state;
}

export function isTerminal(state: WizardTowerState): { score: number } | null {
  if (state.phase === "won") return { score: 100 + state.playerHp * 2 + state.mana * 5 };
  if (state.phase === "dead") return { score: Math.max(0, (state.wave - 1) * 15) };
  return null;
}
