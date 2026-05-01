import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CocktailsQuizSettings { questionCount: "5" | "10" | "15"; }

export interface QuizEntry { question: string; answer: string; choices: string[]; }

export interface CocktailsQuizState {
  settings: CocktailsQuizSettings;
  entries: QuizEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type CocktailsQuizAction = { type: "select"; index: number } | { type: "next" };

const BANK: { question: string; answer: string }[] = [
  { question: "What are the three main ingredients of a Margarita?", answer: "Tequila, Triple Sec, Lime Juice" },
  { question: "Which cocktail is made with vodka, coffee liqueur, and cream?", answer: "White Russian" },
  { question: "What spirit is the base of a Negroni?", answer: "Gin" },
  { question: "Which classic cocktail contains bourbon, sugar, bitters, and an orange peel?", answer: "Old Fashioned" },
  { question: "What is the main spirit in a Daiquiri?", answer: "White Rum" },
  { question: "Which cocktail blends gin, lime juice, and ginger beer?", answer: "Moscow Mule (with vodka) / Dark and Stormy" },
  { question: "What gives a Cosmopolitan its pink color?", answer: "Cranberry Juice" },
  { question: "Which cocktail is made with champagne and orange juice?", answer: "Mimosa" },
  { question: "What herb is muddled in a Mojito?", answer: "Mint" },
  { question: "Which drink is made with whiskey, sweet vermouth, and Angostura bitters?", answer: "Manhattan" },
  { question: "What is the signature ingredient that makes an Aperol Spritz orange?", answer: "Aperol" },
  { question: "Which cocktail is shaken with egg white for a frothy texture?", answer: "Pisco Sour" },
  { question: "What base spirit is used in a Caipirinha?", answer: "Cachaça" },
  { question: "Which cocktail features vodka, ginger beer, and lime in a copper mug?", answer: "Moscow Mule" },
  { question: "What is the key ingredient that distinguishes a Dirty Martini?", answer: "Olive Brine" },
  { question: "Which sweet vermouth-based cocktail is named after a New York borough?", answer: "Manhattan" },
  { question: "What is blended in a Piña Colada besides rum?", answer: "Coconut Cream and Pineapple Juice" },
  { question: "Which sparkling cocktail is made with Prosecco and peach purée?", answer: "Bellini" },
  { question: "What spirit is the base of a Screwdriver?", answer: "Vodka" },
  { question: "Which tall cocktail combines gin, lemon juice, sugar, and soda water?", answer: "Tom Collins" },
  { question: "Which cocktail combines tequila, orange juice, and grenadine?", answer: "Tequila Sunrise" },
  { question: "What is the base spirit of a Sazerac, the classic New Orleans cocktail?", answer: "Rye Whiskey" },
  { question: "Which gin highball is garnished with lime and tonic water?", answer: "Gin and Tonic" },
  { question: "What is the classic ratio of gin to vermouth in a Dry Martini?", answer: "5 to 1 or drier" },
  { question: "Which Brazilian cocktail uses cachaca, lime, and sugar?", answer: "Caipirinha" },
  { question: "What cocktail layers Guinness stout over Champagne?", answer: "Black Velvet" },
  { question: "Which modern classic blends Scotch, lemon, honey, and ginger?", answer: "Penicillin" },
  { question: "What ice-filled tall drink combines bourbon, mint, and sugar?", answer: "Mint Julep" },
  { question: "Which cocktail mixes vodka, tomato juice, and spices?", answer: "Bloody Mary" },
  { question: "What rum-based long drink is finished with cola and lime?", answer: "Cuba Libre" },
];

const DISTRACTORS = ["Vodka","Rum","Gin","Tequila","Bourbon","Whiskey","Brandy","Champagne","Prosecco","Aperol","Campari","Vermouth","Triple Sec","Kahlúa","Baileys","Amaretto","Bitters","Lime Juice","Simple Syrup","Grenadine"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: CocktailsQuizSettings): CocktailsQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const chosen = shuffle(BANK, rng).slice(0, count);
  const entries: QuizEntry[] = chosen.map(item => {
    const wrong = shuffle(DISTRACTORS.filter(d => d !== item.answer), rng).slice(0, 3);
    return { question: item.question, answer: item.answer, choices: shuffle([item.answer, ...wrong], rng) };
  });
  return { settings, entries, current: 0, selected: null, score: 0, done: false };
}

export function reducer(state: CocktailsQuizState, action: CocktailsQuizAction): CocktailsQuizState {
  if (state.done) return state;
  if (action.type === "select") {
    if (state.selected !== null) return state;
    const correct = state.entries[state.current]!.choices[action.index] === state.entries[state.current]!.answer;
    return { ...state, selected: action.index, score: correct ? state.score + 10 : state.score };
  }
  if (action.type === "next") {
    if (state.selected === null) return state;
    const next = state.current + 1;
    if (next >= state.entries.length) return { ...state, done: true };
    return { ...state, current: next, selected: null };
  }
  return state;
}

export function isTerminal(state: CocktailsQuizState): { score: number } | null {
  return state.done ? { score: state.score } : null;
}
