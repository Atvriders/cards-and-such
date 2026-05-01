import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CurryQuizSettings { questions: "10" | "20"; }
export interface CurryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CurryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What region is curry originally from?", choices: ["South Asia","Just India","Both","Indian subcontinent"], correct: 2 },
  { question: "What does 'curry' come from?", choices: ["Tamil 'kari' meaning sauce","Just word","Both","Indian word"], correct: 2 },
  { question: "What's tikka masala?", choices: ["Marinated grilled meat in tomato cream sauce","Just sauce","Both","Just dish"], correct: 2 },
  { question: "What's the origin of chicken tikka masala (debated)?", choices: ["UK (often credited)","India","Both claim it","Pakistan"], correct: 2 },
  { question: "What's vindaloo?", choices: ["Spicy Goan curry with vinegar","Just spicy","Both","Just hot"], correct: 2 },
  { question: "What's the origin influence of vindaloo?", choices: ["Portuguese (vinha d'alho)","Just Indian","Both","Just Portuguese"], correct: 2 },
  { question: "What's korma?", choices: ["Mild creamy curry","Just creamy","Both","Just mild"], correct: 2 },
  { question: "What's saag?", choices: ["Spinach-based dish","Just spinach","Both","Greens"], correct: 2 },
  { question: "What's dal?", choices: ["Lentil dish","Just lentils","Both","Just dal"], correct: 2 },
  { question: "What's biryani?", choices: ["Spiced rice dish with meat","Just rice","Both","Just biryani"], correct: 2 },
  { question: "What's naan?", choices: ["Indian flatbread (leavened)","Just bread","Both","Just naan"], correct: 2 },
  { question: "What's roti?", choices: ["Indian unleavened flatbread","Just bread","Both","Just roti"], correct: 2 },
  { question: "What's a tandoor?", choices: ["Clay oven","Just oven","Both","Just clay"], correct: 2 },
  { question: "What's tandoori chicken?", choices: ["Marinated chicken cooked in tandoor","Just chicken","Both","Just tandoori"], correct: 2 },
  { question: "What's garam masala?", choices: ["Indian spice blend","Just spices","Both","Just blend"], correct: 2 },
  { question: "What spices are in garam masala?", choices: ["Cardamom, cinnamon, cloves, etc.","Just spices","Multiple","All listed"], correct: 2 },
  { question: "What's turmeric?", choices: ["Yellow root spice","Just turmeric","Both","Just root"], correct: 2 },
  { question: "What's cardamom?", choices: ["Aromatic pod spice","Just pod","Both","Just spice"], correct: 2 },
  { question: "What's Thai green curry?", choices: ["Thai curry with green chiles, basil","Just Thai","Both","Just green"], correct: 2 },
  { question: "What's Thai red curry?", choices: ["Thai curry with red chiles","Just red","Both","Just Thai"], correct: 2 },
  { question: "What's massaman curry?", choices: ["Thai curry with Indian/Persian influences","Just Thai","Both","Just massaman"], correct: 2 },
  { question: "What's Japanese curry?", choices: ["Mild thick brown curry","Just curry","Both","Just Japanese"], correct: 2 },
  { question: "What's a Japanese curry roux?", choices: ["Solid block to make curry","Just block","Both","Just roux"], correct: 2 },
  { question: "What's Malaysian curry typically?", choices: ["Coconut-based with herbs/spices","Just curry","Both","Just Malaysian"], correct: 2 },
  { question: "What's a Caribbean curry?", choices: ["Goat curry, often Jamaican","Just curry","Both","Just Caribbean"], correct: 2 },
  { question: "What's Sri Lankan curry distinctive?", choices: ["Roasted curry powder, coconut","Just curry","Both","Just Sri Lankan"], correct: 2 },
  { question: "What's a curry leaf?", choices: ["Aromatic leaf used in South Indian cooking","Just leaf","Both","Just curry leaf"], correct: 2 },
  { question: "What's chana masala?", choices: ["Spiced chickpea curry","Just chickpea","Both","Just dish"], correct: 2 },
  { question: "What's palak paneer?", choices: ["Spinach with cheese curry","Just spinach","Both","Just dish"], correct: 2 },
  { question: "What's paneer?", choices: ["Indian fresh cheese","Just cheese","Both","Just paneer"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CurryQuizSettings): CurryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CurryQuizState, action: CurryQuizAction): CurryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CurryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
