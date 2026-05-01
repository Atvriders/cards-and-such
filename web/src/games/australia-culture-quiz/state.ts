import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface AustraliaCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AustraliaCultureQuizSettings { questions: "10" | "20"; }
export interface AustraliaCultureQuizState { questions: AustraliaCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AustraliaCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: AustraliaCultureQuizQuestion[] = [
  { question: "What is the capital of Australia?", choices: ["Sydney","Melbourne","Canberra","Perth"], correct: 2 },
  { question: "The Great Barrier Reef lies off the coast of which Australian state?", choices: ["Western Australia","Queensland","New South Wales","Victoria"], correct: 1 },
  { question: "Uluru, also called Ayers Rock, is located in which territory?", choices: ["Northern Territory","Western Australia","South Australia","Queensland"], correct: 0 },
  { question: "Which marsupial is the largest, and a national symbol of Australia?", choices: ["Wombat","Koala","Red kangaroo","Tasmanian devil"], correct: 2 },
  { question: "The Sydney Opera House was designed by which architect?", choices: ["Frank Lloyd Wright","Jorn Utzon","Harry Seidler","Renzo Piano"], correct: 1 },
  { question: "Australia's indigenous peoples are commonly called?", choices: ["Maori","Aboriginal Australians","Polynesians","Inuit"], correct: 1 },
  { question: "Which sea separates Australia from New Zealand?", choices: ["Coral Sea","Tasman Sea","Arafura Sea","Timor Sea"], correct: 1 },
  { question: "Vegemite is a spread made from yeast extract; what does it taste of?", choices: ["Sweet","Sour","Salty and savory","Spicy"], correct: 2 },
  { question: "Captain James Cook claimed the eastern coast of Australia for Britain in?", choices: ["1770","1788","1801","1820"], correct: 0 },
  { question: "The First Fleet arrived to establish a penal colony at?", choices: ["Botany Bay/Sydney Cove","Hobart","Melbourne","Adelaide"], correct: 0 },
  { question: "Which Australian actor starred as Wolverine in the X-Men films?", choices: ["Russell Crowe","Hugh Jackman","Heath Ledger","Eric Bana"], correct: 1 },
  { question: "Which Australian city hosted the 2000 Summer Olympics?", choices: ["Melbourne","Sydney","Brisbane","Perth"], correct: 1 },
  { question: "The Australian dollar is divided into 100?", choices: ["Pence","Cents","Centavos","Ore"], correct: 1 },
  { question: "Which is Australia's largest city by population?", choices: ["Melbourne","Sydney","Brisbane","Perth"], correct: 1 },
  { question: "Tim Tams are a popular Australian?", choices: ["Cracker","Chocolate biscuit","Candy bar","Cake"], correct: 1 },
  { question: "Australia's national parliament sits in which building?", choices: ["Old Parliament House","Parliament House, Canberra","The Lodge","Government House"], correct: 1 },
  { question: "AFL (Australian Football League) was founded in which city?", choices: ["Sydney","Melbourne","Adelaide","Perth"], correct: 1 },
  { question: "Which famous outlaw is a folk hero, captured wearing homemade armour in 1880?", choices: ["Captain Thunderbolt","Ned Kelly","Ben Hall","Frank Gardiner"], correct: 1 },
  { question: "The Outback refers to Australia's vast remote?", choices: ["Coastline","Interior","Northern rainforest","Mountain ranges"], correct: 1 },
  { question: "Which river is Australia's longest?", choices: ["Darling","Murray","Murrumbidgee","Snowy"], correct: 1 },
  { question: "Which Australian-born singer recorded 'Can't Get You Out of My Head'?", choices: ["Olivia Newton-John","Kylie Minogue","Sia","Delta Goodrem"], correct: 1 },
  { question: "The Great Ocean Road is a scenic drive in which state?", choices: ["New South Wales","Victoria","South Australia","Tasmania"], correct: 1 },
  { question: "Which Australian Prime Minister disappeared while swimming in 1967?", choices: ["Robert Menzies","Harold Holt","John Gorton","Gough Whitlam"], correct: 1 },
  { question: "ANZAC Day commemorates the WWI landing at?", choices: ["Somme","Gallipoli","Verdun","Ypres"], correct: 1 },
  { question: "Which native Australian bird is famous for its laughing call?", choices: ["Emu","Kookaburra","Magpie","Cockatoo"], correct: 1 },
  { question: "The 'Bradman' in Australian sport refers to a legend of which sport?", choices: ["Rugby","Cricket","Tennis","Swimming"], correct: 1 },
  { question: "Australia is home to which large flightless bird, second only to the ostrich?", choices: ["Cassowary","Emu","Kiwi","Rhea"], correct: 1 },
  { question: "Which Australian wine region is famous for shiraz?", choices: ["Margaret River","Barossa Valley","Hunter Valley","Yarra Valley"], correct: 1 },
  { question: "Bondi Beach is located in which city?", choices: ["Melbourne","Sydney","Brisbane","Gold Coast"], correct: 1 },
  { question: "The Tasmanian tiger (thylacine) was officially declared extinct in?", choices: ["1936","1986","1950","2000"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AustraliaCultureQuizSettings): AustraliaCultureQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AustraliaCultureQuizState, action: AustraliaCultureQuizAction): AustraliaCultureQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AustraliaCultureQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
