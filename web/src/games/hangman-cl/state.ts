import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HangmanClSettings { questions: "10"; }
export interface HangmanClState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HangmanClAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Hangman is a?', choices: ['Pencil-and-paper word-guessing game', 'Solitaire', 'Trick-taking game', 'Bridge variant'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'First recorded references to Hangman appear in?', choices: ['Late 19th-century England', 'Ancient Egypt', '1950s America', 'Renaissance Italy'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of wrong guesses before losing in classic Hangman is?', choices: ['Six (head, body, two arms, two legs)', 'Three', 'Ten', 'Twelve'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The puzzle-setter chooses?', choices: ['A secret word', 'A trump suit', 'A scorecard', 'A trick'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The guesser tries to?', choices: ['Guess letters and complete the word', 'Score 100 points', 'Capture pieces', 'Roll dice'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Wrong guesses add to?', choices: ["A stick-figure being 'hanged'", 'A score counter', 'A trump suit', 'A discard pile'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Correct letters?', choices: ['Fill in their position(s) in the word', 'Are removed from the alphabet', 'Trigger a re-shuffle', 'Score 10 points'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Goal of the guesser is?', choices: ['Complete the word before the figure is fully drawn', 'Run out the timer', 'Score 21 points', 'Capture all letters'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Hangman has been adapted into?', choices: ['TV game shows like Wheel of Fortune', 'Trick-taking pyramid', 'Mahjong solitaire', 'Backgammon'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Hangman is best classified as?', choices: ['A word/letter-guessing game', 'A solitaire', 'A dice game', 'A trick-taking game'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HangmanClSettings): HangmanClState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HangmanClState, action: HangmanClAction): HangmanClState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HangmanClState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
