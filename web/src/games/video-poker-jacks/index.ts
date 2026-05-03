import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VideoPokerJacksState, VideoPokerJacksAction, VideoPokerJacksSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const VideoPokerJacksGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.VideoPokerJacksGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const videoPokerJacksPlugin: GamePlugin<VideoPokerJacksState, VideoPokerJacksAction, typeof settings> = {
  id: "video-poker-jacks", title: "Video Poker (Jacks or Better)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Single-hand draw poker machine, jacks-or-better.",
  howToPlay: "Video Poker (Jacks or Better) is the canonical solitary draw-poker machine. Each round you are dealt five cards and the engine pays based on the resulting hand using the famous '9/6 Jacks or Better' pay-table. Pairs of jacks-or-better are the minimum payout.\n\nIn this single-player drill you play fifteen rounds. Each round the engine evaluates a fresh five-card draw using a poker rank schedule: pair of jacks-or-better pays one point, two pair pays two, three-of-a-kind pays three, straight pays four, flush pays six, full house pays nine, four-of-a-kind pays twenty-five, straight flush pays fifty, royal flush pays two hundred and fifty.\n\nLow pairs (twos through tens) pay nothing.\n\nExpected score across fifteen rounds is thirty to sixty-five. Jacks or Better has a very low base-rate payoff but a long tail of large wins. Most rounds pay zero or one; the occasional flush or full house carries the score. A single straight flush in the fifteen-round set lands you well above the band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as VideoPokerJacksSettings),
  reducer, isTerminal, component: VideoPokerJacksGame,
  hint: (state: VideoPokerJacksState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-video-poker-jacks-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-video-poker-jacks-next"]', pulses: 3 };
    return null;
  },
};
