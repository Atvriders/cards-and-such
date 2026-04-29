import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BostonWhistSettings { questions: "10"; }
export interface BostonWhistState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BostonWhistAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Boston Whist uses how many players?', choices: ['Four players', 'Two players', 'Three players', 'Five players'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Cards dealt per player is?', choices: ['Thirteen cards', 'Seven cards', 'Ten cards', 'Five cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Boston Whist is an 18th-century variant of?', choices: ['Whist', 'Pinochle', 'Bridge', 'Pinochle'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "A bid called 'Boston' typically requires?", choices: ['Five tricks', 'All thirteen tricks', 'Zero tricks', 'Three tricks'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "'Petite Misère' means?", choices: ['Take zero tricks while passing one card', 'Take all tricks', 'Take five tricks', 'Take six tricks'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Trump is determined by?', choices: ["The dealer's last upturned card", 'Bidding only', 'Player choice freely', 'Random shuffle'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Bid names in Boston Whist are flavored by?', choices: ['French Revolution / 18th-century French names', 'Roman emperors', 'Greek gods', 'American Civil War battles'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Boston Whist is an ancestor of?', choices: ['Modern Bridge', 'Solitaire', 'Backgammon', 'Mancala'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Standard deck used is?', choices: ['Standard 52-card deck', 'Tarot 78-card', '32-card piquet', 'Bridge double deck'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Boston Whist is best classified as?', choices: ['A trick-taking game with bidding contracts', 'A climbing game', 'A solitaire', 'A matching game'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: BostonWhistSettings): BostonWhistState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BostonWhistState, action: BostonWhistAction): BostonWhistState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BostonWhistState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
