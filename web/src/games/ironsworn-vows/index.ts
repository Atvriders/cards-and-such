import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { IronswornVowsState, IronswornVowsAction, IronswornVowsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IronswornVowsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ironswornVowsPlugin: GamePlugin<IronswornVowsState, IronswornVowsAction, typeof settings> = {
  id: "ironsworn-vows",
  title: "Ironsworn Vows",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo TTRPG-lite homage to Ironsworn — swear iron vows and walk the path.",
  howToPlay: "Ironsworn Vows is a compact solo journaling-style game inspired by Shawn Tomkin's free OSR-meets-PBTA classic Ironsworn. Across ten narrative entries, you face decision prompts that echo the iron vows, perilous wilderness, and bonds-of-honour storytelling Ironsworn made famous.\n\nEach prompt presents four choices labelled A through D. Pick one and the path resolves: a base reward plus 0-20 of variance from the seeded oracle (mulberry32) is added to your score. Bolder paths reward more on average, but cautious paths fall less often. There is no failure state — every entry leaves a mark in your log.\n\nThe full Ironsworn system features characters, momentum, oracle tables, and named locations. This compact homage strips it to choices and consequences, preserving the slow-burn solitude that fans love.\n\nWhether you imagine swearing vengeance, hunting a darkspawn, or protecting a settlement, the rolls together with your choices shape your saga. The Ironlands wait. Sworn.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as IronswornVowsSettings),
  reducer, isTerminal, hint: (state: IronswornVowsState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-ironsworn-vows-primary"]', pulses: 3 } : null), component: IronswornVowsGame,
};
