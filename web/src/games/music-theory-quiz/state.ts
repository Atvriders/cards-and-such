import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MusicTheoryQuizSettings { questions: "10" | "20" | "30"; }
export interface MusicTheoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MusicTheoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many notes are in a major scale?", choices: ["6","7","8","12"], correct: 1 },
  { question: "The interval between C and G is a perfect what?", choices: ["Fourth","Fifth","Octave","Third"], correct: 1 },
  { question: "A major triad consists of which intervals?", choices: ["Major 3rd + minor 3rd","Minor 3rd + major 3rd","Two major 3rds","Two minor 3rds"], correct: 0 },
  { question: "How many sharps does the key of D major have?", choices: ["1","2","3","4"], correct: 1 },
  { question: "The relative minor of C major is?", choices: ["A minor","D minor","E minor","G minor"], correct: 0 },
  { question: "What is the time signature for a waltz?", choices: ["2/4","3/4","4/4","6/8"], correct: 1 },
  { question: "A perfect octave spans how many semitones?", choices: ["10","11","12","13"], correct: 2 },
  { question: "The dominant chord in C major is?", choices: ["F","G","A","D"], correct: 1 },
  { question: "Which scale has the pattern WWHWWWH?", choices: ["Major","Natural minor","Dorian","Pentatonic"], correct: 0 },
  { question: "A 'fortissimo' marking means?", choices: ["Soft","Very loud","Slow","Smooth"], correct: 1 },
  { question: "What does 'pp' mean in dynamics?", choices: ["Pretty pretty","Very soft","Pause","Plucked"], correct: 1 },
  { question: "The note a perfect fifth above F is?", choices: ["B","C","D","Bb"], correct: 1 },
  { question: "In 4/4 time, a half note gets how many beats?", choices: ["1","2","3","4"], correct: 1 },
  { question: "The 'Ionian' mode is the same as?", choices: ["Major scale","Natural minor","Harmonic minor","Pentatonic"], correct: 0 },
  { question: "A diminished triad consists of?", choices: ["Two major 3rds","Two minor 3rds","Major + minor 3rd","Minor + major 3rd"], correct: 1 },
  { question: "How many flats are in F major?", choices: ["0","1","2","3"], correct: 1 },
  { question: "What is the leading tone in C major?", choices: ["A","B","C","G"], correct: 1 },
  { question: "The interval between two notes of the same pitch is called?", choices: ["Unison","Octave","Second","Prime"], correct: 0 },
  { question: "A 'cadence' is?", choices: ["A scale","A chord progression resolving phrase","A rhythmic figure","A dynamic marking"], correct: 1 },
  { question: "The Aeolian mode is the same as?", choices: ["Major","Natural minor","Dorian","Phrygian"], correct: 1 },
  { question: "A 'staccato' note is played?", choices: ["Smoothly","Detached/short","Loudly","Slowly"], correct: 1 },
  { question: "The Circle of Fifths is used to?", choices: ["Tune drums","Show key relationships","Notate rests","Indicate tempo"], correct: 1 },
  { question: "A whole step equals?", choices: ["1 semitone","2 semitones","3 semitones","4 semitones"], correct: 1 },
  { question: "The subdominant of G major is?", choices: ["D","C","A","F"], correct: 1 },
  { question: "What is enharmonic to F#?", choices: ["Gb","G","E#","F"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MusicTheoryQuizSettings): MusicTheoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MusicTheoryQuizState, action: MusicTheoryQuizAction): MusicTheoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MusicTheoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
