import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MusicNotationQuizSettings { questions: "10" | "20" | "30"; }
export interface MusicNotationQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MusicNotationQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The treble clef wraps around which line?", choices: ["E","G","B","D"], correct: 1 },
  { question: "The bass clef's two dots surround which line?", choices: ["F","A","C","D"], correct: 0 },
  { question: "A whole note rest hangs from which line?", choices: ["3rd line","4th line","2nd line","5th line"], correct: 1 },
  { question: "What does a sharp (#) sign do?", choices: ["Lowers note a semitone","Raises note a semitone","Doubles duration","Halves duration"], correct: 1 },
  { question: "A flat (b) sign?", choices: ["Raises a semitone","Lowers a semitone","Cancels accidentals","Marks a rest"], correct: 1 },
  { question: "A natural sign?", choices: ["Cancels prior accidentals","Adds a sharp","Adds a flat","Repeats a note"], correct: 0 },
  { question: "A dot after a note increases duration by?", choices: ["25%","50%","75%","100%"], correct: 1 },
  { question: "A 'fermata' instructs the performer to?", choices: ["Play loudly","Hold the note longer","Repeat","Skip"], correct: 1 },
  { question: "A 'slur' connects?", choices: ["Same pitches","Different pitches smoothly","Repeated bars","Breath marks"], correct: 1 },
  { question: "A 'tie' connects?", choices: ["Same pitches across notes","Different pitches","Phrases","Sections"], correct: 0 },
  { question: "A whole rest equals how many beats in 4/4?", choices: ["1","2","3","4"], correct: 3 },
  { question: "A quarter rest equals?", choices: ["1 beat","2 beats","Half beat","4 beats"], correct: 0 },
  { question: "The double bar at the end of a piece is called?", choices: ["Final bar","Repeat bar","Section bar","Break bar"], correct: 0 },
  { question: "A 'crescendo' means?", choices: ["Get softer","Get louder","Stop","Speed up"], correct: 1 },
  { question: "The symbol > over a note means?", choices: ["Crescendo","Accent","Repeat","Trill"], correct: 1 },
  { question: "A 'tr' marking indicates?", choices: ["Tremolo","Trill","Triplet","Triad"], correct: 1 },
  { question: "The C clef on the middle line is called?", choices: ["Soprano clef","Alto clef","Tenor clef","Baritone clef"], correct: 1 },
  { question: "Three notes in the time of two are a?", choices: ["Couplet","Triplet","Tuplet","Duplet"], correct: 1 },
  { question: "8va above a note means?", choices: ["Octave higher","Octave lower","Half step","Whole step"], correct: 0 },
  { question: "A coda symbol indicates?", choices: ["Beginning section","Bridge section","Ending section","Repeat"], correct: 2 },
  { question: "D.S. al Fine instructs?", choices: ["Repeat from sign to fine","End immediately","Slow down","Get louder"], correct: 0 },
  { question: "What is the Italian word for 'slow'?", choices: ["Allegro","Andante","Largo","Vivace"], correct: 2 },
  { question: "A 'mezzo forte' (mf) is?", choices: ["Very loud","Moderately loud","Very soft","Moderately soft"], correct: 1 },
  { question: "Number of lines on a standard staff?", choices: ["4","5","6","7"], correct: 1 },
  { question: "The grand staff combines which two clefs?", choices: ["Treble + alto","Treble + bass","Bass + tenor","Alto + tenor"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MusicNotationQuizSettings): MusicNotationQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MusicNotationQuizState, action: MusicNotationQuizAction): MusicNotationQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MusicNotationQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
