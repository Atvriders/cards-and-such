import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PastaQuizState, PastaQuizAction, PastaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PastaQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pastaQuizPlugin: GamePlugin<PastaQuizState, PastaQuizAction, typeof settings> = {
  id:"pasta-quiz", title:"Pasta Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Twirl through pasta shapes, regional sauces, and Italian classics in thirty al dente questions.",
  howToPlay:"Pasta Quiz tests your knowledge of Italy's beloved noodles. Questions cover the long shapes (spaghetti, linguine, fettuccine, bucatini), short shapes (penne, rigatoni, fusilli, farfalle), stuffed varieties (ravioli, tortellini, agnolotti), and tiny pastinas. You'll match shapes to regional sauces and learn the geography of Italian cuisine — from Bolognese in Emilia-Romagna to pesto Genovese in Liguria, cacio e pepe in Rome, and the spicy arrabbiata of central Italy.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 points per second remaining. Wrong answers earn nothing.\n\nTap a choice, press Submit, see if you nailed it. Correct answers light up green; wrong choices turn red and show the right answer. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you're a Nonna who makes fresh tagliatelle or a college student boiling boxed elbows, this quiz delivers a full plate of pasta knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PastaQuizSettings),
  reducer,isTerminal,component:PastaQuizGame,
};
