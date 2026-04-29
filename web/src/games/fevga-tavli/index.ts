import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const fevgaTavliPlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "fevga-tavli",
  title: "Fevga (Moultezim) Tavli",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Third Tavli variant — all pieces move in the same direction with one entry point.",
  howToPlay: "Fevga, also known as Moultezim, is the third Greek Tavli variant. All checkers from both players move in the same direction around the board. There is only a single entry point and no hitting — instead, blocked points act as barriers your opponent cannot pass through. Win by bearing off all fifteen checkers first.\n\nIn this single-player edition you race against a random CPU on a 24-point linear track. Click Roll to throw two six-sided dice. Then click any of your fifteen checkers and choose to advance it by die one, die two, or the combined sum. Each die may only be used once per turn.\n\nThe display lays out the track horizontally. Cell 24 is the bear-off zone. Reach it with every checker to win.\n\nThe key Fevga skill is making prime walls: stack two or more checkers on adjacent points to block the CPU's runners. The CPU plays random moves, so prudent stacking and steady advancement consistently wins. Score is your pip-count lead at game end. Aim for +25 or better for a strong result.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal,
  component: RaceGame,
};
