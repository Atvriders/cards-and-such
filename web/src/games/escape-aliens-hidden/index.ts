import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EscapeAliensHiddenState, EscapeAliensHiddenAction, EscapeAliensHiddenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EscapeAliensHiddenGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const escapeAliensHiddenPlugin: GamePlugin<EscapeAliensHiddenState, EscapeAliensHiddenAction, typeof settings> = {
  id: "escape-aliens-hidden",
  title: "Escape Aliens: Hidden Movement",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hidden movement semi-coop — alien vs human secret navigation.",
  howToPlay: "Escape Aliens: Hidden Movement is a semi-cooperative simulation. You play a human alongside an AI ally trying to reach the escape pod. Each round combined dice are your stealth roll. Aim for 65 over ten rounds to slip past the alien scanner.\n\nPress Play Round to attempt a stealth move. Then press Next Round, or Finish on round 10.\n\nIn the original Escape from the Aliens in Outer Space, players write coordinates on hidden sheets and the alien guesses; this distillation collapses that hidden movement into stealth dice. Your AI ally chooses paths from a different sector. The Hidden Bonus rewards sneaky play — perfect rolls trigger the silent run. Get to the lifeboat. Don't get eaten.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EscapeAliensHiddenSettings),
  reducer, isTerminal, component: EscapeAliensHiddenGame,
};
