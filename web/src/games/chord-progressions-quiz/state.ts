import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChordProgressionsQuizSettings { questions: "10" | "20" | "30"; }
export interface ChordProgressionsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChordProgressionsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The 'pop punk' progression is?", choices: ["I-V-vi-IV","I-IV-V","ii-V-I","I-vi-IV-V"], correct: 0 },
  { question: "The classic 1950s progression is?", choices: ["I-vi-IV-V","ii-V-I","I-V-vi-IV","I-IV-I-V"], correct: 0 },
  { question: "A 12-bar blues uses primarily which chords?", choices: ["I, IV, V","I, ii, iii","I, V, vi","I, IV, vi"], correct: 0 },
  { question: "The jazz turnaround is?", choices: ["ii-V-I","I-IV-V","I-vi-IV","V-IV-I"], correct: 0 },
  { question: "The Andalusian cadence descends?", choices: ["i-VII-VI-V","I-IV-V-I","ii-V-I","vi-IV-I-V"], correct: 0 },
  { question: "A 'plagal cadence' is?", choices: ["V-I","IV-I","ii-V","vi-V"], correct: 1 },
  { question: "A 'perfect authentic cadence' is?", choices: ["V-I (root pos.)","IV-I","ii-V","vi-IV"], correct: 0 },
  { question: "A 'deceptive cadence' is?", choices: ["V-vi","V-I","IV-I","V-iii"], correct: 0 },
  { question: "A 'half cadence' ends on?", choices: ["I","IV","V","vi"], correct: 2 },
  { question: "The 'Axis' progression (pop) is?", choices: ["I-V-vi-IV","ii-V-I","I-IV-vi-V","vi-IV-I-V"], correct: 0 },
  { question: "A 'I-IV-V' is most common in?", choices: ["Blues/rock","Jazz","Renaissance","Atonal"], correct: 0 },
  { question: "Modal interchange means?", choices: ["Borrowing chords from parallel modes","Changing keys","Adding 7ths","Inverting"], correct: 0 },
  { question: "A 'Picardy third' is?", choices: ["Major chord at end of minor piece","Minor chord at end","Inverted dominant","Doubled root"], correct: 0 },
  { question: "The 'Pachelbel Canon' progression starts?", choices: ["I-V-vi-iii","I-IV-V-I","ii-V-I","I-vi-ii-V"], correct: 0 },
  { question: "A 'circle of fifths' progression goes?", choices: ["Down by fifths","Up by thirds","Stepwise","Random"], correct: 0 },
  { question: "A 'tritone substitution' replaces V with?", choices: ["bII","IV","vi","iii"], correct: 0 },
  { question: "The Doo-Wop progression is?", choices: ["I-vi-IV-V","I-IV-V","ii-V-I","I-V-vi-IV"], correct: 0 },
  { question: "A 'Neapolitan chord' is?", choices: ["bII (major)","V/V","vi (minor)","iii"], correct: 0 },
  { question: "A common jazz blues uses ii-V-I in bars?", choices: ["9-10-11","1-2-3","5-6-7","11-12-1"], correct: 0 },
  { question: "A 'modulation by fifth' moves to?", choices: ["Dominant key","Subdominant key","Relative minor","Tritone"], correct: 0 },
  { question: "The 'rhythm changes' progression is from?", choices: ["Gershwin's I Got Rhythm","Mozart","Bach","Chopin"], correct: 0 },
  { question: "A 'secondary dominant' is?", choices: ["V/V or V of any chord","I-IV","ii-V","Modal"], correct: 0 },
  { question: "The vi chord in C major is?", choices: ["A minor","D minor","E minor","F minor"], correct: 0 },
  { question: "A iio (in minor) is?", choices: ["Diminished","Major","Augmented","Half-diminished"], correct: 0 },
  { question: "A common rock 'I-bVII-IV' uses?", choices: ["Mixolydian flavor","Dorian flavor","Lydian flavor","Phrygian flavor"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ChordProgressionsQuizSettings): ChordProgressionsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChordProgressionsQuizState, action: ChordProgressionsQuizAction): ChordProgressionsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChordProgressionsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
