import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface InstrumentsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type InstrumentsQuizAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" };
export interface InstrumentsQuizSettings { questions: "10"|"20" }
const ALL_QUESTIONS: QuizQuestion[] = [
  { question:"The violin belongs to which instrument family?", choices:["Woodwind","Brass","Percussion","String"], correct:3 },
  { question:"How many strings does a standard guitar have?", choices:["4","5","6","7"], correct:2 },
  { question:"The didgeridoo is a traditional instrument from which country?", choices:["New Zealand","South Africa","India","Australia"], correct:3 },
  { question:"A grand piano has how many keys?", choices:["72","76","88","96"], correct:2 },
  { question:"Which instrument uses a reed to produce sound?", choices:["Trumpet","Flute","Clarinet","Trombone"], correct:2 },
  { question:"The sitar is a string instrument from which country?", choices:["China","Iran","India","Japan"], correct:2 },
  { question:"Which is the largest orchestral string instrument?", choices:["Cello","Viola","Double bass","Violin"], correct:2 },
  { question:"The xylophone is struck with mallets to produce sound using?", choices:["Metal bars","Wooden bars","Glass bars","Stone bars"], correct:1 },
  { question:"A tuba belongs to which instrument family?", choices:["Woodwind","Percussion","String","Brass"], correct:3 },
  { question:"The accordion produces sound through?", choices:["Plucked strings","Air through reeds","Struck membranes","Blown pipes"], correct:1 },
  { question:"Which instrument has pedals that change pitch via levers?", choices:["Harpsichord","Organ","Harp","Clavichord"], correct:2 },
  { question:"The shakuhachi is a flute from which country?", choices:["Korea","China","Vietnam","Japan"], correct:3 },
  { question:"A snare drum is part of which instrument family?", choices:["String","Woodwind","Brass","Percussion"], correct:3 },
  { question:"Which brass instrument has a slide instead of valves?", choices:["French horn","Trombone","Euphonium","Cornet"], correct:1 },
  { question:"The banjo originated primarily in which region?", choices:["West Africa (via Americas)","Ireland","Scotland","South America"], correct:0 },
  { question:"How many strings does a standard violin have?", choices:["3","4","5","6"], correct:1 },
  { question:"The oboe uses a reed made from how many pieces?", choices:["1","2","3","4"], correct:1 },
  { question:"Which percussion instrument uses tension-tuned skin?", choices:["Xylophone","Glockenspiel","Timpani","Marimba"], correct:2 },
  { question:"The koto is a traditional zither instrument from?", choices:["Korea","China","Japan","Vietnam"], correct:2 },
  { question:"Which instrument is played by drawing a bow across strings?", choices:["Banjo","Lute","Mandolin","Cello"], correct:3 },
  { question: "The harmonica is also known as the?", choices: ["Mouth organ","Pan flute","Reed pipe","Wind chime"], correct: 0 },
  { question: "The pipa is a traditional lute from?", choices: ["Japan","China","Korea","Vietnam"], correct: 1 },
  { question: "Which instrument has a triangular wooden body and three strings (in its Russian form)?", choices: ["Mandolin","Balalaika","Lute","Bouzouki"], correct: 1 },
  { question: "The cor anglais is also known as the?", choices: ["English horn","French horn","Alpine horn","Post horn"], correct: 0 },
  { question: "A celesta produces sound by hammers striking?", choices: ["Strings","Metal plates","Wooden bars","Glass tubes"], correct: 1 },
  { question: "The hurdy-gurdy produces sound by?", choices: ["A rosined wheel turning against strings","Plucking","Air through reeds","Hammered keys"], correct: 0 },
  { question: "A standard concert flute is held?", choices: ["Vertically","Transversely (sideways)","On the lap","Between knees"], correct: 1 },
  { question: "The continuous tone of bagpipes comes from?", choices: ["Drone pipes","The chanter only","The bag alone","An electric oscillator"], correct: 0 },
  { question: "An erhu is a Chinese?", choices: ["Two-stringed bowed instrument","Flute","Drum","Lute"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: ()=>number): T[] { const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: InstrumentsQuizSettings): InstrumentsQuizState {
  const rng=mulberry32(seed);const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const indexed=q.choices.map((c,i)=>({c,i}));const sh=shuffle(indexed,rng);const newCorrect=sh.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:sh.map(x=>x.c) as [string,string,string,string],correct:newCorrect};});
  return { questions, currentIndex:0, selected:null, submitted:false, score:0, correctCount:0, phase:"playing" };
}
export function reducer(state: InstrumentsQuizState, action: InstrumentsQuizAction): InstrumentsQuizState {
  if(state.phase==="done") return state;
  switch(action.type){
    case "select": return state.submitted?state:{...state,selected:action.choice};
    case "submit": {if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;return{...state,submitted:true,score:state.score+(ok?100:0),correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "next": {const next=state.currentIndex+1;if(next>=state.questions.length)return{...state,phase:"done"};return{...state,currentIndex:next,selected:null,submitted:false,phase:"playing"};}
    default: return state;
  }
}
export function isTerminal(state: InstrumentsQuizState): { score:number }|null { return state.phase==="done"?{score:state.score}:null; }
