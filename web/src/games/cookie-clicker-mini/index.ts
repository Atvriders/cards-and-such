import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type CookieClickerState, type CookieClickerAction } from "./state.js";
const CookieClickerMini = /* @__PURE__ */ lazy(() => import("./CookieClickerMini.js").then((mod) => ({ default: mod.CookieClickerMini as unknown as React.ComponentType<unknown> })));
export const cookieClickerSettings = {
  goal: { kind: "enum" as const, label: "Cookie Goal", options: ["100", "500", "2000"] as const, default: "100" as const },
} as const;

export const cookieClickerMiniPlugin: GamePlugin<CookieClickerState, CookieClickerAction, typeof cookieClickerSettings> = {
  id: "cookie-clicker-mini",
  title: "Cookie Clicker Mini",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click the cookie, buy upgrades, bake your way to the goal!",
  howToPlay: `Cookie Clicker Mini is a compact idle-clicker game where your one job is to bake cookies. Click the big cookie button to earn cookies one at a time. Each click earns you cookies equal to your current click power, which starts at 1.

As you accumulate cookies, you can spend them on upgrades. Each upgrade costs three times more than the last, but it boosts your click power by 2 and adds 1 cookie per second of passive income. Passive cookies arrive automatically every second, so you don't need to click forever — build up your upgrades and let the cookies roll in.

Your goal is to reach the target number of cookies set in the game settings (100, 500, or 2000). The faster you reach the goal the higher your score. Balanced play — clicking while buying upgrades strategically — beats pure clicking or pure waiting.

Watch for the occasional lucky double-click! Every so often a click earns you twice the normal amount. The progress bar shows how close you are to the goal. When you hit the goal, the game ends and your score is calculated based on total cookies and efficiency.

Tip: buy your first upgrade as soon as you can afford it. The passive income snowball is the key to victory.`,
  settings: cookieClickerSettings,
  initialState,
  reducer,
  isTerminal,
  hint: () => ({ selector: ".ccm-cookie-btn", pulses: 3 }),
  component: CookieClickerMini,
};
