import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type GemClickerState, type GemClickerAction } from "./state.js";
import { GemClicker } from "./GemClicker.js";

export const gemClickerSettings = {
  goal: { kind: "enum" as const, label: "Gem Goal", options: ["250", "1000", "5000"] as const, default: "250" as const },
} as const;

export const gemClickerPlugin: GamePlugin<GemClickerState, GemClickerAction, typeof gemClickerSettings> = {
  id: "gem-clicker",
  title: "Gem Clicker",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click for gems, hire miners, build refineries — fill the vault!",
  howToPlay: `Gem Clicker is a sparkling idle-clicker where your goal is to collect a target number of precious gems — 250, 1,000, or 5,000 — by clicking and building up your mining empire.

Click the gem button to mine manually. Each click earns gems equal to your Click Power multiplied by the number of Refineries you have. You start with one refinery, which amplifies every gem you collect.

Hire Miners to earn passive income. Each miner digs up gems automatically every second, scaled by your refinery count. Miners also increase your Click Power by 1, making each manual click more valuable too.

Build additional Refineries to supercharge your output. Each refinery multiplies all gem production — from clicks and miners alike. Refineries cost 3x more each purchase but deliver exponential returns.

There is a 5% chance of a Jackpot on each manual click, giving you 4 times the normal click yield for that tap. The progress bar shows how close you are to your gem goal.

Strategy tip: hire miners first to establish passive income, then save for a second refinery. The refinery multiplier dramatically accelerates everything you have built. Alternate between miners and refineries for the fastest path to a full gem vault.`,
  settings: gemClickerSettings,
  initialState,
  reducer,
  isTerminal,
  component: GemClicker,
};
