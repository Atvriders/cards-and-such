import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Mia dice roll ranking:
// Mia (2+1, highest) > Doubles 66 > 55 > 44 > 33 > 22 > 11 > Normal: 65 > 64 > 63 > 62 > 61 > 54 > 53 > 52 > 51 > 43 > 42 > 41 > 32 > 31 (lowest)

export type MiaRoll = [number, number]; // two dice values

/** Canonical form: higher die first, except for Mia which is always [2,1] */
export function canonicalize(a: number, b: number): MiaRoll {
  return [Math.max(a, b), Math.min(a, b)] as MiaRoll;
}

export function rollRank(roll: MiaRoll): number {
  const [hi, lo] = roll;
  // Mia: special case
  if (hi === 2 && lo === 1) return 1000;
  // Doubles
  if (hi === lo) return 100 + hi; // 11=101,22=102,...,66=106
  // Normal: encode as hi*10+lo (65=65, 64=64, ..., 31=31)
  return hi * 10 + lo;
}

export function rollLabel(roll: MiaRoll): string {
  if (roll[0] === 2 && roll[1] === 1) return "Mia!";
  if (roll[0] === roll[1]) return `Double ${roll[0]}s`;
  return `${roll[0]}-${roll[1]}`;
}

export function rollBeats(challenger: MiaRoll, previous: MiaRoll): boolean {
  return rollRank(challenger) > rollRank(previous);
}

export type Phase =
  | "playerRoll"   // player clicks roll (secretly)
  | "playerDeclare" // player declares (truthfully or bluff)
  | "botDecision"  // bot decides to believe or challenge
  | "reveal"       // reveal result, update lives
  | "gameOver";

export interface MiaSettings {
  startingLives: "3" | "5";
}

export interface MiaState {
  settings: MiaSettings;
  rngSeed: number;
  playerLives: number;
  botLives: number;
  round: number;
  phase: Phase;
  playerRoll: MiaRoll | null;
  // The claim made to the bot (may differ from actual roll)
  playerClaim: MiaRoll | null;
  // Bot's actual roll
  botRoll: MiaRoll | null;
  // Message describing what happened
  message: string;
  winner: "player" | "bot" | null;
}

export type MiaAction =
  | { type: "roll" }
  | { type: "declare"; claim: MiaRoll } // player declares claim
  | { type: "botDecide" }; // trigger bot decision

export function initialState(seed: number, settings: MiaSettings): MiaState {
  const lives = settings.startingLives === "5" ? 5 : 3;
  return {
    settings,
    rngSeed: seed,
    playerLives: lives,
    botLives: lives,
    round: 1,
    phase: "playerRoll",
    playerRoll: null,
    playerClaim: null,
    botRoll: null,
    message: "Roll the dice secretly, then declare your result to the bot.",
    winner: null,
  };
}

function rollTwo(seed: number): { roll: MiaRoll; nextSeed: number } {
  const rng = mulberry32(seed);
  const a = Math.floor(rng() * 6) + 1;
  const b = Math.floor(rng() * 6) + 1;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { roll: canonicalize(a, b), nextSeed };
}

function botStrategy(botRoll: MiaRoll, playerClaim: MiaRoll): "believe" | "challenge" {
  // Bot challenges if the claim is higher than what the bot rolled
  // and the claim rank is in the top 30% of all possible ranks
  const claimRank = rollRank(playerClaim);
  const botRollRank = rollRank(botRoll);
  // Challenge if claim is suspiciously high (rank > 54) and beats bot's roll significantly
  if (claimRank >= 1000) return "challenge"; // Mia claim: always challenge unless bot has nothing
  if (claimRank > botRollRank + 20) return "challenge";
  return "believe";
}

