import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BigThreeCasSettings { questions: "10"; }
export interface BigThreeCasState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BigThreeCasAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'In Big Three the highest single card is?', choices: ['The Three', 'The Two', 'The Ace', 'The King'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Big Three is part of which family?', choices: ['Big Two / climbing games', 'Klondike Solitaire', 'Trick-taking Whist', 'Bridge'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of players is typically?', choices: ['Four players', 'Two players', 'Six players', 'Solo'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Cards dealt per player is?', choices: ['Thirteen cards', 'Seven cards', 'Five cards', 'Twenty cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Goal of Big Three is to?', choices: ['Be first to discard all cards', 'Take the most tricks', 'Score 100 points', 'Hold the highest pair'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Plays in Big Three include?', choices: ['Singles, pairs, triples, full houses, and straights', 'Only singles', 'Only pairs', 'Only flushes'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The deck used is?', choices: ['Standard 52-card deck', 'Bridge double deck', '32-card piquet', 'Tarot deck'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Compared to standard Big Two, Big Three?', choices: ['Inverts top card from Two to Three', 'Inverts suit ranking only', 'Adds wild jokers', 'Removes pairs'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Origin region of Big Three is?', choices: ['East Asia', 'South America', 'Northern Europe', 'Middle East'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Big Three is best described as?', choices: ['A climbing/shedding game', 'A trick-taking game', 'A bluffing game', 'A solitaire'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: BigThreeCasSettings): BigThreeCasState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BigThreeCasState, action: BigThreeCasAction): BigThreeCasState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BigThreeCasState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
