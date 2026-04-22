import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PrimeClimbSettings {
  botSpeed: "slow" | "fast";
}

export type Operation = "+" | "-" | "*" | "/";

export interface PawnState {
  pos: number;
}

export interface PCState {
  settings: PrimeClimbSettings;
  rngSeed: number;
  // Player has 2 pawns, bot has 2 pawns
  player: [number, number];
  bot: [number, number];
  dice: [number, number];
  turn: "player" | "bot";
  pendingDice: number[]; // dice values left to apply
  selectedPawn: 0 | 1 | null;
  gameOver: boolean;
  winner: "player" | "bot" | null;
  message: string;
}

export type PCAction =
  | { type: "roll" }
  | { type: "apply"; pawnIdx: 0 | 1; die: number; op: Operation }
  | { type: "restart" };

const TARGET = 101;

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
  return true;
}

function applyOp(pos: number, die: number, op: Operation): number {
  let result: number;
  switch (op) {
    case "+": result = pos + die; break;
    case "-": result = pos - die; break;
    case "*": result = pos * die; break;
    case "/":
      if (die === 0 || pos % die !== 0) return -1; // invalid
      result = pos / die;
      break;
  }
  if (result! < 0 || result! > TARGET) return -1; // out of range
  return result!;
}

function rollDice(rng: () => number): [number, number] {
  return [Math.floor(rng() * 10) + 1, Math.floor(rng() * 10) + 1];
}

function botApplyDice(pawns: [number, number], dice: number[]): [number, number] {
  // Simple greedy: try all combos and pick the one that maximizes min(pawn positions)
  const ops: Operation[] = ["+", "-", "*", "/"];
  let best: [number, number] = [...pawns] as [number, number];
  let bestScore = Math.min(pawns[0], pawns[1]);

  for (let di = 0; di < dice.length; di++) {
    for (let pi = 0; pi < 2; pi++) {
      for (const op of ops) {
        const newPos = applyOp(pawns[pi]!, dice[di]!, op);
        if (newPos === -1) continue;
        const newPawns: [number, number] = [...pawns] as [number, number];
        newPawns[pi] = newPos === TARGET && !isPrime(TARGET) ? 0 : newPos;
        // Apply second die
        const remaining = dice.filter((_, j) => j !== di);
        if (remaining.length > 0) {
          for (let pi2 = 0; pi2 < 2; pi2++) {
            for (const op2 of ops) {
              const newPos2 = applyOp(newPawns[pi2]!, remaining[0]!, op2);
              if (newPos2 === -1) continue;
              const finalPawns: [number, number] = [...newPawns] as [number, number];
              finalPawns[pi2] = newPos2 === TARGET && !isPrime(TARGET) ? 0 : newPos2;
              const score = Math.min(finalPawns[0], finalPawns[1]);
              if (score > bestScore) {
                bestScore = score;
                best = finalPawns;
              }
            }
          }
        } else {
          const score = Math.min(newPawns[0], newPawns[1]);
          if (score > bestScore) {
            bestScore = score;
            best = newPawns;
          }
        }
      }
    }
  }

  return best;
}

export function initialState(seed: number, settings: PrimeClimbSettings): PCState {
  const rng = mulberry32(seed);
  const dice = rollDice(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    settings,
    rngSeed: nextSeed,
    player: [0, 0],
    bot: [0, 0],
    dice,
    turn: "player",
    pendingDice: [...dice],
    selectedPawn: null,
    gameOver: false,
    winner: null,
    message: `Roll! Dice: ${dice[0]}, ${dice[1]}`,
  };
}

export function reducer(state: PCState, action: PCAction): PCState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);

  if (action.type === "roll") {
    if (state.gameOver) return state;
    if (state.turn !== "player" || state.pendingDice.length > 0) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const dice = rollDice(rng);
    return {
      ...state,
      rngSeed: nextSeed,
      dice,
      pendingDice: [...dice],
      message: `Dice: ${dice[0]}, ${dice[1]} — pick a pawn and operation`,
    };
  }

  if (action.type === "apply") {
    if (state.gameOver) return state;
    if (state.turn !== "player") return state;
    if (!state.pendingDice.includes(action.die)) return state;

    const { pawnIdx, die, op } = action;
    const newPos = applyOp(state.player[pawnIdx], die, op);
    if (newPos === -1) return { ...state, message: "Invalid move!" };

    // Landing on prime > 0 at TARGET is a win condition check
    // Landing on TARGET (non-prime) sends pawn back to 0
    let finalPos = newPos;
    let msg = `Pawn ${pawnIdx + 1}: ${state.player[pawnIdx]} ${op} ${die} = ${newPos}`;
    if (newPos === TARGET && !isPrime(TARGET)) {
      // 101 IS prime, so this branch won't trigger for TARGET=101
      finalPos = 0;
      msg += " → not prime, back to 0!";
    }

    const newPlayer: [number, number] = [...state.player] as [number, number];
    newPlayer[pawnIdx] = finalPos;

    const newPending = [...state.pendingDice];
    const dieIdx = newPending.indexOf(die);
    newPending.splice(dieIdx, 1);

    // Check player win
    if (newPlayer[0] === TARGET && newPlayer[1] === TARGET) {
      return { ...state, player: newPlayer, pendingDice: newPending, gameOver: true, winner: "player", message: "You win! Both pawns reach 101!" };
    }

    // If no more dice, switch to bot
    if (newPending.length === 0) {
      // Bot turn
      const rng = mulberry32(state.rngSeed);
      const botDice = rollDice(rng);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const newBot = botApplyDice(state.bot, [...botDice]);

      // Check bot win
      if (newBot[0] === TARGET && newBot[1] === TARGET) {
        return { ...state, player: newPlayer, bot: newBot, rngSeed: nextSeed, gameOver: true, winner: "bot", message: "Bot wins!" };
      }

      const rng2 = mulberry32(nextSeed);
      const nextDice = rollDice(rng2);
      const nextSeed2 = Math.floor(rng2() * 2 ** 31);

      return {
        ...state,
        rngSeed: nextSeed2,
        player: newPlayer,
        bot: newBot,
        dice: nextDice,
        pendingDice: [...nextDice],
        turn: "player",
        message: `${msg}. Bot moved. Your dice: ${nextDice[0]}, ${nextDice[1]}`,
      };
    }

    return {
      ...state,
      player: newPlayer,
      pendingDice: newPending,
      message: `${msg}. Apply remaining die: ${newPending.join(", ")}`,
    };
  }

  return state;
}

export function isTerminal(state: PCState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.winner === "player" ? 200 : 0 };
}