export function reducer(state: MiaState, action: MiaAction): MiaState {
  if (state.winner !== null) return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "playerRoll") return state;
      const { roll, nextSeed } = rollTwo(state.rngSeed);
      return {
        ...state,
        rngSeed: nextSeed,
        playerRoll: roll,
        phase: "playerDeclare",
        message: `You rolled ${rollLabel(roll)} (only you can see this). Declare truthfully or bluff!`,
      };
    }

    case "declare": {
      if (state.phase !== "playerDeclare" || !state.playerRoll) return state;
      // Claim must be at least something (no restriction — player can claim anything)
      const claim = action.claim;
      return {
        ...state,
        playerClaim: claim,
        phase: "botDecision",
        message: `You declared ${rollLabel(claim)}. The bot is deciding...`,
      };
    }

    case "botDecide": {
      if (state.phase !== "botDecision" || !state.playerClaim || !state.playerRoll) return state;

      // Bot rolls its own dice
      const { roll: botRoll, nextSeed } = rollTwo(state.rngSeed);
      const decision = botStrategy(botRoll, state.playerClaim);

      let playerLives = state.playerLives;
      let botLives = state.botLives;
      let message = "";

      if (decision === "challenge") {
        // Bot challenges: reveal player's actual roll
        if (rollRank(state.playerRoll) >= rollRank(state.playerClaim)) {
          // Player told the truth (actual ≥ claim) → bot loses a life
          botLives -= 1;
          message = `Bot challenged! You actually rolled ${rollLabel(state.playerRoll)} — truth! Bot loses a life. Bot: ${botLives} lives.`;
        } else {
          // Player lied → player loses a life
          playerLives -= 1;
          message = `Bot challenged! You claimed ${rollLabel(state.playerClaim)} but rolled ${rollLabel(state.playerRoll)} — caught bluffing! You lose a life. You: ${playerLives} lives.`;
        }
      } else {
        // Bot believes the claim, then tries to beat it
        // Bot's roll revealed: compare to player's claim
        if (rollBeats(botRoll, state.playerClaim)) {
          // Bot beats claim → player must beat bot's declared roll next round (simplified: bot wins this exchange)
          // In simplified: bot wins the round → player loses a life
          playerLives -= 1;
          message = `Bot believed you and rolled ${rollLabel(botRoll)}, beating your claim of ${rollLabel(state.playerClaim)}! You lose a life. You: ${playerLives} lives.`;
        } else {
          // Bot can't beat claim → bot loses a life
          botLives -= 1;
          message = `Bot believed you, rolled ${rollLabel(botRoll)}, and couldn't beat ${rollLabel(state.playerClaim)}. Bot loses a life. Bot: ${botLives} lives.`;
        }
      }

      const winner =
        playerLives <= 0 ? "bot"
        : botLives <= 0 ? "player"
        : null;

      return {
        ...state,
        rngSeed: nextSeed,
        botRoll,
        playerLives,
        botLives,
        phase: winner ? "gameOver" : "reveal",
        message,
        winner,
      };
    }

    default:
      return state;
  }
}

export function startNextRound(state: MiaState): MiaState {
  if (state.winner !== null) return state;
  return {
    ...state,
    phase: "playerRoll",
    playerRoll: null,
    playerClaim: null,
    botRoll: null,
    round: state.round + 1,
    message: "Roll the dice secretly, then declare your result to the bot.",
  };
}

export function isTerminal(state: MiaState): { score: number } | null {
  if (!state.winner) return null;
  return { score: state.winner === "player" ? state.botLives === 0 ? 100 : 50 : 0 };
}

// Generate all possible Mia claims for the UI
export const ALL_MIA_CLAIMS: MiaRoll[] = [];
(function buildClaims() {
  for (let hi = 6; hi >= 1; hi--) {
    for (let lo = hi; lo >= 1; lo--) {
      const r: MiaRoll = [hi, lo];
      ALL_MIA_CLAIMS.push(r);
    }
  }
  // Sort by rank descending
  ALL_MIA_CLAIMS.sort((a, b) => rollRank(b) - rollRank(a));
})();
