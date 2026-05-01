import { quizInitial, quizAnswer, quizNext, quizScore, type QuizState, type QuizQuestion } from "../_shared/quiz-engine.js";

export const MafiaQuiz_QUESTIONS: QuizQuestion[] = [
  {
    "q": "Mafia is also commonly called?",
    "choices": [
      "Werewolf",
      "Coup",
      "Avalon",
      "Skull"
    ],
    "answer": 0
  },
  {
    "q": "Mafia members typically know?",
    "choices": [
      "Each other",
      "Nothing",
      "Everyone's role",
      "Random people"
    ],
    "answer": 0
  },
  {
    "q": "The Town wins by?",
    "choices": [
      "Eliminating all mafia",
      "Lying convincingly",
      "Voting all night",
      "Random chance"
    ],
    "answer": 0
  },
  {
    "q": "The Mafia wins by?",
    "choices": [
      "Outnumbering the town",
      "Voting always",
      "Lying to mod",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "The Detective role typically?",
    "choices": [
      "Investigates a player at night",
      "Heals a player",
      "Kills a player",
      "Lies to all"
    ],
    "answer": 0
  },
  {
    "q": "The Doctor role typically?",
    "choices": [
      "Heals/saves a player",
      "Kills a player",
      "Investigates",
      "Lies"
    ],
    "answer": 0
  },
  {
    "q": "Mafia is most often credited to?",
    "choices": [
      "Dimitry Davidoff",
      "Reiner Knizia",
      "Klaus Teuber",
      "Bruno Cathala"
    ],
    "answer": 0
  },
  {
    "q": "Mafia was created in roughly?",
    "choices": [
      "1986",
      "2005",
      "2020",
      "1995"
    ],
    "answer": 0
  },
  {
    "q": "Recommended player count is roughly?",
    "choices": [
      "7+",
      "2",
      "20+",
      "Solo"
    ],
    "answer": 0
  },
  {
    "q": "The two main game phases are?",
    "choices": [
      "Day & Night",
      "Hot & Cold",
      "Spring & Fall",
      "Active & Rest"
    ],
    "answer": 0
  },
  {
    "q": "The Day phase typically ends with?",
    "choices": [
      "A lynch vote",
      "Random selection",
      "A skip",
      "A timer"
    ],
    "answer": 0
  },
  {
    "q": "During Night the Mafia?",
    "choices": [
      "Choose a victim",
      "Sleep silently",
      "Vote publicly",
      "Sing a song"
    ],
    "answer": 0
  },
  {
    "q": "The role that secretly hosts the game is?",
    "choices": [
      "Moderator/Narrator",
      "Detective",
      "Doctor",
      "Mafia"
    ],
    "answer": 0
  },
  {
    "q": "A 'lynching' is decided by?",
    "choices": [
      "Majority vote",
      "Coin flip",
      "The mod",
      "Random"
    ],
    "answer": 0
  },
  {
    "q": "The 'Sheriff' role usually?",
    "choices": [
      "Investigates alignments",
      "Heals players",
      "Kills mafia",
      "Skips turns"
    ],
    "answer": 0
  },
  {
    "q": "'No Lynch' means?",
    "choices": [
      "No one is killed by town that day",
      "Skipping the night",
      "Kicking the mod",
      "Game ends"
    ],
    "answer": 0
  },
  {
    "q": "A 'Vigilante' is typically a?",
    "choices": [
      "Town-aligned killer",
      "Mafia member",
      "Doctor",
      "Detective"
    ],
    "answer": 0
  },
  {
    "q": "A 'Jester' typically wins by?",
    "choices": [
      "Getting lynched",
      "Surviving",
      "Voting",
      "Investigating"
    ],
    "answer": 0
  },
  {
    "q": "A 'Serial Killer' usually wins by?",
    "choices": [
      "Being last alive",
      "Joining mafia",
      "Voting",
      "Investigating"
    ],
    "answer": 0
  },
  {
    "q": "Werewolf (the variant) replaces mafia with?",
    "choices": [
      "Werewolves",
      "Vampires",
      "Aliens",
      "Zombies"
    ],
    "answer": 0
  },
  {
    "q": "Mafia originated in which country?",
    "choices": [
      "Soviet Union",
      "USA",
      "Italy",
      "UK"
    ],
    "answer": 0
  },
  {
    "q": "Davidoff designed it as a teaching exercise on?",
    "choices": [
      "Group psychology / deception",
      "Card play",
      "Math",
      "History"
    ],
    "answer": 0
  },
  {
    "q": "'Town' players are also called?",
    "choices": [
      "Villagers",
      "Bosses",
      "Wolves",
      "Goons"
    ],
    "answer": 0
  },
  {
    "q": "A 'flip' commonly refers to?",
    "choices": [
      "Revealing a dead player's role",
      "Coin toss",
      "Player switch",
      "Map rotation"
    ],
    "answer": 0
  },
  {
    "q": "'Hammer' is the?",
    "choices": [
      "Final vote that ends the day",
      "First vote",
      "Mod's gavel",
      "Mafia leader"
    ],
    "answer": 0
  },
  {
    "q": "A 'no day-one kill' rule helps prevent?",
    "choices": [
      "Random first-day lynches",
      "Cheating",
      "Time pressure",
      "Long games"
    ],
    "answer": 0
  },
  {
    "q": "A 'Bus Driver' role typically?",
    "choices": [
      "Swaps two players' night actions",
      "Drives players home",
      "Heals",
      "Investigates"
    ],
    "answer": 0
  },
  {
    "q": "A 'Roleblocker' typically?",
    "choices": [
      "Stops a player's night action",
      "Heals",
      "Investigates",
      "Kills"
    ],
    "answer": 0
  },
  {
    "q": "In modern online mafia, communication is mostly?",
    "choices": [
      "Forum/chat threads",
      "In person",
      "Phone",
      "Mail"
    ],
    "answer": 0
  },
  {
    "q": "MyLo and LyLo describe?",
    "choices": [
      "Tense endgame vote scenarios",
      "Easy wins",
      "Bad games",
      "Restarts"
    ],
    "answer": 0
  }
];

const CFG = { totalQuestions: Math.min(10, MafiaQuiz_QUESTIONS.length), pool: MafiaQuiz_QUESTIONS };

export interface MafiaQuizSettings { dummy: boolean; }
export type MafiaQuizState = QuizState;
export type MafiaQuizAction = { type: "answer"; choice: number; elapsedMs: number } | { type: "next" };

export function initialState(seed: number, _s: MafiaQuizSettings): MafiaQuizState {
  return quizInitial(seed, CFG);
}

export function reducer(state: MafiaQuizState, action: MafiaQuizAction): MafiaQuizState {
  if (action.type === "answer") return quizAnswer(state, action.choice, action.elapsedMs);
  if (action.type === "next") return quizNext(state, CFG);
  return state;
}

export function isTerminal(state: MafiaQuizState): { score: number } | null {
  return quizScore(state);
}

export const TOTAL_QUESTIONS = CFG.totalQuestions;
