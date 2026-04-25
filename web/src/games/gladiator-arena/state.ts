import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface GladiatorArenaSettings {
  difficulty: "easy" | "normal" | "hard";
}

export interface Gladiator {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  name: string;
}

export interface GladiatorArenaState {
  settings: GladiatorArenaSettings;
  rngSeed: number;
  player: Gladiator;
  opponent: Gladiator;
  round: number;
  log: string[];
  gameOver: boolean;
  playerWon: boolean;
  actionUsed: boolean; // one action per round
}

export type GladiatorArenaAction =
  | { type: "strike" }
  | { type: "powerStrike" }
  | { type: "defend" }
  | { type: "restart" };

const OPPONENT_NAMES = [
  "Brutus", "Maximus", "Spartacus", "Nero", "Titus",
  "Decimus", "Gaius", "Lucius", "Marcus", "Claudius",
];

function difficultyParams(d: GladiatorArenaSettings["difficulty"]) {
  if (d === "easy") return { oppAtk: 3, oppDef: 1, oppHp: 20 };
  if (d === "hard") return { oppAtk: 7, oppDef: 3, oppHp: 40 };
  return { oppAtk: 5, oppDef: 2, oppHp: 30 };
}

function makeOpponent(seed: number, round: number, settings: GladiatorArenaSettings): Gladiator {
  const rng = mulberry32(seed + round * 7);
  const params = difficultyParams(settings.difficulty);
  const nameIdx = Math.floor(rng() * OPPONENT_NAMES.length);
  const name = OPPONENT_NAMES[nameIdx] ?? "Gladiator";
  const hpBonus = round * 3;
  return {
    hp: params.oppHp + hpBonus,
    maxHp: params.oppHp + hpBonus,
    attack: params.oppAtk + Math.floor(round / 2),
    defense: params.oppDef,
    name,
  };
}

export function initialState(seed: number, settings: GladiatorArenaSettings): GladiatorArenaState {
  const rng = mulberry32(seed);
  void rng();
  return {
    settings,
    rngSeed: seed,
    player: { hp: 50, maxHp: 50, attack: 8, defense: 2, name: "You" },
    opponent: makeOpponent(seed, 1, settings),
    round: 1,
    log: ["Round 1 begins! Choose your action."],
    gameOver: false,
    playerWon: false,
    actionUsed: false,
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function reducer(state: GladiatorArenaState, action: GladiatorArenaAction): GladiatorArenaState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.gameOver || state.actionUsed) return state;

  const rng = mulberry32(state.rngSeed + state.round * 31 + (action.type === "strike" ? 1 : action.type === "powerStrike" ? 2 : 3));

  let playerDmg = 0;
  let playerDef = state.player.defense;
  let logMsg = "";

  if (action.type === "strike") {
    playerDmg = clamp(state.player.attack - state.opponent.defense + Math.floor(rng() * 4), 1, 20);
    logMsg = `You strike ${state.opponent.name} for ${playerDmg} damage.`;
  } else if (action.type === "powerStrike") {
    const raw = (state.player.attack * 2) - state.opponent.defense + Math.floor(rng() * 6);
    playerDmg = clamp(raw, 2, 30);
    logMsg = `You unleash a POWER STRIKE on ${state.opponent.name} for ${playerDmg} damage!`;
  } else if (action.type === "defend") {
    playerDef += 4;
    logMsg = `You brace for defense (+4 def this round).`;
  }

  // Opponent counter-attacks
  const oppRng = mulberry32(state.rngSeed + state.round * 53);
  const oppDmg = Math.max(1, state.opponent.attack - playerDef + Math.floor(oppRng() * 4));
  const oppMsg = `${state.opponent.name} hits you for ${oppDmg} damage.`;

  const newOppHp = state.opponent.hp - playerDmg;
  const newPlayerHp = state.player.hp - oppDmg;

  const newLog = [...state.log, logMsg, oppMsg];

  if (newOppHp <= 0) {
    const nextRound = state.round + 1;
    const newOpp = makeOpponent(state.rngSeed, nextRound, state.settings);
    // Restore some player hp
    const healedHp = Math.min(state.player.maxHp, newPlayerHp + 10);
    newLog.push(`${state.opponent.name} is defeated! Round ${nextRound} begins. (+10 HP recovered)`);
    return {
      ...state,
      player: { ...state.player, hp: healedHp, attack: state.player.attack + 1 },
      opponent: newOpp,
      round: nextRound,
      log: newLog.slice(-8),
      actionUsed: false,
    };
  }

  if (newPlayerHp <= 0) {
    newLog.push("You have fallen in the arena!");
    return {
      ...state,
      player: { ...state.player, hp: 0 },
      opponent: { ...state.opponent, hp: newOppHp },
      log: newLog.slice(-8),
      gameOver: true,
      playerWon: false,
      actionUsed: true,
    };
  }

  return {
    ...state,
    player: { ...state.player, hp: newPlayerHp },
    opponent: { ...state.opponent, hp: newOppHp },
    log: newLog.slice(-8),
    actionUsed: true,
  };
}

export function isTerminal(state: GladiatorArenaState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.min(100, (state.round - 1) * 20) };
}
