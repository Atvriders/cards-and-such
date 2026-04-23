import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { RollRightState, RollRightAction, RollRightSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RollRightGame } from "./Game.js";

export const rollRightSettings = {
  dummy: { kind: "boolean" as const, label: "Standard Rules", default: true },
} as const;

export const rollRightPlugin: GamePlugin<RollRightState, RollRightAction, typeof rollRightSettings> = {
  id: "roll-right",
  title: "Roll Right",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 5 dice, keep the high ones, and be first to score 100.",
  howToPlay: `Roll Right is a push-your-luck dice race for two players — you versus a bot. Both players start at zero. The goal is to be the first to accumulate 100 points.

On your turn, click Roll Dice to roll all five dice. You will see the results as die faces. Click on any dice you want to keep — they turn green. Then you can either click Re-roll Unkept to roll the remaining dice again, or click Score to bank your points now.

Your score for the turn is the sum of all kept dice. If you mark none as kept when scoring, all five dice count. There is no limit on how many times you may reroll, but each reroll replaces the unselected dice with fresh random values — so a die left unselected will change.

The bot plays automatically after you score: it rolls all five, keeps any that show 4, 5, or 6, and banks the total. Click Next Turn to advance after seeing the bot's result.

The first player to reach or exceed 100 points wins. Plan when to be aggressive — sometimes it pays to bank modest scores rather than chase big numbers and waste a turn.`,
  settings: rollRightSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: RollRightGame,
};
