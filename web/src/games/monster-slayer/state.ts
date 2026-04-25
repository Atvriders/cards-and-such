import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Monster {
  name: string;
  maxHp: number;
  hp: number;
  attack: number;
  armor: number;
}

const MONSTERS: Omit<Monster, "hp">[] = [
  { name: "Slime",        maxHp: 12, attack: 2, armor: 0 },
  { name: "Bat Swarm",    maxHp: 16, attack: 3, armor: 0 },
  { name: "Goblin",       maxHp: 20, attack: 4, armor: 1 },
  { name: "Wolf",         maxHp: 24, attack: 5, armor: 0 },
  { name: "Orc Warrior",  maxHp: 30, attack: 6, armor: 2 },
  { name: "Stone Golem",  maxHp: 35, attack: 5, armor: 4 },
  { name: "Dark Mage",    maxHp: 28, attack: 8, armor: 1 },
  { name: "Wyvern",       maxHp: 45, attack: 10, armor: 3 },
  { name: "Lich",         maxHp: 50, attack: 12, armor: 2 },
  { name: "Dragon Lord",  maxHp: 70, attack: 15, armor: 5 },
];

export type AbilityType = "slash" | "bash" | "pierce" | "guard" | "potion" | "magic";

export interface Ability {
  type: AbilityType;
  name: string;
  desc: string;
  cooldown: number; // turns between uses
}

export const ABILITIES: Ability[] = [
  { type: "slash",  name: "Slash",   desc: "3d6 damage",          cooldown: 0 },
  { type: "bash",   name: "Bash",    desc: "2d8 + stun 1 turn",   cooldown: 2 },
  { type: "pierce", name: "Pierce",  desc: "2d6 pierce armor",    cooldown: 1 },
  { type: "guard",  name: "Guard",   desc: "+8 armor next turn",  cooldown: 1 },
  { type: "potion", name: "Potion",  desc: "Heal 15 HP",          cooldown: 3 },
  { type: "magic",  name: "Magic",   desc: "4d4 true damage",     cooldown: 2 },
];

export interface MonsterSlayerState {
  rngSeed: number;
  wave: number;
  maxWaves: number;
  playerHp: number;
  playerMaxHp: number;
  playerArmor: number;
  tempArmor: number; // from guard, lasts 1 turn
  monster: Monster;
  cooldowns: Record<AbilityType, number>;
  monsterStunned: number; // turns remaining
  log: readonly string[];
  phase: "combat" | "reward" | "done" | "dead";
}

export type MonsterSlayerAction =
  | { type: "useAbility"; ability: AbilityType }
  | { type: "nextWave" };

function roll(sides: number, count: number, rng: () => number): number {
  let total = 0;
  for (let i = 0; i < count; i++) total += Math.floor(rng() * sides) + 1;
  return total;
}

export function initialState(seed: number): MonsterSlayerState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const m = MONSTERS[0]!;
  return {
    rngSeed: nextSeed,
    wave: 1,
    maxWaves: MONSTERS.length,
    playerHp: 60,
    playerMaxHp: 60,
    playerArmor: 2,
    tempArmor: 0,
    monster: { ...m, hp: m.maxHp },
    cooldowns: { slash: 0, bash: 0, pierce: 0, guard: 0, potion: 0, magic: 0 },
    monsterStunned: 0,
    log: ["A Slime blocks your path!"],
    phase: "combat",
  };
}

