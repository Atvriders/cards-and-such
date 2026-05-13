import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MonopolyFullState, MonopolyFullAction, MonopolyFullSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const MonopolyFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({ default: mod.MonopolyFullGame as unknown as React.ComponentType<unknown> })),
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "placeholder", default: false },
} as const;

type S = SettingsOf<typeof settings>;

export const monopolyFullPlugin: GamePlugin<MonopolyFullState, MonopolyFullAction, typeof settings> = {
  id: "monopoly-full",
  title: "Monopoly (Full Rulebook)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "The complete 40-square Hasbro Monopoly experience vs CPU: auctions, mortgages, houses & hotels, and color-set monopoly rents.",
  howToPlay: `Monopoly (Full Rulebook) implements the standard 1935 Hasbro 40-square board against a single CPU opponent. Everyone starts on GO with $1,500.

The board:
• 22 properties grouped into 8 color sets (brown, light blue, pink, orange, red, yellow, green, blue)
• 4 railroads (rent doubles each one you own: 25 / 50 / 100 / 200)
• 2 utilities (rent is 4× / 10× dice roll if you own one / both)
• GO (collect $200 each pass), Just Visiting Jail, Free Parking, Go To Jail
• 3 Chance and 3 Community Chest squares with shuffled decks (incl. Get-Out-Of-Jail-Free cards that stay with the holder)
• Income Tax ($200) and Luxury Tax ($100)

On your turn:
1. Roll 2d6 and advance the sum.
2. Pass GO → +$200. Land on Go-To-Jail → straight to jail. Three consecutive doubles → jail.
3. Land on an unowned property → Buy at face price, OR auction it. If you decline, the CPU enters a sealed bid; whoever bids highest gets the deed.
4. Land on an opponent's property → pay rent. Rent doubles on monopolies (bare lots), and rises sharply with houses (1→4) and a hotel (after 4 houses).
5. Land on Chance / Community Chest → draw a card. Most cards pay or charge cash, some move you, some send you to jail.
6. Doubles → roll again. After resolving each roll, you may use the Manage panel to build houses on color monopolies, sell houses back at half cost, or mortgage/unmortgage properties.

Mortgages: any unimproved property can be mortgaged for half its face price. To lift a mortgage you pay 55% of the face price (10% interest). You can't mortgage a property while any property in that color group still has houses.

Jail: when jailed, you can pay $50 bail, use a Get-Out-Of-Jail-Free card, or try to roll doubles. Three failed roll attempts force you to pay bail.

The game ends when you or the CPU goes bankrupt (negative net worth even after auto-selling all houses and mortgaging all property). Score = your net worth − CPU net worth + 1500, plus a 1000 win bonus.

Advanced rules omitted: player-to-player trading, side-deals, house/hotel shortages, and the modal "raise funds" interface (the engine auto-liquidates houses and mortgages for you if you can't pay). For trading you'd need the multiplayer trade UI tier; this scaffold targets single-player-vs-CPU.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MonopolyFullSettings),
  reducer,
  isTerminal,
  hint: (s) => {
    if (isTerminal(s) !== null) return null;
    const phase = s.phase;
    if (phase === "rolling")     return { selector: '[data-testid="monopolyfull-roll"]', pulses: 3 };
    if (phase === "jail-choice") return { selector: '[data-testid="monopolyfull-jail-roll"]', pulses: 3 };
    if (phase === "deciding")    return { selector: '[data-testid="monopolyfull-buy"]', pulses: 3 };
    if (phase === "auction")     return { selector: '[data-testid="monopolyfull-bid"]', pulses: 3 };
    if (phase === "manage")      return { selector: '[data-testid="monopolyfull-endturn"]', pulses: 3 };
    if (phase === "ai")          return { selector: '[data-testid="monopolyfull-aiturn"]', pulses: 3 };
    return null;
  },
  component: MonopolyFullGame,
};
