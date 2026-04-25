import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MorseTapState, MorseTapAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MorseTap } from "./MorseTap.js";

export const morseTapSettings = {} as const;

export const morseTapPlugin: GamePlugin<MorseTapState, MorseTapAction, typeof morseTapSettings> = {
  id: "morse-tap",
  title: "Morse Tap",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Watch a Morse code letter flash, then reproduce it with dots and dashes.",
  howToPlay: `Morse Tap teaches you to decode Morse code one letter at a time. Each round you are shown a letter — such as A, S, E, or O — followed by its Morse code representation flashing on screen. Dots flash briefly; dashes flash longer. Study the pattern, then recreate it by clicking the Dot and Dash buttons in the correct order, then press Submit.

Press Start to begin. Watch the flashing sequence carefully. After the sequence finishes, the input controls appear. Click Dot (•) for a short signal and Dash (—) for a long signal. Build up your answer symbol by symbol. You can see your input growing in real time. When you think you have it right, click Submit.

A correct submission scores a point and advances to the next letter. A wrong submission ends the game and your score equals the number of letters you correctly decoded.

Letters featured: A (•—), B (—•••), C (—•—•), E (•), S (•••), O (———), T (—), N (—•). Focus on the rhythm: dots are quick, dashes are held. Over time you will start to hear the patterns as musical rhythms. Experienced Morse operators describe letters as sounds, not symbols — S sounds like "di-di-dit" and O like "dah-dah-dah". Try saying it out loud as it flashes!`,
  settings: morseTapSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: MorseTap,
};
