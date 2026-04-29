import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HangmanCatSettings { questions: "10"; }
export interface HangmanCatState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HangmanCatAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Hangman (Category) adds?', choices: ['A category clue announced before guessing', 'More wrong-guess slots', 'A timer only', 'A trump suit'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Category clues might include?', choices: ["'Animal', 'Movie', 'Food'", "Suit names like 'Hearts'", 'Color names only', 'Random numbers'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Category Hangman is favored for?', choices: ['Children and accessible play', 'Casino gambling', 'Solo competitive', 'Bridge tournaments'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The wrong-guess limit in Category Hangman is typically?', choices: ['Six (same as classic)', 'Three', 'Twelve', 'One'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Category Hangman keeps which classic mechanic?', choices: ['Drawing a stick figure with each wrong guess', 'Trump bidding', 'Discarding cards', 'Rolling dice'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'TV game shows using Category Hangman style include?', choices: ['Wheel of Fortune (with categories)', "Texas Hold'em poker", 'Solitaire on PBS', 'Backgammon Today'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Category Hangman is suitable for?', choices: ['Schools and family game nights', 'Casino gambling rings', 'Solo tournaments only', 'Heavy-strategy gamers only'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Category Hangman vs. classic Hangman is?', choices: ['Easier due to themed hints', 'Always harder', 'Random difficulty', 'Identical difficulty'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'To win in Category Hangman the guesser must?', choices: ['Complete the word before the full figure is drawn', 'Roll a 7', 'Discard all cards', 'Take all tricks'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Category Hangman is best classified as?', choices: ['A word/letter-guessing game with category clue', 'A solitaire', 'A dice game', 'A trick-taking game'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HangmanCatSettings): HangmanCatState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HangmanCatState, action: HangmanCatAction): HangmanCatState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HangmanCatState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
