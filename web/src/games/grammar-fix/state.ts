import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface GrammarFixSettings {
  questionCount: "5" | "10" | "15";
}

export interface GrammarFixEntry {
  sentence: string;
  choices: string[];
  answer: string;
  explanation: string;
}

export interface GrammarFixState {
  settings: GrammarFixSettings;
  entries: GrammarFixEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type GrammarFixAction =
  | { type: "select"; index: number }
  | { type: "next" };

const BANK: { sentence: string; answer: string; wrong: string[]; explanation: string }[] = [
  {
    sentence: "She don't know the answer.",
    answer: "She doesn't know the answer.",
    wrong: ["She didn't knows the answer.", "She not know the answer."],
    explanation: "Third-person singular uses 'doesn't' not 'don't'.",
  },
  {
    sentence: "Me and him went to the store.",
    answer: "He and I went to the store.",
    wrong: ["Him and me went to the store.", "I and him went to the store."],
    explanation: "Subjects take nominative pronouns: 'He' and 'I'.",
  },
  {
    sentence: "There going to the park later.",
    answer: "They're going to the park later.",
    wrong: ["Their going to the park later.", "There are going to the park later."],
    explanation: "'They're' is the contraction for 'they are'.",
  },
  {
    sentence: "I seen him yesterday.",
    answer: "I saw him yesterday.",
    wrong: ["I have see him yesterday.", "I have saw him yesterday."],
    explanation: "'Saw' is the simple past; 'seen' needs a helper verb.",
  },
  {
    sentence: "The team are playing good.",
    answer: "The team is playing well.",
    wrong: ["The team plays goodly.", "The team are playing well."],
    explanation: "'Team' takes singular verb; 'well' is the adverb form.",
  },
  {
    sentence: "Its raining outside today.",
    answer: "It's raining outside today.",
    wrong: ["Its' raining outside today.", "Theres raining outside today."],
    explanation: "'It's' is the contraction for 'it is'.",
  },
  {
    sentence: "He is more taller than his brother.",
    answer: "He is taller than his brother.",
    wrong: ["He is most tallest than his brother.", "He is more tall than his brother."],
    explanation: "Don't double the comparative; 'taller' already means 'more tall'.",
  },
  {
    sentence: "We was very excited about the trip.",
    answer: "We were very excited about the trip.",
    wrong: ["We is very excited about the trip.", "We be very excited about the trip."],
    explanation: "'We' takes 'were', not 'was'.",
  },
  {
    sentence: "She laid down for a nap.",
    answer: "She lay down for a nap.",
    wrong: ["She lied down for a nap.", "She has laid down for a nap."],
    explanation: "Simple past of 'lie' (to recline) is 'lay', not 'laid'.",
  },
  {
    sentence: "Neither the boys nor the girl have finished.",
    answer: "Neither the boys nor the girl has finished.",
    wrong: ["Neither the boys nor the girl are finished.", "Neither the boys nor the girl had finished."],
    explanation: "With 'neither/nor', the verb agrees with the closer subject: 'girl' (singular).",
  },
  {
    sentence: "I would of called you sooner.",
    answer: "I would have called you sooner.",
    wrong: ["I would've have called you sooner.", "I would off called you sooner."],
    explanation: "'Would have' is correct; 'would of' is a spoken-language error.",
  },
  {
    sentence: "Between you and I, this is a secret.",
    answer: "Between you and me, this is a secret.",
    wrong: ["Between you and myself, this is a secret.", "Amongst you and I, this is a secret."],
    explanation: "After a preposition like 'between', use objective 'me', not 'I'.",
  },
  {
    sentence: "The data shows a clear trend.",
    answer: "The data show a clear trend.",
    wrong: ["The datum show a clear trend.", "The datas shows a clear trend."],
    explanation: "'Data' is the plural of 'datum'; it takes a plural verb in formal usage.",
  },
  {
    sentence: "Whom shall I say is calling?",
    answer: "Who shall I say is calling?",
    wrong: ["Who shall I say are calling?", "Whom shall I say are calling?"],
    explanation: "'Who' is the subject of 'is calling', not the object of 'say'.",
  },
  {
    sentence: "Less people attended the event this year.",
    answer: "Fewer people attended the event this year.",
    wrong: ["More less people attended the event this year.", "Little people attended the event this year."],
    explanation: "Use 'fewer' for countable nouns like people; 'less' is for uncountable quantities.",
  },
  {
    sentence: "He laid in bed all morning.",
    answer: "He lay in bed all morning.",
    wrong: ["He lied in bed all morning.", "He lays in bed all morning."],
    explanation: "Simple past of 'lie' (to recline) is 'lay'.",
  },
  {
    sentence: "The book is different than I expected.",
    answer: "The book is different from what I expected.",
    wrong: ["The book is different of what I expected.", "The book is differently than I expected."],
    explanation: "'Different from' is standard; 'different than' is colloquial but less precise.",
  },
  {
    sentence: "Irregardless of the weather, we will go.",
    answer: "Regardless of the weather, we will go.",
    wrong: ["Irrespective regardless of the weather, we will go.", "Disregardless of the weather, we will go."],
    explanation: "'Irregardless' is non-standard; use 'regardless'.",
  },
  {
    sentence: "I could care less about that.",
    answer: "I couldn't care less about that.",
    wrong: ["I can care less about that.", "I could not caring less about that."],
    explanation: "The idiom 'couldn't care less' means you care zero. 'Could care less' implies you still care.",
  },
  {
    sentence: "Who's jacket is this?",
    answer: "Whose jacket is this?",
    wrong: ["Who's' jacket is this?", "Whom's jacket is this?"],
    explanation: "'Whose' is the possessive; 'who's' means 'who is'.",
  },
  {
    sentence: "The reason is because she was late.",
    answer: "The reason is that she was late.",
    wrong: ["The reason is due to because she was late.", "The reason was because she was late."],
    explanation: "'The reason is that' is grammatically correct; 'reason is because' is redundant.",
  },
  {
    sentence: "Everyone brought their own lunch, didn't they?",
    answer: "Everyone brought their own lunch, didn't they?",
    wrong: ["Everyone brought his own lunch, didn't he?", "Everyone brought ones own lunch, didn't they?"],
    explanation: "Using 'they/their' with 'everyone' as a singular inclusive pronoun is now standard.",
  },
  {
    sentence: "She is one of the students who gets the highest marks.",
    answer: "She is one of the students who get the highest marks.",
    wrong: ["She is one of the student who get the highest marks.", "She is one of the students who gotten the highest marks."],
    explanation: "'Who' refers to 'students' (plural), so the verb is 'get'.",
  },
  {
    sentence: "I ain't got no time for that.",
    answer: "I don't have any time for that.",
    wrong: ["I haven't got no time for that.", "I ain't have no time for that."],
    explanation: "Double negatives are non-standard; use 'don't have any'.",
  },
  {
    sentence: "The committee have made their decision.",
    answer: "The committee has made its decision.",
    wrong: ["The committee made their decision.", "The committee has made their decision."],
    explanation: "In American English, collective nouns like 'committee' take singular verbs and pronouns.",
  },
  {
    sentence: "He gave the award to John and myself.",
    answer: "He gave the award to John and me.",
    wrong: ["He gave the award to John and I.", "He gave the award to John and mine."],
    explanation: "'Myself' is reflexive or emphatic; use 'me' as the object of a preposition here.",
  },
  {
    sentence: "I feel badly about what happened.",
    answer: "I feel bad about what happened.",
    wrong: ["I feel baddly about what happened.", "I feel worst about what happened."],
    explanation: "'Feel' is a linking verb; use the adjective 'bad', not the adverb 'badly'.",
  },
  {
    sentence: "There's many reasons to celebrate.",
    answer: "There are many reasons to celebrate.",
    wrong: ["There is many reasons to celebrate.", "Theres many reasons to celebrate."],
    explanation: "'There are' agrees with the plural noun 'reasons'.",
  },
  {
    sentence: "Neither of the two options are acceptable.",
    answer: "Neither of the two options is acceptable.",
    wrong: ["Neither of the two options are being acceptable.", "Neither of the two options are accepted."],
    explanation: "'Neither' is singular and takes a singular verb.",
  },
  {
    sentence: "Please lay down and rest.",
    answer: "Please lie down and rest.",
    wrong: ["Please laid down and rest.", "Please lain down and rest."],
    explanation: "'Lie' means to recline; 'lay' requires an object. Use 'lie down'.",
  },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: GrammarFixSettings): GrammarFixState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const shuffledBank = shuffle(BANK, rng);
  const chosen = shuffledBank.slice(0, count);

  const entries: GrammarFixEntry[] = chosen.map((item) => {
    const wrongPool = shuffle(item.wrong, rng).slice(0, 3);
    const choices = shuffle([item.answer, ...wrongPool], rng);
    return { sentence: item.sentence, choices, answer: item.answer, explanation: item.explanation };
  });

  return {
    settings,
    entries,
    current: 0,
    selected: null,
    score: 0,
    done: false,
  };
}

export function reducer(state: GrammarFixState, action: GrammarFixAction): GrammarFixState {
  if (state.done) return state;
  switch (action.type) {
    case "select": {
      if (state.selected !== null) return state;
      const entry = state.entries[state.current]!;
      const correct = entry.choices[action.index] === entry.answer;
      return {
        ...state,
        selected: action.index,
        score: correct ? state.score + 10 : state.score,
      };
    }
    case "next": {
      if (state.selected === null) return state;
      const nextIdx = state.current + 1;
      if (nextIdx >= state.entries.length) {
        return { ...state, done: true };
      }
      return { ...state, current: nextIdx, selected: null };
    }
    default:
      return state;
  }
}

export function isTerminal(state: GrammarFixState): { score: number } | null {
  if (state.done) return { score: state.score };
  return null;
}
