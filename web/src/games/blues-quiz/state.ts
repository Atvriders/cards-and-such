import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BluesQuizSettings { questions: "10" | "20" | "30"; }
export interface BluesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BluesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Where did the blues originate?", choices: ["African American communities of the Deep South","Chicago","Detroit","NY"], correct: 0 },
  { question: "What region is the Mississippi Delta known for?", choices: ["Delta blues","Country","Jazz","Bluegrass"], correct: 0 },
  { question: "Who is Robert Johnson?", choices: ["Mississippi Delta blues legend","Chicago blues","Texas blues","Memphis blues"], correct: 0 },
  { question: "What legend surrounds Robert Johnson?", choices: ["Sold soul to devil at crossroads","Was royalty","Won fortune gambling","Worked steel mills"], correct: 0 },
  { question: "What's a 12-bar blues?", choices: ["Standard blues form","12 measures","Both","12 instruments"], correct: 2 },
  { question: "What scale is associated with blues?", choices: ["Blues scale (pentatonic + blue note)","Major","Minor only","Chromatic"], correct: 0 },
  { question: "Who's the King of Chicago blues?", choices: ["Muddy Waters","B.B. King","Buddy Guy","Howlin Wolf"], correct: 0 },
  { question: "Who's the King of the Blues guitar?", choices: ["B.B. King","Albert King","Freddie King","All three Kings"], correct: 0 },
  { question: "What was B.B. King's guitar called?", choices: ["Lucille","Black Beauty","Stratocaster","Marylou"], correct: 0 },
  { question: "What harmonica player made Sonny Boy Williamson famous?", choices: ["Multiple were named Sonny Boy","Both Sonny Boy I and II famous","Both","Only one"], correct: 2 },
  { question: "What's a slide guitar?", choices: ["Guitar played with slide on string","Bottleneck","Both","Acoustic only"], correct: 2 },
  { question: "What was Howlin Wolf's real name?", choices: ["Chester Burnett","McKinley Morganfield","Sam Hopkins","Riley King"], correct: 0 },
  { question: "What was Muddy Waters' real name?", choices: ["McKinley Morganfield","Chester Burnett","John Lee","B.B. King"], correct: 0 },
  { question: "What city is Memphis blues centered?", choices: ["Memphis Tennessee","Memphis Egypt","Birmingham","Nashville"], correct: 0 },
  { question: "Who founded Sun Studio in Memphis?", choices: ["Sam Phillips","Berry Gordy","Phil Spector","Leonard Chess"], correct: 0 },
  { question: "Who founded Chess Records?", choices: ["Leonard and Phil Chess","Berry Gordy","Sam Phillips","Both Chess brothers"], correct: 0 },
  { question: "What 1960s movement led whites to embrace blues?", choices: ["British Blues Boom","Soul movement","Doo Wop","Big Band"], correct: 0 },
  { question: "Who covered many blues songs in the British Boom?", choices: ["Rolling Stones, Cream, Yardbirds","Beatles","Beach Boys","Kinks"], correct: 0 },
  { question: "What blues subgenre uses electric guitars heavily?", choices: ["Chicago blues","Delta","Country blues","Jug band"], correct: 0 },
  { question: "Who is W.C. Handy?", choices: ["Father of the Blues (composer/publisher)","Singer","Pianist","Promoter"], correct: 0 },
  { question: "What 1912 song is a W.C. Handy classic?", choices: ["The Memphis Blues","St. Louis Blues","Beale Street Blues","All by him"], correct: 0 },
  { question: "What's a juke joint?", choices: ["African American blues bar","Northern club","Studio","Recording booth"], correct: 0 },
  { question: "What female blues singer was the Empress of Blues?", choices: ["Bessie Smith","Ma Rainey","Billie Holiday","Memphis Minnie"], correct: 0 },
  { question: "Who is Ma Rainey?", choices: ["Mother of the Blues (singer)","Blues guitarist","Pianist","Promoter"], correct: 0 },
  { question: "What blues guitarist died in helicopter crash?", choices: ["Stevie Ray Vaughan","Gary Moore","Jeff Beck","B.B. King"], correct: 0 },
  { question: "What's call and response?", choices: ["Vocal/musical answering","Choir","Echo effect","Modulation"], correct: 0 },
  { question: "What instrument is iconic in Chicago blues?", choices: ["Electric guitar and harmonica","Banjo","Tuba","Steel drum"], correct: 0 },
  { question: "What's a turnaround?", choices: ["End-of-form blues figure that returns","Solo","Bridge","Coda"], correct: 0 },
  { question: "What's boogie-woogie?", choices: ["Piano blues style","Drumming","Vocal style","Saxophone style"], correct: 0 },
  { question: "What's a blue note?", choices: ["Lowered scale degree (b3, b5, b7)","Whole tone","Sharp note","Augmented"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BluesQuizSettings): BluesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BluesQuizState, action: BluesQuizAction): BluesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BluesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
