import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ComposersModernQuizSettings { questions: "10" | "20" | "30"; }
export interface ComposersModernQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ComposersModernQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Debussy is associated with which movement?", choices: ["Impressionism","Serialism","Minimalism","Neoclassicism"], correct: 0 },
  { question: "The Rite of Spring is by?", choices: ["Debussy","Stravinsky","Schoenberg","Bartók"], correct: 1 },
  { question: "Schoenberg pioneered?", choices: ["Twelve-tone technique","Minimalism","Polyrhythms","Microtonality"], correct: 0 },
  { question: "John Cage's '4'33' consists of?", choices: ["Solo piano","Silence","Choir","Percussion"], correct: 1 },
  { question: "Steve Reich is associated with?", choices: ["Minimalism","Atonality","Romanticism","Baroque"], correct: 0 },
  { question: "Philip Glass composed the opera?", choices: ["Einstein on the Beach","Wozzeck","Salome","Lulu"], correct: 0 },
  { question: "Bartók collected folk music from?", choices: ["Italy","Hungary/Eastern Europe","Spain","Russia"], correct: 1 },
  { question: "Ravel's Bolero is famous for?", choices: ["Single rhythm repeated","Atonal harmony","Microtones","Choir"], correct: 0 },
  { question: "Shostakovich was Russian/?", choices: ["Soviet","Polish","Czech","Hungarian"], correct: 0 },
  { question: "Aaron Copland wrote?", choices: ["Appalachian Spring","Pictures at an Exhibition","Bolero","La Mer"], correct: 0 },
  { question: "Pierre Boulez worked in?", choices: ["Total serialism","Neoclassicism","Minimalism","Atonal then chance"], correct: 0 },
  { question: "John Adams's opera 'Nixon in China' was?", choices: ["Tragedy","Minimalist political opera","Comedy","Atonal"], correct: 1 },
  { question: "Arvo Pärt is known for?", choices: ["Tintinnabuli","Serialism","Aleatory","Microtones"], correct: 0 },
  { question: "Olivier Messiaen used birdsong and?", choices: ["Modes of limited transposition","Microtones","12-tone","Random"], correct: 0 },
  { question: "Britten composed Peter Grimes (?)", choices: ["Opera","Symphony","Quartet","Concerto"], correct: 0 },
  { question: "Gershwin wrote Rhapsody in?", choices: ["Red","Blue","Green","White"], correct: 1 },
  { question: "Ives was famous for?", choices: ["Polytonality/quotation","Twelve-tone","Minimalism","Romanticism"], correct: 0 },
  { question: "Webern wrote in?", choices: ["Twelve-tone, very compact","Romantic style","Minimalism","Folk"], correct: 0 },
  { question: "Lutoslawski was from?", choices: ["Poland","Hungary","Russia","Romania"], correct: 0 },
  { question: "Ligeti is known for?", choices: ["Atmospheric textures","12-tone","Folk","Romantic"], correct: 0 },
  { question: "Penderecki's Threnody is for victims of?", choices: ["Hiroshima","Auschwitz","Dresden","Stalingrad"], correct: 0 },
  { question: "John Williams primarily composes for?", choices: ["Concert hall only","Film","Opera","Ballet"], correct: 1 },
  { question: "Tan Dun composed score for?", choices: ["Crouching Tiger, Hidden Dragon","Star Wars","Jaws","E.T."], correct: 0 },
  { question: "Kaija Saariaho is from?", choices: ["Finland","Sweden","Norway","Denmark"], correct: 0 },
  { question: "Schoenberg's pupil included?", choices: ["Berg and Webern","Stravinsky and Bartók","Cage and Reich","Glass and Adams"], correct: 0 },
  { question: "Erik Satie composed?", choices: ["Gymnopédies","Bolero","La Mer","The Planets"], correct: 0 },
  { question: "Holst's suite The Planets has how many movements?", choices: ["5","7","9","11"], correct: 1 },
  { question: "Edgard Varèse pioneered?", choices: ["Electronic music / organized sound","Twelve-tone","Minimalism","Romanticism"], correct: 0 },
  { question: "Karlheinz Stockhausen worked at the WDR studio in?", choices: ["Cologne","Berlin","Munich","Hamburg"], correct: 0 },
  { question: "Hans Zimmer is best known for composing?", choices: ["Concert symphonies","Film scores","Operas","String quartets"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ComposersModernQuizSettings): ComposersModernQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ComposersModernQuizState, action: ComposersModernQuizAction): ComposersModernQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ComposersModernQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
