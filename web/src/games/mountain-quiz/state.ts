import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MountainQuizSettings { questions: "10" | "20"; }
export interface MountainQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MountainQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the highest mountain in the world?", choices: ["K2","Kangchenjunga","Mount Everest","Lhotse"], correct: 2 },
  { question: "In which mountain range is K2?", choices: ["Himalayas","Karakoram","Hindu Kush","Pamir"], correct: 1 },
  { question: "What is the highest mountain in Africa?", choices: ["Mount Kenya","Mount Stanley","Kilimanjaro","Ras Dashen"], correct: 2 },
  { question: "What is the highest peak in North America?", choices: ["Mount Whitney","Denali","Mount Logan","Pico de Orizaba"], correct: 1 },
  { question: "What is the highest mountain in Europe?", choices: ["Mont Blanc","Matterhorn","Mount Elbrus","Grossglockner"], correct: 2 },
  { question: "What is the highest peak in South America?", choices: ["Aconcagua","Huascaran","Chimborazo","Ojos del Salado"], correct: 0 },
  { question: "What is the highest mountain in Australia?", choices: ["Mount Bartle Frere","Mount Kosciuszko","Mount Ossa","Mount Bogong"], correct: 1 },
  { question: "What is the highest mountain in Antarctica?", choices: ["Vinson Massif","Mount Erebus","Mount Sidley","Mount Tyree"], correct: 0 },
  { question: "What is the highest mountain in Japan?", choices: ["Mount Tate","Mount Fuji","Mount Hotaka","Mount Yari"], correct: 1 },
  { question: "How tall is Mount Everest (approximately, in meters)?", choices: ["7,500","8,849","9,200","6,400"], correct: 1 },
  { question: "What is the second highest mountain in the world?", choices: ["K2","Kangchenjunga","Lhotse","Makalu"], correct: 0 },
  { question: "What is the highest mountain in the contiguous U.S.?", choices: ["Mount Rainier","Mount Whitney","Mount Elbert","Mount Shasta"], correct: 1 },
  { question: "Which range stretches along the western U.S. and Canada?", choices: ["Appalachians","Rockies","Sierra Nevada","Cascades"], correct: 1 },
  { question: "What is the highest peak in the Alps?", choices: ["Matterhorn","Mont Blanc","Eiger","Jungfrau"], correct: 1 },
  { question: "On which mountain did Sir Edmund Hillary first reach the summit in 1953?", choices: ["K2","Annapurna","Everest","Lhotse"], correct: 2 },
  { question: "What is the volcanic peak in Tanzania famed for snowy slopes near the equator?", choices: ["Mount Kenya","Kilimanjaro","Stanley","Meru"], correct: 1 },
  { question: "In which country is the Matterhorn located?", choices: ["Switzerland and Italy","France","Austria","Germany"], correct: 0 },
  { question: "What range separates Europe from Asia?", choices: ["Caucasus","Urals","Carpathians","Pyrenees"], correct: 1 },
  { question: "What is the highest mountain in the British Isles?", choices: ["Snowdon","Ben Nevis","Scafell Pike","Carrauntoohil"], correct: 1 },
  { question: "What is the highest peak in the Andes?", choices: ["Aconcagua","Huascaran","Ojos del Salado","Sajama"], correct: 0 },
  { question: "What is the highest mountain in New Zealand?", choices: ["Mount Tasman","Aoraki / Mount Cook","Mount Aspiring","Mitre Peak"], correct: 1 },
  { question: "What is the world's tallest mountain measured from base to peak (mostly underwater)?", choices: ["Everest","Mauna Kea","K2","Aconcagua"], correct: 1 },
  { question: "How many of the world's 8000m peaks are there?", choices: ["10","14","16","20"], correct: 1 },
  { question: "On which mountain do four U.S. presidents have carved faces?", choices: ["Mount Rainier","Mount Rushmore","Mount McKinley","Mount Hood"], correct: 1 },
  { question: "What is Africa's most active volcano?", choices: ["Kilimanjaro","Mount Kenya","Nyiragongo","Mount Cameroon"], correct: 2 },
  { question: "What is the highest peak in Mexico?", choices: ["Popocatepetl","Iztaccihuatl","Pico de Orizaba","La Malinche"], correct: 2 },
  { question: "What is the highest peak in Spain (mainland)?", choices: ["Pico de Veleta","Mulhacen","Aneto","Teide"], correct: 1 },
  { question: "What is the highest peak in Spain (including Canary Islands)?", choices: ["Mulhacen","Teide","Aneto","Pico Posets"], correct: 1 },
  { question: "Which mountain is associated with Noah's Ark in the Bible?", choices: ["Mount Sinai","Mount Ararat","Mount Hermon","Mount Olympus"], correct: 1 },
  { question: "What is the home of the Greek gods?", choices: ["Mount Etna","Mount Olympus","Mount Athos","Mount Parnassus"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MountainQuizSettings): MountainQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MountainQuizState, action: MountainQuizAction): MountainQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MountainQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
