import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RecordingTechQuizSettings { questions: "10" | "20" | "30"; }
export interface RecordingTechQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RecordingTechQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who invented the phonograph in 1877?", choices: ["Bell","Edison","Tesla","Marconi"], correct: 1 },
  { question: "The first recording medium used was?", choices: ["Wax cylinder","Vinyl","Tape","Floppy"], correct: 0 },
  { question: "Magnetic tape recording was developed in?", choices: ["UK","USA","Germany","Japan"], correct: 2 },
  { question: "The CD was launched in?", choices: ["1972","1982","1992","2002"], correct: 1 },
  { question: "A 33⅓ RPM record is called an?", choices: ["EP","LP","45","78"], correct: 1 },
  { question: "Stereo records were popularized in the?", choices: ["1940s","1950s","1960s","1970s"], correct: 1 },
  { question: "Abbey Road Studios is in?", choices: ["New York","London","Memphis","LA"], correct: 1 },
  { question: "Sun Records is in?", choices: ["Memphis","Nashville","NY","Detroit"], correct: 0 },
  { question: "A 'condenser' is a type of?", choices: ["Mic","Speaker","Pre-amp","Cable"], correct: 0 },
  { question: "A 'dynamic mic' is robust because?", choices: ["No power needed/durable","Phantom-powered","Tubes","Optical"], correct: 0 },
  { question: "The Neumann U47 is a famous?", choices: ["Console","Mic","Tape deck","Compressor"], correct: 1 },
  { question: "The SSL 4000 is a famous?", choices: ["Mixing console","Mic","Tape deck","DAW"], correct: 0 },
  { question: "DAW stands for?", choices: ["Digital Audio Workshop","Digital Audio Workstation","Direct Audio Wave","Dynamic Audio Wire"], correct: 1 },
  { question: "MIDI was standardized in?", choices: ["1973","1983","1993","2003"], correct: 1 },
  { question: "The first sampler-style instrument?", choices: ["Mellotron","Synclavier","Fairlight CMI","Akai S950"], correct: 2 },
  { question: "A 'compressor' reduces?", choices: ["Pitch","Dynamic range","Bit depth","Latency"], correct: 1 },
  { question: "Sample rate of audio CDs is?", choices: ["32 kHz","44.1 kHz","48 kHz","96 kHz"], correct: 1 },
  { question: "DAT stands for?", choices: ["Digital Audio Tape","Direct Audio Take","Dynamic Audio Track","Digital Aural Tape"], correct: 0 },
  { question: "The minidisc was launched by?", choices: ["Philips","Sony","Sharp","Toshiba"], correct: 1 },
  { question: "MP3 was developed at?", choices: ["MIT","Stanford","Fraunhofer","Bell Labs"], correct: 2 },
  { question: "The 16-track tape was popularized in?", choices: ["1940s","1950s","1960s","1970s"], correct: 2 },
  { question: "Multitrack recording pioneer Les Paul invented?", choices: ["Sound-on-sound recording","CD","DAT","MP3"], correct: 0 },
  { question: "A 'plate reverb' uses?", choices: ["Springs","A metal plate","Tape","Digital algorithm"], correct: 1 },
  { question: "Phantom power is typically?", choices: ["12V","24V","48V","96V"], correct: 2 },
  { question: "Pro Tools is a?", choices: ["DAW","Mic","Console","Reverb unit"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RecordingTechQuizSettings): RecordingTechQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RecordingTechQuizState, action: RecordingTechQuizAction): RecordingTechQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RecordingTechQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
