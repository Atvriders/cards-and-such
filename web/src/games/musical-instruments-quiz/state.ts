import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MusicalInstrumentsQuizSettings { questions: "10" | "20" | "30"; }
export interface MusicalInstrumentsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MusicalInstrumentsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The piccolo is a small version of which instrument?", choices: ["Clarinet","Flute","Oboe","Trumpet"], correct: 1 },
  { question: "A bassoon is part of which family?", choices: ["Brass","Woodwind","String","Percussion"], correct: 1 },
  { question: "How many strings does a standard violin have?", choices: ["3","4","5","6"], correct: 1 },
  { question: "The timpani are a type of?", choices: ["Drum","Cymbal","Marimba","Triangle"], correct: 0 },
  { question: "Which instrument has a slide?", choices: ["Trumpet","French horn","Trombone","Tuba"], correct: 2 },
  { question: "A theremin is played by?", choices: ["Plucking","Bowing","Hand proximity","Blowing"], correct: 2 },
  { question: "The harp typically has how many strings?", choices: ["32","47","64","88"], correct: 1 },
  { question: "A grand piano has how many keys?", choices: ["76","88","96","100"], correct: 1 },
  { question: "The clarinet uses a?", choices: ["Double reed","Single reed","Free reed","No reed"], correct: 1 },
  { question: "The oboe uses a?", choices: ["Single reed","Double reed","Brass mouthpiece","Bow"], correct: 1 },
  { question: "A glockenspiel is a?", choices: ["String instrument","Wind instrument","Mallet percussion","Keyboard"], correct: 2 },
  { question: "Which is the lowest brass instrument?", choices: ["Trumpet","Trombone","French horn","Tuba"], correct: 3 },
  { question: "The didgeridoo originates from?", choices: ["Brazil","Australia","Scotland","Hawaii"], correct: 1 },
  { question: "The sitar is associated with?", choices: ["China","India","Russia","Egypt"], correct: 1 },
  { question: "Bagpipes are most associated with?", choices: ["Spain","Scotland","Portugal","Norway"], correct: 1 },
  { question: "A Stradivarius is famous as a?", choices: ["Violin","Piano","Harp","Drum"], correct: 0 },
  { question: "The xylophone uses bars made of?", choices: ["Metal","Wood","Plastic","Stone"], correct: 1 },
  { question: "The marimba differs from xylophone by?", choices: ["Material","Tone (deeper, resonators)","Color","Number of bars"], correct: 1 },
  { question: "How many strings does a guitar typically have?", choices: ["4","5","6","7"], correct: 2 },
  { question: "The double bass is played?", choices: ["Sitting only","Standing or seated, vertically","Lying down","Held against chest"], correct: 1 },
  { question: "A French horn is what kind of instrument?", choices: ["Wood","Brass","String","Reed"], correct: 1 },
  { question: "The cello sits between which range?", choices: ["Violin and viola","Viola and double bass","Double bass and harp","Harp and piano"], correct: 1 },
  { question: "Which is NOT a woodwind?", choices: ["Saxophone","Flute","French horn","Bassoon"], correct: 2 },
  { question: "A vibraphone uses?", choices: ["Strings","Bars with motorized vibrato","Reeds","Pipes"], correct: 1 },
  { question: "Castanets originate from?", choices: ["France","Spain","Italy","Greece"], correct: 1 },
  { question: "The contrabassoon plays an octave below the?", choices: ["Oboe","Bassoon","Clarinet","Flute"], correct: 1 },
  { question: "The Hammond B-3 is a type of?", choices: ["Organ","Piano","Synth","Harpsichord"], correct: 0 },
  { question: "The English horn is pitched in?", choices: ["F","Bb","Eb","C"], correct: 0 },
  { question: "The cajon is a percussion instrument from?", choices: ["Brazil","Peru","Mexico","Cuba"], correct: 1 },
  { question: "The Hardanger fiddle is from?", choices: ["Sweden","Finland","Norway","Iceland"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MusicalInstrumentsQuizSettings): MusicalInstrumentsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MusicalInstrumentsQuizState, action: MusicalInstrumentsQuizAction): MusicalInstrumentsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MusicalInstrumentsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
