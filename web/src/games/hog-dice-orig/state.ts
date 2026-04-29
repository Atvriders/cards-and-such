import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HogDiceOrigSettings { questions: "10"; }
export interface HogDiceOrigState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HogDiceOrigAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'In Hog the player commits to?', choices: ['A number of dice to roll all at once', 'A target score', 'A trump suit', 'A round count'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Hog is a member of which family?', choices: ['Push-your-luck dice games', 'Trick-taking', 'Solitaire', 'Casino tables'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Rolling any 1 in your committed dice means?', choices: ['You score zero for that turn', 'You score the maximum', 'You re-roll forever', 'You give the dice up'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'If no 1 appears, you score?', choices: ['The sum of all your committed dice', 'Always 100', 'Always five points', 'Just the highest die'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'First to reach what score wins?', choices: ['100 (typical)', '21', '50', '1000'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Hog's strategy involves?", choices: ['Optimal commit-count by game state', 'Memorizing card melds', 'Bluffing only', 'Pure speed'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Hog is closely related to?', choices: ['Pig (the simpler dice push-your-luck game)', 'Bridge', 'Whist', 'Backgammon'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of dice can range up to?', choices: ['100 (or more in some variants)', 'Always exactly two', 'Always exactly five', 'Always exactly six'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Hog is best described as?', choices: ['A simple but mathematically rich dice game', 'A heavy strategy game', 'A bluffing game', "A children's snap game"], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'In Hog, committing to fewer dice means?', choices: ['Lower upside but lower bust risk', 'Always a free score', 'Always a bust', 'No effect'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HogDiceOrigSettings): HogDiceOrigState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HogDiceOrigState, action: HogDiceOrigAction): HogDiceOrigState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HogDiceOrigState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
