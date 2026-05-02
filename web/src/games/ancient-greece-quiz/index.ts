import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AncientGreeceQuizState, AncientGreeceQuizAction, AncientGreeceQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AncientGreeceQuizGame } from "./Game.js";
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ancientGreeceQuizPlugin: GamePlugin<AncientGreeceQuizState, AncientGreeceQuizAction, typeof settings> = {
  id:"ancient-greece-quiz", title:"Ancient Greece Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of ancient Greek city-states, philosophers, gods, and heroes.",
  howToPlay:`Ancient Greece Quiz puts your knowledge of the classical world to the test. Questions cover the great philosophers — Socrates, Plato, Aristotle — the city-states of Athens and Sparta, the Olympian gods, legendary heroes, epic battles, and foundational concepts like democracy and the polis.

Each round presents one question with four choices. Select the answer you think is correct. Green means right, red means wrong — the correct answer always highlights.

Press Next after each reveal. Each correct answer earns 10 points. Choose 5, 10, or 15 questions in Settings.

Key facts: Homer wrote the Iliad and Odyssey; the Battle of Thermopylae saw 300 Spartans; Aristotle tutored Alexander the Great; the Oracle of Delphi gave prophecies; Plato wrote The Republic. Greek democracy comes from "demos" (people) and "kratos" (rule). Knowing these pillars will carry you to a perfect score!`,
  settings,
  initialState:(seed:number, s:S) => initialState(seed, s as AncientGreeceQuizSettings),
  reducer, isTerminal, 
  hint: (state: AncientGreeceQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AncientGreeceQuizGame,
};
