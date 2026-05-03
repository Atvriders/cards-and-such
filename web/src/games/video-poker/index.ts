import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VideoPokerState, VideoPokerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VideoPoker } from "./VideoPoker.js";

export const videoPokerSettings = {
  betSize: {
    kind: "enum" as const,
    label: "Bet Size",
    options: ["1", "5"] as const,
    default: "1",
  },
  paytable: {
    kind: "enum" as const,
    label: "Paytable",
    options: ["9/6", "8/5"] as const,
    default: "9/6",
  },
  handsPerSession: {
    kind: "number" as const,
    label: "Hands per Session",
    min: 10,
    max: 200,
    step: 10,
    default: 50,
  },
} as const;

type VideoPokerSettingsType = SettingsOf<typeof videoPokerSettings>;

export const videoPokerPlugin: GamePlugin<VideoPokerState, VideoPokerAction, typeof videoPokerSettings> = {
  id: "video-poker",
  title: "Video Poker",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Jacks-or-Better. Hold cards, draw replacements, win credits on qualifying hands.",
  howToPlay: `Build the best 5-card poker hand. You are dealt 5 cards; choose which to keep, then draw replacements. You win credits on any hand with a pair of Jacks or better.

Controls: Click any card to toggle it between HOLD and discard. Held cards are marked. Click Draw to replace the unmarked cards. Payouts are shown in the paytable panel.

Winning hands (lowest to highest): Jacks or Better (pair of Jacks, Queens, Kings, or Aces), Two Pair, Three of a Kind, Straight, Flush, Full House, Four of a Kind, Straight Flush, Royal Flush.

Settings: Choose bet size (1 or 5 credits), paytable (9/6 full-pay or 8/5), and hands per session. The 9/6 paytable pays 9× for a Full House and 6× for a Flush; 8/5 pays slightly less. Playing max bet (5 credits) upgrades the Royal Flush payout to 800× per credit — always bet max when possible.

Scoring: Your score is your credit balance at the end of the session. Starting credits equals bet size × hands, so play tightly.

Tips: On a dealt pair of Jacks or better, hold it and draw three. Prefer a four-card straight flush draw over a low pair. Never break a made flush or straight unless you have four to a royal.`,
  settings: videoPokerSettings,
  initialState: (seed: number, settings: VideoPokerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: VideoPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-video-poker-primary"]', pulses: 3 };
  },
  component: VideoPoker,
};
