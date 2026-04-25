import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Opponent {
  name: string;
  title: string;
  maxHp: number;
  attack: number;
  defense: number; // reduces damage
  special: string; // flavor
}

const OPPONENTS: Opponent[] = [
  { name: "Rex",      title: "The Rookie",       maxHp: 20, attack: 4,  defense: 0, special: "Eager but clumsy" },
  { name: "Mira",     title: "Iron Fist",         maxHp: 25, attack: 5,  defense: 1, special: "Blocks well" },
  { name: "Vorn",     title: "The Crusher",       maxHp: 30, attack: 6,  defense: 2, special: "Tanky brawler" },
  { name: "Sasha",    title: "Serpent Dancer",    maxHp: 28, attack: 8,  defense: 1, special: "Fast strikes" },
  { name: "Goran",    title: "Mountain",          maxHp: 40, attack: 7,  defense: 3, special: "Immovable" },
  { name: "Lysandra", title: "Phantom Blade",     maxHp: 35, attack: 10, defense: 2, special: "Evasive" },
  { name: "Thrak",    title: "Warlord",           maxHp: 50, attack: 9,  defense: 4, special: "Relentless" },
  { name: "Aria",     title: "Champion Eternal",  maxHp: 60, attack: 12, defense: 5, special: "Perfect fighter" },
];

export type MoveType = "heavy" | "quick" | "feint" | "brace";

export interface ArenaChampionState {
  rngSeed: number;
  round: number;
  maxRounds: number;
  playerHp: number;
  playerMaxHp: number;
  playerBrace: number; // damage reduction for next hit
  opponentHp: number;
  opponent: Opponent;
  wins: number;
  log: readonly string[];
  phase: "choose" | "result" | "done" | "dead";
}

export type ArenaChampionAction =
  | { type: "move"; move: MoveType }
  | { type: "nextFight" };

export function initialState(seed: number): ArenaChampionState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const opp = OPPONENTS[0]!;
  return {
    rngSeed: nextSeed,
    round: 1,
    maxRounds: OPPONENTS.length,
    playerHp: 50,
    playerMaxHp: 50,
    playerBrace: 0,
    opponentHp: opp.maxHp,
    opponent: opp,
    wins: 0,
    log: [`The crowd roars! First opponent: ${opp.name} "${opp.title}"!`],
    phase: "choose",
  };
}

function rollD6(rng: () => number): number { return Math.floor(rng() * 6) + 1; }
function rollD4(rng: () => number): number { return Math.floor(rng() * 4) + 1; }

export function reducer(state: ArenaChampionState, action: ArenaChampionAction): ArenaChampionState {
  if (state.phase === "done" || state.phase === "dead") return state;

  switch (action.type) {
    case "move": {
      if (state.phase !== "choose") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const logLines: string[] = [];

      let playerHp = state.playerHp;
      let opponentHp = state.opponentHp;
      let brace = 0;

      // Player move
      switch (action.move) {
        case "heavy": {
          const dmg = Math.max(0, rollD6(rng) + rollD6(rng) + 2 - state.opponent.defense);
          opponentHp -= dmg;
          logLines.push(`Heavy Strike: ${dmg} damage.`);
          break;
        }
        case "quick": {
          const dmg1 = Math.max(0, rollD4(rng) + 1 - state.opponent.defense);
          const dmg2 = Math.max(0, rollD4(rng) + 1 - state.opponent.defense);
          opponentHp -= dmg1 + dmg2;
          logLines.push(`Quick Strikes: ${dmg1}+${dmg2} damage.`);
          break;
        }
        case "feint": {
          // Feint: low damage but reduces opponent's next attack by 50%
          const dmg = Math.max(0, rollD4(rng) - state.opponent.defense);
          opponentHp -= dmg;
          logLines.push(`Feint: ${dmg} damage + opponent attack halved!`);
          break;
        }
        case "brace": {
          brace = 6;
          logLines.push("Braced for impact: +6 damage reduction this exchange.");
          break;
        }
      }

      opponentHp = Math.max(0, opponentHp);

      // Opponent attack (if still alive)
      if (opponentHp > 0) {
        let oppAtk = rollD6(rng) + state.opponent.attack - 4;
        if (action.move === "feint") oppAtk = Math.ceil(oppAtk / 2);
        const totalBlock = state.playerBrace + brace;
        const dmgToPlayer = Math.max(0, oppAtk - totalBlock);
        playerHp = Math.max(0, playerHp - dmgToPlayer);
        logLines.push(`${state.opponent.name} attacks for ${dmgToPlayer} (block ${totalBlock}).`);
      } else {
        logLines.push(`${state.opponent.name} is defeated!`);
      }

      // Check outcomes
      if (playerHp <= 0) {
        return {
          ...state,
          rngSeed: nextSeed,
          playerHp: 0,
          opponentHp,
          phase: "dead",
          log: [...state.log, ...logLines, "You fall! The arena falls silent."],
        };
      }

      if (opponentHp <= 0) {
        const newWins = state.wins + 1;
        const isDone = state.round >= state.maxRounds;
        return {
          ...state,
          rngSeed: nextSeed,
          playerHp,
          opponentHp,
          wins: newWins,
          phase: isDone ? "done" : "result",
          log: [...state.log, ...logLines],
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        playerHp,
        playerBrace: brace,
        opponentHp,
        log: [...state.log, ...logLines],
        phase: "choose",
      };
    }

    case "nextFight": {
      if (state.phase !== "result") return state;
      const nextRound = state.round + 1;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const opp = OPPONENTS[Math.min(nextRound - 1, OPPONENTS.length - 1)]!;
      // Heal 25% between fights
      const heal = Math.round(state.playerMaxHp * 0.25);
      return {
        ...state,
        rngSeed: nextSeed,
        round: nextRound,
        opponent: opp,
        opponentHp: opp.maxHp,
        playerHp: Math.min(state.playerMaxHp, state.playerHp + heal),
        playerBrace: 0,
        phase: "choose",
        log: [...state.log, `Fight ${nextRound}: ${opp.name} "${opp.title}" enters the arena!`],
      };
    }
  }
}

export function isTerminal(state: ArenaChampionState): { score: number } | null {
  if (state.phase === "done") return { score: 100 };
  if (state.phase === "dead") {
    return { score: Math.round((state.wins / state.maxRounds) * 80) };
  }
  return null;
}
