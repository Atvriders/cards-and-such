import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ClassicalMusicQuizSettings { questions: "10" | "20" | "30"; }
export interface ClassicalMusicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ClassicalMusicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who composed the Fifth Symphony with the famous four-note motif?", choices: ["Beethoven","Mozart","Bach","Schubert"], correct: 0 },
  { question: "How many symphonies did Beethoven compose?", choices: ["9","7","12","6"], correct: 0 },
  { question: "Who composed Eine kleine Nachtmusik?", choices: ["Mozart","Haydn","Bach","Beethoven"], correct: 0 },
  { question: "Who is called the Father of the Symphony?", choices: ["Haydn","Mozart","Beethoven","Bach"], correct: 0 },
  { question: "Who composed The Four Seasons?", choices: ["Vivaldi","Bach","Handel","Corelli"], correct: 0 },
  { question: "Who composed the Brandenburg Concertos?", choices: ["J.S. Bach","Vivaldi","Handel","Telemann"], correct: 0 },
  { question: "Who composed the Messiah (oratorio)?", choices: ["Handel","Bach","Haydn","Mozart"], correct: 0 },
  { question: "What's the famous chorus in Messiah?", choices: ["Hallelujah Chorus","Worthy is the Lamb","For Unto Us","All from Messiah"], correct: 0 },
  { question: "Who composed the Moonlight Sonata?", choices: ["Beethoven","Mozart","Schubert","Liszt"], correct: 0 },
  { question: "What is sonata form?", choices: ["Exposition, development, recapitulation","Theme and variations","Rondo","Fugue"], correct: 0 },
  { question: "What era is Bach in?", choices: ["Baroque","Classical","Romantic","Renaissance"], correct: 0 },
  { question: "What era is Mozart in?", choices: ["Classical","Baroque","Romantic","Renaissance"], correct: 0 },
  { question: "What era is Brahms in?", choices: ["Romantic","Classical","Baroque","Modern"], correct: 0 },
  { question: "What era is Debussy in?", choices: ["Impressionist (late Romantic to Modern)","Classical","Baroque","Renaissance"], correct: 0 },
  { question: "Who composed Clair de Lune?", choices: ["Debussy","Ravel","Faure","Satie"], correct: 0 },
  { question: "Who composed Bolero?", choices: ["Ravel","Debussy","Faure","Stravinsky"], correct: 0 },
  { question: "Who composed Symphony No. 9 from the New World?", choices: ["Dvorak","Smetana","Janacek","Bartok"], correct: 0 },
  { question: "Who composed Carmen?", choices: ["Bizet","Gounod","Massenet","Berlioz"], correct: 0 },
  { question: "What's a fugue?", choices: ["Polyphonic composition with imitative entries","Theme and variation","Sonata","Rondo"], correct: 0 },
  { question: "Who is master of fugue?", choices: ["J.S. Bach","Mozart","Beethoven","Brahms"], correct: 0 },
  { question: "What is a concerto?", choices: ["Solo instrument(s) with orchestra","Just orchestra","Solo only","Vocal work"], correct: 0 },
  { question: "Who composed Pictures at an Exhibition?", choices: ["Mussorgsky","Tchaikovsky","Rimsky-Korsakov","Borodin"], correct: 0 },
  { question: "Who orchestrated Pictures at an Exhibition famously?", choices: ["Ravel","Stokowski","Both","Just Ravel"], correct: 2 },
  { question: "Who composed 1812 Overture?", choices: ["Tchaikovsky","Rimsky-Korsakov","Borodin","Glinka"], correct: 0 },
  { question: "What instrument did Liszt play virtuosically?", choices: ["Piano","Violin","Cello","Organ"], correct: 0 },
  { question: "What instrument did Paganini play virtuosically?", choices: ["Violin","Piano","Cello","Flute"], correct: 0 },
  { question: "Who composed Hungarian Rhapsodies?", choices: ["Liszt","Brahms","Bartok","Kodaly"], correct: 0 },
  { question: "Who composed Symphonie Fantastique?", choices: ["Berlioz","Liszt","Wagner","Saint-Saens"], correct: 0 },
  { question: "Who composed The Planets?", choices: ["Holst","Vaughan Williams","Britten","Elgar"], correct: 0 },
  { question: "Who is called the Polish patriot composer?", choices: ["Chopin","Liszt","Paderewski","Penderecki"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ClassicalMusicQuizSettings): ClassicalMusicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ClassicalMusicQuizState, action: ClassicalMusicQuizAction): ClassicalMusicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ClassicalMusicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