export function reducer(state: MonsterSlayerState, action: MonsterSlayerAction): MonsterSlayerState {
  if (state.phase === "done" || state.phase === "dead") return state;

  switch (action.type) {
    case "useAbility": {
      if (state.phase !== "combat") return state;
      const ability = ABILITIES.find(a => a.type === action.ability)!;
      if (state.cooldowns[action.ability] > 0) return state;

      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const logLines: string[] = [];

      let monsterHp = state.monster.hp;
      let playerHp = state.playerHp;
      let tempArmor = 0;
      let monsterStunned = Math.max(0, state.monsterStunned - 1);
      const cooldowns = { ...state.cooldowns };

      // Set cooldown for used ability
      cooldowns[action.ability] = ability.cooldown + 1;
      // Tick down other cooldowns
      for (const key of Object.keys(cooldowns) as AbilityType[]) {
        if (key !== action.ability && cooldowns[key] > 0) cooldowns[key]--;
      }

      // Player action
      switch (action.ability) {
        case "slash": {
          const dmg = Math.max(0, roll(6, 3, rng) - state.monster.armor);
          monsterHp -= dmg;
          logLines.push(`Slash: dealt ${dmg} damage.`);
          break;
        }
        case "bash": {
          const dmg = Math.max(0, roll(8, 2, rng) - state.monster.armor);
          monsterHp -= dmg;
          monsterStunned = 1;
          logLines.push(`Bash: dealt ${dmg} damage + stunned!`);
          break;
        }
        case "pierce": {
          const dmg = roll(6, 2, rng); // ignores armor
          monsterHp -= dmg;
          logLines.push(`Pierce: ${dmg} armor-piercing damage.`);
          break;
        }
        case "guard": {
          tempArmor = 8;
          logLines.push("Guard: +8 armor this turn.");
          break;
        }
        case "potion": {
          const heal = 15;
          playerHp = Math.min(state.playerMaxHp, playerHp + heal);
          logLines.push(`Potion: healed ${heal} HP.`);
          break;
        }
        case "magic": {
          const dmg = roll(4, 4, rng); // true damage, no armor
          monsterHp -= dmg;
          logLines.push(`Magic: ${dmg} true damage.`);
          break;
        }
      }

      const monster = { ...state.monster, hp: Math.max(0, monsterHp) };

      // Check monster death
      if (monster.hp <= 0) {
        logLines.push(`${monster.name} defeated!`);
        const isDone = state.wave >= state.maxWaves;
        return {
          ...state,
          rngSeed: nextSeed,
          monster,
          phase: isDone ? "done" : "reward",
          cooldowns,
          log: [...state.log, ...logLines],
        };
      }

      // Monster attacks (if not stunned)
      let finalPlayerHp = playerHp;
      if (monsterStunned <= 0) {
        const totalArmor = state.playerArmor + tempArmor;
        const attackRoll = roll(6, 2, rng) + state.monster.attack - 6; // base attack
        const dmgToPlayer = Math.max(0, attackRoll - totalArmor);
        finalPlayerHp = Math.max(0, playerHp - dmgToPlayer);
        logLines.push(`${monster.name} attacks for ${dmgToPlayer} (armor ${totalArmor}).`);
      } else {
        logLines.push(`${monster.name} is stunned!`);
      }

      if (finalPlayerHp <= 0) {
        return {
          ...state,
          rngSeed: nextSeed,
          playerHp: 0,
          phase: "dead",
          log: [...state.log, ...logLines, "You have fallen!"],
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        playerHp: finalPlayerHp,
        tempArmor,
        monster,
        cooldowns,
        monsterStunned,
        log: [...state.log, ...logLines],
      };
    }

    case "nextWave": {
      if (state.phase !== "reward") return state;
      const nextWave = state.wave + 1;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const mDef = MONSTERS[Math.min(nextWave - 1, MONSTERS.length - 1)]!;
      const monster: Monster = { ...mDef, hp: mDef.maxHp };
      // Heal 20% between waves
      const healAmount = Math.round(state.playerMaxHp * 0.2);
      const cooldowns = { ...state.cooldowns };
      for (const key of Object.keys(cooldowns) as AbilityType[]) {
        if (cooldowns[key] > 0) cooldowns[key]--;
      }
      return {
        ...state,
        rngSeed: nextSeed,
        wave: nextWave,
        monster,
        phase: "combat",
        playerHp: Math.min(state.playerMaxHp, state.playerHp + healAmount),
        tempArmor: 0,
        monsterStunned: 0,
        cooldowns,
        log: [...state.log, `Wave ${nextWave}: ${monster.name} appears!`],
      };
    }
  }
}

export function isTerminal(state: MonsterSlayerState): { score: number } | null {
  if (state.phase === "done") return { score: 100 };
  if (state.phase === "dead") {
    return { score: Math.max(0, Math.round(((state.wave - 1) / state.maxWaves) * 80)) };
  }
  return null;
}
