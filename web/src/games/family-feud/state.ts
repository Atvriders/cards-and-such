import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FamilyFeudSettings {
  questions: "10" | "15" | "20";
}

export interface FamilyFeudSlot {
  answer: string;
  points: number;
  revealed: boolean;
}

export interface FamilyFeudQuestion {
  prompt: string;
  slots: FamilyFeudSlot[];
}

export type FamilyFeudPhase = "guessing" | "round_end" | "done";

export interface FamilyFeudState {
  settings: FamilyFeudSettings;
  questions: FamilyFeudQuestion[];
  questionIndex: number;
  strikes: number;
  score: number;
  phase: FamilyFeudPhase;
  inputValue: string;
  lastGuess: string;
  lastGuessResult: "correct" | "wrong" | "duplicate" | null;
  seed: number;
}

export type FamilyFeudAction =
  | { type: "set_input"; value: string }
  | { type: "submit_guess" }
  | { type: "next_question" };

const SLOT_POINTS = [10, 8, 5, 3, 2];

const RAW_QUESTIONS: { prompt: string; answers: string[] }[] = [
  { prompt: "Name something you find in a kitchen.", answers: ["stove", "refrigerator", "sink", "microwave", "toaster"] },
  { prompt: "Name a popular pizza topping.", answers: ["pepperoni", "mushroom", "cheese", "sausage", "onion"] },
  { prompt: "Name something people do at a beach.", answers: ["swim", "sunbathe", "build sandcastles", "surf", "play volleyball"] },
  { prompt: "Name a reason people call in sick to work.", answers: ["cold", "flu", "stomachache", "headache", "doctor appointment"] },
  { prompt: "Name something a dog does when happy.", answers: ["wag tail", "bark", "jump", "lick", "run"] },
  { prompt: "Name a type of pasta.", answers: ["spaghetti", "penne", "fettuccine", "rigatoni", "lasagna"] },
  { prompt: "Name something you do before bed.", answers: ["brush teeth", "read", "shower", "watch TV", "set alarm"] },
  { prompt: "Name a sport played with a ball.", answers: ["soccer", "basketball", "baseball", "tennis", "football"] },
  { prompt: "Name something found in a grocery store.", answers: ["bread", "milk", "fruit", "vegetables", "cereal"] },
  { prompt: "Name a US holiday.", answers: ["christmas", "thanksgiving", "halloween", "independence day", "new years"] },
  { prompt: "Name something you take on a camping trip.", answers: ["tent", "sleeping bag", "flashlight", "food", "matches"] },
  { prompt: "Name a pet people commonly keep.", answers: ["dog", "cat", "fish", "bird", "hamster"] },
  { prompt: "Name something kids do at recess.", answers: ["run", "play tag", "swing", "slide", "play basketball"] },
  { prompt: "Name a type of shoe.", answers: ["sneaker", "boot", "sandal", "loafer", "heel"] },
  { prompt: "Name something you might forget on a trip.", answers: ["toothbrush", "charger", "keys", "passport", "clothes"] },
  { prompt: "Name a famous US city.", answers: ["new york", "los angeles", "chicago", "miami", "las vegas"] },
  { prompt: "Name something people recycle.", answers: ["cans", "paper", "plastic", "glass", "cardboard"] },
  { prompt: "Name a type of musical instrument.", answers: ["guitar", "piano", "drums", "violin", "trumpet"] },
  { prompt: "Name something you put on a sandwich.", answers: ["cheese", "lettuce", "tomato", "mayo", "mustard"] },
  { prompt: "Name a reason people go to the doctor.", answers: ["checkup", "fever", "broken bone", "sore throat", "earache"] },
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function matches(guess: string, answer: string): boolean {
  const g = normalize(guess);
  const a = normalize(answer);
  if (g === a) return true;
  if (a.split(" ").some(word => word === g && word.length >= 4)) return true;
  if (g.includes(a) && a.length >= 4) return true;
  if (a.includes(g) && g.length >= 4) return true;
  return false;
}

export function initialState(seed: number, settings: FamilyFeudSettings): FamilyFeudState {
  const rng = mulberry32(seed);
  const questionCount = parseInt(settings.questions);
  // Shuffle raw questions
  const shuffled = [...RAW_QUESTIONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  const selected = shuffled.slice(0, questionCount);
  const questions: FamilyFeudQuestion[] = selected.map(q => ({
    prompt: q.prompt,
    slots: q.answers.map((a, i) => ({ answer: a, points: SLOT_POINTS[i]!, revealed: false })),
  }));

  return {
    settings,
    questions,
    questionIndex: 0,
    strikes: 0,
    score: 0,
    phase: "guessing",
    inputValue: "",
    lastGuess: "",
    lastGuessResult: null,
    seed,
  };
}

export function reducer(state: FamilyFeudState, action: FamilyFeudAction): FamilyFeudState {
  switch (action.type) {
    case "set_input":
      if (state.phase !== "guessing") return state;
      return { ...state, inputValue: action.value };

    case "submit_guess": {
      if (state.phase !== "guessing") return state;
      const guess = state.inputValue.trim();
      if (!guess) return state;
      const q = state.questions[state.questionIndex]!;

      // Check duplicate
      const isDuplicate = q.slots.some(sl => sl.revealed && matches(guess, sl.answer));
      if (isDuplicate) {
        return { ...state, inputValue: "", lastGuess: guess, lastGuessResult: "duplicate" };
      }

      // Check correct
      const matchIdx = q.slots.findIndex(sl => !sl.revealed && matches(guess, sl.answer));
      if (matchIdx !== -1) {
        const newSlots = q.slots.map((sl, i) => i === matchIdx ? { ...sl, revealed: true } : sl);
        const newQuestions = state.questions.map((qq, qi) =>
          qi === state.questionIndex ? { ...qq, slots: newSlots } : qq
        );
        const earned = q.slots[matchIdx]!.points;
        const allRevealed = newSlots.every(sl => sl.revealed);
        const newScore = state.score + earned;
        if (allRevealed) {
          return {
            ...state,
            questions: newQuestions,
            score: newScore,
            inputValue: "",
            lastGuess: guess,
            lastGuessResult: "correct",
            phase: "round_end",
          };
        }
        return {
          ...state,
          questions: newQuestions,
          score: newScore,
          inputValue: "",
          lastGuess: guess,
          lastGuessResult: "correct",
        };
      }

      // Wrong
      const newStrikes = state.strikes + 1;
      if (newStrikes >= 3) {
        return {
          ...state,
          strikes: newStrikes,
          inputValue: "",
          lastGuess: guess,
          lastGuessResult: "wrong",
          phase: "round_end",
        };
      }
      return {
        ...state,
        strikes: newStrikes,
        inputValue: "",
        lastGuess: guess,
        lastGuessResult: "wrong",
      };
    }

    case "next_question": {
      if (state.phase !== "round_end") return state;
      const nextIdx = state.questionIndex + 1;
      if (nextIdx >= state.questions.length) {
        return { ...state, phase: "done" };
      }
      return {
        ...state,
        questionIndex: nextIdx,
        strikes: 0,
        phase: "guessing",
        inputValue: "",
        lastGuess: "",
        lastGuessResult: null,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FamilyFeudState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
