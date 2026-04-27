import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SciFiNovelsQuizSettings { questions: "10" | "20" | "30"; }
export interface SciFiNovelsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SciFiNovelsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who wrote the 'Foundation' series?", choices: ["Asimov","Heinlein","Clarke","Le Guin"], correct: 0 },
  { question: "Who wrote 'I, Robot'?", choices: ["Asimov","Bradbury","Dick","Heinlein"], correct: 0 },
  { question: "Asimov's three laws govern?", choices: ["Time travel","Robotics","Space","Aliens"], correct: 1 },
  { question: "Who wrote 'Stranger in a Strange Land'?", choices: ["Heinlein","Asimov","Clarke","Niven"], correct: 0 },
  { question: "Who wrote 'Starship Troopers'?", choices: ["Heinlein","Asimov","Card","Pohl"], correct: 0 },
  { question: "Who wrote '2001: A Space Odyssey' (novel)?", choices: ["Asimov","Heinlein","Clarke","Bradbury"], correct: 2 },
  { question: "Who wrote 'Childhood's End'?", choices: ["Clarke","Heinlein","Asimov","Sturgeon"], correct: 0 },
  { question: "Who wrote 'Rendezvous with Rama'?", choices: ["Clarke","Asimov","Heinlein","Niven"], correct: 0 },
  { question: "Who wrote 'The Left Hand of Darkness'?", choices: ["Le Guin","Russ","Atwood","Tepper"], correct: 0 },
  { question: "Who wrote 'The Dispossessed'?", choices: ["Le Guin","Tepper","Russ","Wolfe"], correct: 0 },
  { question: "Who wrote 'A Wizard of Earthsea'?", choices: ["Le Guin","McCaffrey","Bradley","Norton"], correct: 0 },
  { question: "Who wrote 'Dune'?", choices: ["Herbert","Asimov","Clarke","Card"], correct: 0 },
  { question: "Paul Atreides is the hero of?", choices: ["Foundation","Dune","Hyperion","Ender's Game"], correct: 1 },
  { question: "The desert planet in Dune is called?", choices: ["Caladan","Arrakis","Giedi Prime","Caladan"], correct: 1 },
  { question: "Who wrote 'Ender's Game'?", choices: ["Card","Niven","Pournelle","Brin"], correct: 0 },
  { question: "Who wrote 'Hyperion' (Cantos)?", choices: ["Simmons","Card","Brin","Reynolds"], correct: 0 },
  { question: "Who wrote 'Neuromancer'?", choices: ["Gibson","Sterling","Stephenson","Stross"], correct: 0 },
  { question: "Who wrote 'Snow Crash'?", choices: ["Gibson","Stephenson","Sterling","Stross"], correct: 1 },
  { question: "Who wrote 'Cryptonomicon'?", choices: ["Stephenson","Gibson","Sterling","Brin"], correct: 0 },
  { question: "Who wrote 'Ringworld'?", choices: ["Niven","Pournelle","Brin","Bear"], correct: 0 },
  { question: "Who wrote 'Fahrenheit 451'?", choices: ["Bradbury","Asimov","Heinlein","Bradbury"], correct: 0 },
  { question: "Who wrote 'The Martian Chronicles'?", choices: ["Bradbury","Heinlein","Wells","Asimov"], correct: 0 },
  { question: "Who wrote 'Do Androids Dream of Electric Sheep?' (basis for Blade Runner)?", choices: ["Dick","Bradbury","Asimov","Niven"], correct: 0 },
  { question: "Who wrote 'The Man in the High Castle'?", choices: ["Dick","Asimov","Heinlein","Bradbury"], correct: 0 },
  { question: "Who wrote 'Solaris'?", choices: ["Lem","Strugatsky","Asimov","Clarke"], correct: 0 },
  { question: "Who wrote 'Roadside Picnic'?", choices: ["Strugatsky brothers","Lem","Bulgakov","Pelevin"], correct: 0 },
  { question: "Who wrote 'A Canticle for Leibowitz'?", choices: ["Miller","Wolfe","Heinlein","Bear"], correct: 0 },
  { question: "Who wrote 'The Book of the New Sun'?", choices: ["Wolfe","Vance","Crowley","Brust"], correct: 0 },
  { question: "Who wrote 'The Forever War'?", choices: ["Haldeman","Heinlein","Niven","Card"], correct: 0 },
  { question: "Who wrote 'The Handmaid's Tale'?", choices: ["Atwood","Le Guin","Russ","Tepper"], correct: 0 },
  { question: "Who wrote 'Oryx and Crake'?", choices: ["Atwood","Le Guin","Mitchell","McEwan"], correct: 0 },
  { question: "Who wrote 'A Scanner Darkly'?", choices: ["Dick","Bradbury","Heinlein","Asimov"], correct: 0 },
  { question: "Who wrote 'Ubik'?", choices: ["Dick","Asimov","Bradbury","Lem"], correct: 0 },
  { question: "Who wrote 'Old Man's War'?", choices: ["Scalzi","Gibson","Stross","Reynolds"], correct: 0 },
  { question: "Who wrote 'The Three-Body Problem'?", choices: ["Liu Cixin","Ken Liu","Tchaikovsky","Reynolds"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SciFiNovelsQuizSettings): SciFiNovelsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SciFiNovelsQuizState, action: SciFiNovelsQuizAction): SciFiNovelsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SciFiNovelsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
