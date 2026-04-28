import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ComposersClassicalQuizSettings { questions: "10" | "20" | "30"; }
export interface ComposersClassicalQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ComposersClassicalQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Mozart was born in which city?", choices: ["Vienna","Salzburg","Munich","Prague"], correct: 1 },
  { question: "The Marriage of Figaro was composed by?", choices: ["Haydn","Mozart","Beethoven","Salieri"], correct: 1 },
  { question: "Joseph Haydn is often called the father of?", choices: ["Opera","String quartet","Concerto","Sonata"], correct: 1 },
  { question: "Beethoven's 9th Symphony famously features?", choices: ["Trumpets","Choir","Solo piano","Bagpipes"], correct: 1 },
  { question: "The Magic Flute is by?", choices: ["Beethoven","Salieri","Mozart","Haydn"], correct: 2 },
  { question: "How many symphonies did Haydn compose?", choices: ["~50","~104","~150","~200"], correct: 1 },
  { question: "Mozart's Requiem was completed by?", choices: ["Salieri","Süssmayr","Haydn","Beethoven"], correct: 1 },
  { question: "Mozart's middle name was?", choices: ["Wolfgang","Amadeus","Theophilus","All — he had many"], correct: 3 },
  { question: "Beethoven famously dedicated his 3rd Symphony to?", choices: ["Napoleon (then redacted)","Goethe","Haydn","Schiller"], correct: 0 },
  { question: "The 'Eroica' Symphony is Beethoven's?", choices: ["1st","3rd","5th","9th"], correct: 1 },
  { question: "How old was Mozart when he died?", choices: ["29","35","42","50"], correct: 1 },
  { question: "Christoph Gluck reformed which genre?", choices: ["Symphony","Opera","String quartet","Concerto"], correct: 1 },
  { question: "Haydn was patronized by which family?", choices: ["Habsburg","Esterházy","Hohenzollern","Medici"], correct: 1 },
  { question: "Mozart's 40th symphony is in?", choices: ["G minor","C major","D major","Bb major"], correct: 0 },
  { question: "The Surprise Symphony is by?", choices: ["Haydn","Mozart","Beethoven","Salieri"], correct: 0 },
  { question: "Beethoven's Moonlight Sonata is opus?", choices: ["13","27 No.2","57","106"], correct: 1 },
  { question: "Beethoven was born in?", choices: ["Vienna","Bonn","Salzburg","Berlin"], correct: 1 },
  { question: "The opera Don Giovanni premiered in?", choices: ["Vienna","Prague","Salzburg","Paris"], correct: 1 },
  { question: "A 'Köchel' (K) catalog lists works of?", choices: ["Haydn","Mozart","Beethoven","Schubert"], correct: 1 },
  { question: "Beethoven's hearing loss began around?", choices: ["His twenties","His thirties","His forties","His fifties"], correct: 0 },
  { question: "The 'Jupiter' Symphony is Mozart's?", choices: ["38","39","40","41"], correct: 3 },
  { question: "Beethoven's Fidelio is a?", choices: ["Symphony","Opera","Concerto","Quartet"], correct: 1 },
  { question: "How many piano concertos did Mozart write?", choices: ["12","17","27","41"], correct: 2 },
  { question: "The 'Hammerklavier' is a Beethoven?", choices: ["Symphony","Sonata","Concerto","Opera"], correct: 1 },
  { question: "Mozart's last symphony number is?", choices: ["35","39","41","45"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ComposersClassicalQuizSettings): ComposersClassicalQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ComposersClassicalQuizState, action: ComposersClassicalQuizAction): ComposersClassicalQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ComposersClassicalQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
