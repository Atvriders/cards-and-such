import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SashimiQuizSettings { questions: "10"; }
export interface SashimiQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SashimiQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Sashimi cards depict?", choices: ["Japanese foods (sushi, tempura, etc.)", "Animals", "Cities", "Letters"], correct: 0 },
  { question: "How many sashimi cards must be collected to score a bonus?", choices: ["1", "2", "3", "5"], correct: 2 },
  { question: "Sashimi is typically a ___ game.", choices: ["Trick-taking", "Set-collection / drafting", "Push-your-luck", "Bluffing"], correct: 1 },
  { question: "The drafting mechanism most resembles?", choices: ["Sushi Go!", "Mahjong", "Bridge", "Solitaire"], correct: 0 },
  { question: "A 'pair' of certain cards (like tempura) usually scores?", choices: ["Nothing alone — pair scores", "1 point each", "10 points each", "0 points always"], correct: 0 },
  { question: "The wasabi card?", choices: ["Doubles the next nigiri scored", "Halves the score", "Cancels another card", "Adds 5 bonus"], correct: 0 },
  { question: "The pudding card scores?", choices: ["Each round", "After the final round (most/fewest)", "Only on triples", "Never"], correct: 1 },
  { question: "Sashimi-style drafting is sometimes called?", choices: ["Pick-and-pass", "Pick-and-pass / closed drafting", "Spread", "Trick-take"], correct: 1 },
  { question: "Players see their hand?", choices: ["Always face down", "Only their own hand", "All players' hands", "Just dealer's"], correct: 1 },
  { question: "Sashimi-style games end after typically?", choices: ["1 round", "3 rounds", "10 rounds", "100 rounds"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SashimiQuizSettings): SashimiQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SashimiQuizState, action: SashimiQuizAction): SashimiQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SashimiQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
