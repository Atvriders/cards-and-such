import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SynthesizersQuizSettings { questions: "10" | "20" | "30"; }
export interface SynthesizersQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SynthesizersQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Theremin was invented in?", choices: ["1900","1920","1940","1960"], correct: 1 },
  { question: "The Moog modular was designed by?", choices: ["Robert Moog","Dave Smith","Don Buchla","Tom Oberheim"], correct: 0 },
  { question: "The Minimoog was released in?", choices: ["1960","1970","1980","1990"], correct: 1 },
  { question: "The Yamaha DX7 used what synthesis?", choices: ["Subtractive","FM","Granular","Wavetable"], correct: 1 },
  { question: "The Roland TB-303 became famous in?", choices: ["Disco","Acid house","Rap","Country"], correct: 1 },
  { question: "The Prophet-5 was made by?", choices: ["Moog","Sequential Circuits","Roland","Korg"], correct: 1 },
  { question: "A VCO is a?", choices: ["Voltage-controlled oscillator","Voltage-controlled organ","Vocal controlled oscillator","Variable cell"], correct: 0 },
  { question: "A VCF is a?", choices: ["Voltage-controlled fader","Voltage-controlled filter","Vinyl control format","Vocal compressor"], correct: 1 },
  { question: "An ADSR envelope has stages?", choices: ["Attack/Decay/Sustain/Release","Attack/Drive/Sustain/Repeat","Amp/Drive/Sub/Reverb","Add/Drop/Sample/Resample"], correct: 0 },
  { question: "FM synthesis was invented at?", choices: ["MIT","Stanford","Fraunhofer","Bell Labs"], correct: 1 },
  { question: "The Roland TR-808 is a?", choices: ["Synth","Drum machine","Mixer","Sequencer"], correct: 1 },
  { question: "Wavetable synthesis was popularized by?", choices: ["Yamaha DX7","PPG Wave","Korg M1","Akai MPC"], correct: 1 },
  { question: "The Korg M1 was released in?", choices: ["1978","1988","1998","2008"], correct: 1 },
  { question: "The Buchla 100 was a competitor to?", choices: ["DX7","Moog modular","TB-303","Wave"], correct: 1 },
  { question: "The Mellotron used?", choices: ["Wavetable","Tape playback","FM","Analog filters"], correct: 1 },
  { question: "A Eurorack module is?", choices: ["Software plug-in","Compact modular synth standard","DAW","Mic preamp"], correct: 1 },
  { question: "The ARP 2600 was a competitor to?", choices: ["TB-303","Minimoog","DX7","Korg MS-20"], correct: 1 },
  { question: "The Prophet-5 was the first?", choices: ["Polyphonic programmable analog synth","Wavetable","FM","Sampler"], correct: 0 },
  { question: "Granular synthesis manipulates?", choices: ["Tiny grains of audio","Long samples","FM operators","Subtractive"], correct: 0 },
  { question: "A monosynth plays?", choices: ["1 note at a time","2 notes","Many notes","No notes"], correct: 0 },
  { question: "The Roland Juno-60 is which type?", choices: ["Analog poly","Digital","Sample-based","FM"], correct: 0 },
  { question: "Software 'soft synths' became popular in?", choices: ["1990s","2000s","2010s","Both"], correct: 1 },
  { question: "A 'patch' is?", choices: ["Cable","Sound preset/program","Module","Filter"], correct: 1 },
  { question: "A 'sequencer' does what?", choices: ["Records knob moves","Plays note pattern","Filters audio","Reduces noise"], correct: 1 },
  { question: "The Korg MS-20 is famous for its?", choices: ["Aggressive filter","Polyphony","Wavetable","Digital sound"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SynthesizersQuizSettings): SynthesizersQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SynthesizersQuizState, action: SynthesizersQuizAction): SynthesizersQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SynthesizersQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
