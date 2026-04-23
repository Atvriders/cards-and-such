import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PopPigState, PopPigAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PopThePig } from "./Game.js";

export const popPigSettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["1", "2", "3"] as const,
    default: "1" as const,
  },
} as const;

type PopPigSettingsType = SettingsOf<typeof popPigSettings>;

export const popThePigPlugin: GamePlugin<PopPigState, PopPigAction, typeof popPigSettings> = {
  id: "pop-the-pig",
  title: "Pop the Pig",
  category: "dice",
  players: { min: 1, max: 4, multiplayer: false },
  description: "Roll dice to feed the pig. Whoever fills it to bursting loses!",
  howToPlay: `Pop the Pig is a hilarious press-your-luck style game where nobody wants to be the one to overfeed the pig! At the start of each game, the pig has a random hunger level between 10 and 20 burgers. That counter ticks down as players feed it.

On your turn, click "Roll" to roll a four-sided die (showing 1 to 4). That many burgers get fed to the pig and are subtracted from the counter. The pig's belly fills up round by round — and the tension builds!

The player who reduces the burger counter to zero or below is the one who pops the pig — and they lose! Bots roll automatically after your turn, so watch the counter carefully. If it is already very low, your next roll might be the fatal one!

You can play against 1, 2, or 3 bots. The game starts fresh each time with a new random burger count. Score 100 for surviving (a bot pops the pig) or 0 if you are the one who caused the pop. Good luck, and don't overfeed the pig!`,
  settings: popPigSettings,
  initialState: (seed: number, settings: PopPigSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: PopThePig,
};
