import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpeedSnapSettings { questions: "10"; }
export interface SpeedSnapState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpeedSnapAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'In Speed Snap players slap when?', choices: ['The top two cards match by rank', 'The deck is empty', 'A King appears', "Everyone says 'go'"], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The phrase to shout when slapping is?', choices: ["'Snap!'", "'Slam!'", "'Stop!'", "'Match!'"], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Snap is most often classified as?', choices: ["A children's reaction game", 'A solitaire', 'A bidding game', 'A trick-taking game'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'In stricter variants matches require?', choices: ['Same rank and same suit/color', 'Same color only', 'Same suit only', 'Any value'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Players win by?', choices: ['Collecting all cards into their pile', 'Discarding all cards first', 'Scoring 50 points', 'Taking the most tricks'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Speed Snap differs from Snap by?', choices: ['Faster turn order or doubled deck', 'Trump suit', 'Bidding rounds', 'A board'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of players is?', choices: ['Two or more', 'Always one', 'Always six', 'Always four'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Snap is mostly a game of?', choices: ['Reaction and observation', 'Memory only', 'Math', 'Bluffing'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Standard deck used is?', choices: ['52-card deck (or doubled)', '32-card piquet', 'Tarot deck', 'Bridge double deck only'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Slapping wrongly typically causes?', choices: ['A penalty (give cards to opponents)', 'Game ends', 'Trump changes', 'An extra turn'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SpeedSnapSettings): SpeedSnapState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpeedSnapState, action: SpeedSnapAction): SpeedSnapState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpeedSnapState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
