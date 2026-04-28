import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KeysAndModesQuizSettings { questions: "10" | "20" | "30"; }
export interface KeysAndModesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KeysAndModesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "G major has how many sharps?", choices: ["0","1","2","3"], correct: 1 },
  { question: "F major has how many flats?", choices: ["0","1","2","3"], correct: 1 },
  { question: "The relative minor of G major is?", choices: ["E minor","A minor","D minor","B minor"], correct: 0 },
  { question: "The Dorian mode begins on which scale degree of major?", choices: ["1","2","3","6"], correct: 1 },
  { question: "The Mixolydian mode begins on which scale degree of major?", choices: ["3","4","5","6"], correct: 2 },
  { question: "E natural minor has how many sharps?", choices: ["0","1","2","3"], correct: 1 },
  { question: "B♭ major has how many flats?", choices: ["1","2","3","4"], correct: 1 },
  { question: "The parallel minor of A major is?", choices: ["A minor","E minor","F# minor","D minor"], correct: 0 },
  { question: "Lydian mode is built on which degree?", choices: ["3","4","5","6"], correct: 1 },
  { question: "Phrygian mode characteristically lowers which note?", choices: ["1","2","6","7"], correct: 1 },
  { question: "Locrian mode is built on which degree?", choices: ["6","7","2","1"], correct: 1 },
  { question: "A major has how many sharps?", choices: ["2","3","4","5"], correct: 1 },
  { question: "E♭ major has how many flats?", choices: ["1","2","3","4"], correct: 2 },
  { question: "The relative minor of D major is?", choices: ["B minor","E minor","A minor","F# minor"], correct: 0 },
  { question: "Aeolian mode is the same as?", choices: ["Major scale","Natural minor","Harmonic minor","Melodic minor"], correct: 1 },
  { question: "Ionian mode is the same as?", choices: ["Major scale","Natural minor","Harmonic minor","Phrygian"], correct: 0 },
  { question: "Mixolydian features which lowered note?", choices: ["3","6","7","2"], correct: 2 },
  { question: "Lydian features which raised note?", choices: ["3","4","5","7"], correct: 1 },
  { question: "B major has how many sharps?", choices: ["3","4","5","6"], correct: 2 },
  { question: "A♭ major has how many flats?", choices: ["3","4","5","6"], correct: 1 },
  { question: "The harmonic minor scale raises which note?", choices: ["6","7","3","2"], correct: 1 },
  { question: "Melodic minor (ascending) raises which two notes?", choices: ["3,5","6,7","2,4","1,5"], correct: 1 },
  { question: "The dominant of A minor is?", choices: ["E","D","C","G"], correct: 0 },
  { question: "E major has how many sharps?", choices: ["3","4","5","6"], correct: 1 },
  { question: "The relative major of D minor is?", choices: ["F major","C major","B♭ major","E♭ major"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KeysAndModesQuizSettings): KeysAndModesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KeysAndModesQuizState, action: KeysAndModesQuizAction): KeysAndModesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KeysAndModesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
