import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Safe Keeper (Three-Man variant, renamed):
// 1 player vs 2 bots. One player is "Safe Keeper" until someone rolls a 3.
// Turn: roll 2 dice.
//   Sum 7 → Safe Keeper gets a mark (penalty).
//   Sum 11 → roller gets a mark.
//   Doubles → distribute dice: one to each neighbor.
//   Double 3s → Safe Keeper gets 2 marks.
//   Any 3 face → Safe Keeper gets a mark.
// First to N marks loses.

export interface SafeKeeperSettings {
  marksToLose: "5" | "7" | "10";
}

export type SKPhase = "rolling" | "gameOver";
export type Player = 0 | 1 | 2; // 0=human, 1=bot1, 2=bot2

export interface SafeKeeperState {
  settings: SafeKeeperSettings;
  rngSeed: number;
  phase: SKPhase;
  activePlayer: Player;
  safeKeeper: Player;
  marks: [number, number, number]; // marks for each player
  marksToLose: number;
  lastRoll: [number, number] | null;
  lastEvents: string[];
  message: string;
  loser: Player | null;
  gameOver: boolean;
}

export type SafeKeeperAction =
  | { type: "roll" };

export function initialState(seed: number, settings: SafeKeeperSettings): SafeKeeperState {
  return {
    settings,
    rngSeed: seed,
    phase: "rolling",
    activePlayer: 0,
    safeKeeper: 0, // player starts as Safe Keeper
    marks: [0, 0, 0],
    marksToLose: parseInt(settings.marksToLose, 10),
    lastRoll: null,
    lastEvents: [],
    message: "You are the Safe Keeper. Roll to begin!",
    loser: null,
    gameOver: false,
  };
}

function playerName(p: Player): string {
  return p === 0 ? "You" : `Bot ${p}`;
}

function applyMarkForSK(marks: [number, number, number], sk: Player, amount: number): [number, number, number] {
  const m: [number, number, number] = [...marks] as [number, number, number];
  m[sk] = m[sk]! + amount;
  return m;
}

function applyMarkForPlayer(marks: [number, number, number], player: Player, amount: number): [number, number, number] {
  const m: [number, number, number] = [...marks] as [number, number, number];
  m[player] = m[player]! + amount;
  return m;
}

function nextPlayer(p: Player): Player {
  return ((p + 1) % 3) as Player;
}

function leftNeighbor(p: Player): Player {
  return ((p + 1) % 3) as Player;
}

function rightNeighbor(p: Player): Player {
  return ((p + 2) % 3) as Player;
}

export function reducer(state: SafeKeeperState, action: SafeKeeperAction): SafeKeeperState {
  if (state.gameOver) return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "rolling") return state;

      const rng = mulberry32(state.rngSeed);
      const d1 = Math.floor(rng() * 6) + 1;
      const d2 = Math.floor(rng() * 6) + 1;
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const sum = d1 + d2;
      const isDoubles = d1 === d2;

      let marks = [...state.marks] as [number, number, number];
      const events: string[] = [`${playerName(state.activePlayer)} rolled ${d1}+${d2}=${sum}.`];

      // Check for new Safe Keeper: any 3 face
      let newSK = state.safeKeeper;
      if ((d1 === 3 || d2 === 3) && state.activePlayer !== state.safeKeeper) {
        newSK = state.activePlayer;
        events.push(`${playerName(state.activePlayer)} rolled a 3 — they become the new Safe Keeper!`);
      }

      // Apply rules
      if (isDoubles && d1 === 3) {
        // Double 3s: Safe Keeper gets 2 marks
        marks = applyMarkForSK(marks, newSK, 2);
        events.push(`Double 3s! Safe Keeper (${playerName(newSK)}) gets 2 marks.`);
      } else {
        if (d1 === 3 || d2 === 3) {
          marks = applyMarkForSK(marks, newSK, 1);
          events.push(`A 3 was rolled! Safe Keeper (${playerName(newSK)}) gets a mark.`);
        }
        if (sum === 7) {
          marks = applyMarkForSK(marks, newSK, 1);
          events.push(`Sum is 7! Safe Keeper (${playerName(newSK)}) gets a mark.`);
        } else if (sum === 11) {
          marks = applyMarkForPlayer(marks, state.activePlayer, 1);
          events.push(`Sum is 11! ${playerName(state.activePlayer)} gets a mark.`);
        }
        if (isDoubles && d1 !== 3) {
          // Distribute dice to neighbors — neighbors each get a mark
          const ln = leftNeighbor(state.activePlayer);
          const rn = rightNeighbor(state.activePlayer);
          marks = applyMarkForPlayer(marks, ln, 1);
          marks = applyMarkForPlayer(marks, rn, 1);
          events.push(`Doubles! ${playerName(ln)} and ${playerName(rn)} each get a mark.`);
        }
      }

      // Check for loser
      let loser: Player | null = null;
      for (let p = 0; p < 3; p++) {
        if (marks[p]! >= state.marksToLose) {
          loser = p as Player;
          break;
        }
      }

      const gameOver = loser !== null;
      const nextActive = gameOver ? state.activePlayer : nextPlayer(state.activePlayer);

      const marksStr = `Marks — You: ${marks[0]}, Bot 1: ${marks[1]}, Bot 2: ${marks[2]}`;
      const safeKeeperStr = `Safe Keeper: ${playerName(newSK)}`;

      return {
        ...state,
        rngSeed: nextSeed,
        marks,
        safeKeeper: newSK,
        lastRoll: [d1, d2],
        lastEvents: events,
        activePlayer: nextActive,
        phase: gameOver ? "gameOver" : "rolling",
        loser,
        gameOver,
        message: gameOver
          ? `${playerName(loser!)} reached ${state.marksToLose} marks and loses! ${marksStr}.`
          : `${marksStr}. ${safeKeeperStr}. ${nextActive === 0 ? "Your turn!" : `${playerName(nextActive)}'s turn...`}`,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SafeKeeperState): { score: number } | null {
  if (!state.gameOver) return null;
  // Score: player wins if they're not the loser
  return { score: state.loser === 0 ? 0 : 1 };
}
