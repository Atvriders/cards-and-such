import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface IdiomQuizSettings {
  questionCount: "5" | "10" | "15";
}

export interface IdiomEntry {
  idiom: string;
  answer: string;
  choices: string[];
}

export interface IdiomQuizState {
  settings: IdiomQuizSettings;
  entries: IdiomEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type IdiomQuizAction =
  | { type: "select"; index: number }
  | { type: "next" };

const BANK: { idiom: string; answer: string }[] = [
  { idiom: "Bite the bullet", answer: "Endure a painful situation" },
  { idiom: "Hit the sack", answer: "Go to sleep" },
  { idiom: "Spill the beans", answer: "Reveal a secret" },
  { idiom: "Break a leg", answer: "Good luck" },
  { idiom: "Under the weather", answer: "Feeling ill" },
  { idiom: "Bite off more than you can chew", answer: "Take on more than you can handle" },
  { idiom: "Hit the nail on the head", answer: "Describe something exactly right" },
  { idiom: "A penny for your thoughts", answer: "Asking someone what they are thinking" },
  { idiom: "Piece of cake", answer: "Something very easy" },
  { idiom: "Let the cat out of the bag", answer: "Accidentally reveal a secret" },
  { idiom: "The ball is in your court", answer: "It is your decision now" },
  { idiom: "Burn the midnight oil", answer: "Work late into the night" },
  { idiom: "Jump on the bandwagon", answer: "Follow a popular trend" },
  { idiom: "Beat around the bush", answer: "Avoid getting to the main point" },
  { idiom: "Speak of the devil", answer: "Said when the person being talked about appears" },
  { idiom: "Once in a blue moon", answer: "Something that happens very rarely" },
  { idiom: "Hit the books", answer: "Study hard" },
  { idiom: "Cost an arm and a leg", answer: "Very expensive" },
  { idiom: "Pull someone's leg", answer: "Joking or teasing someone" },
  { idiom: "Kill two birds with one stone", answer: "Accomplish two things with one action" },
  { idiom: "Kick the bucket", answer: "To die" },
  { idiom: "Barking up the wrong tree", answer: "Making a wrong assumption" },
  { idiom: "Bite the hand that feeds you", answer: "Harm someone who helps you" },
  { idiom: "Cut corners", answer: "Do something poorly to save time or money" },
  { idiom: "Don't judge a book by its cover", answer: "Don't judge by appearance alone" },
  { idiom: "Every cloud has a silver lining", answer: "Every bad situation has a positive aspect" },
  { idiom: "Go back to the drawing board", answer: "Start over from the beginning" },
  { idiom: "Hit the ground running", answer: "Begin something quickly and energetically" },
  { idiom: "In the heat of the moment", answer: "Overwhelmed by emotion in a situation" },
  { idiom: "Let sleeping dogs lie", answer: "Avoid revisiting old problems" },
  { idiom: "Miss the boat", answer: "Miss an opportunity" },
  { idiom: "No pain no gain", answer: "Hard work is necessary for success" },
  { idiom: "On the fence", answer: "Undecided about something" },
  { idiom: "Steal someone's thunder", answer: "Upstage someone else" },
  { idiom: "The best of both worlds", answer: "Enjoying two advantages at the same time" },
];

const DISTRACTORS = [
  "Run away from danger",
  "Wake up early",
  "Make a mess",
  "Tell the truth",
  "Go on vacation",
  "Ask for help",
  "Start a new job",
  "Win a competition",
  "Forget something important",
  "Change your mind",
  "Give up easily",
  "Work as a team",
  "Read a long book",
  "Spend a lot of money",
  "Be very happy",
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: IdiomQuizSettings): IdiomQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const shuffledBank = shuffle(BANK, rng);
  const chosen = shuffledBank.slice(0, count);

  const entries: IdiomEntry[] = chosen.map((item) => {
    const wrongPool = shuffle(
      DISTRACTORS.filter((d) => d !== item.answer),
      rng,
    ).slice(0, 3);
    const choices = shuffle([item.answer, ...wrongPool], rng);
    return { idiom: item.idiom, answer: item.answer, choices };
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

export function reducer(state: IdiomQuizState, action: IdiomQuizAction): IdiomQuizState {
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

export function isTerminal(state: IdiomQuizState): { score: number } | null {
  if (state.done) return { score: state.score };
  return null;
}
