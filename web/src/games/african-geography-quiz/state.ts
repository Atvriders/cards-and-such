import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AfricanGeographyQuizSettings { questions: "10" | "20" | "30"; }
export interface AfricanGeographyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AfricanGeographyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the longest river in Africa?", choices: ["Congo","Niger","Nile","Zambezi"], correct: 2 },
  { question: "Which is the highest mountain in Africa?", choices: ["Mount Kenya","Mount Kilimanjaro","Mount Stanley","Ras Dashen"], correct: 1 },
  { question: "What is the largest desert in Africa?", choices: ["Kalahari","Namib","Sahara","Danakil"], correct: 2 },
  { question: "Lake Victoria is bordered by Uganda, Tanzania, and which other country?", choices: ["Kenya","Rwanda","Burundi","Sudan"], correct: 0 },
  { question: "What is the capital of Kenya?", choices: ["Mombasa","Kisumu","Nairobi","Eldoret"], correct: 2 },
  { question: "Which African country is entirely surrounded by South Africa?", choices: ["Eswatini","Lesotho","Botswana","Zimbabwe"], correct: 1 },
  { question: "What strait separates Morocco from Spain?", choices: ["Bosphorus","Hormuz","Gibraltar","Bab-el-Mandeb"], correct: 2 },
  { question: "What is the largest country in Africa by area?", choices: ["DRC","Sudan","Algeria","Libya"], correct: 2 },
  { question: "In which country is the Serengeti National Park?", choices: ["Kenya","Tanzania","Uganda","Zambia"], correct: 1 },
  { question: "What is the capital of Egypt?", choices: ["Alexandria","Giza","Cairo","Luxor"], correct: 2 },
  { question: "Madagascar is located off the coast of which African region?", choices: ["West Africa","Southeast Africa","North Africa","Horn of Africa"], correct: 1 },
  { question: "Which river forms Victoria Falls?", choices: ["Nile","Zambezi","Limpopo","Congo"], correct: 1 },
  { question: "What is the smallest country on the African mainland?", choices: ["Djibouti","The Gambia","Eswatini","Equatorial Guinea"], correct: 1 },
  { question: "Which African country was historically known as Abyssinia?", choices: ["Eritrea","Somalia","Ethiopia","Sudan"], correct: 2 },
  { question: "What is the capital of Nigeria?", choices: ["Lagos","Abuja","Kano","Ibadan"], correct: 1 },
  { question: "Which African country sits at the southern tip of the continent?", choices: ["Namibia","Mozambique","South Africa","Lesotho"], correct: 2 },
  { question: "What is the second-longest river in Africa?", choices: ["Niger","Congo","Zambezi","Orange"], correct: 1 },
  { question: "Mount Kilimanjaro is in which country?", choices: ["Kenya","Uganda","Tanzania","Rwanda"], correct: 2 },
  { question: "What body of water lies between Africa and the Arabian Peninsula?", choices: ["Mediterranean Sea","Red Sea","Black Sea","Caspian Sea"], correct: 1 },
  { question: "Which African country has both Mediterranean and Atlantic coastlines?", choices: ["Algeria","Tunisia","Morocco","Egypt"], correct: 2 },
  { question: "What is the capital of Ethiopia?", choices: ["Asmara","Addis Ababa","Mogadishu","Khartoum"], correct: 1 },
  { question: "The Atlas Mountains run through which countries?", choices: ["Egypt and Libya","Morocco, Algeria, Tunisia","Kenya and Tanzania","South Africa and Lesotho"], correct: 1 },
  { question: "Which African country produces the most cocoa?", choices: ["Nigeria","Ghana","Cote d'Ivoire","Cameroon"], correct: 2 },
  { question: "What is the largest island in Africa?", choices: ["Zanzibar","Reunion","Madagascar","Mauritius"], correct: 2 },
  { question: "Which sea borders Egypt to the north?", choices: ["Red Sea","Mediterranean Sea","Arabian Sea","Black Sea"], correct: 1 },
  { question: "In which country is Timbuktu?", choices: ["Niger","Mali","Mauritania","Senegal"], correct: 1 },
  { question: "What is the capital of South Africa's executive branch?", choices: ["Cape Town","Bloemfontein","Pretoria","Johannesburg"], correct: 2 },
  { question: "Which lake is the deepest in Africa?", choices: ["Victoria","Tanganyika","Malawi","Turkana"], correct: 1 },
  { question: "Which African country is named after the equator passes through it (Spanish: Guinea Ecuatorial)?", choices: ["Equatorial Guinea","Guinea","Guinea-Bissau","Gabon"], correct: 0 },
  { question: "What is the capital of Morocco?", choices: ["Casablanca","Marrakech","Rabat","Fes"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AfricanGeographyQuizSettings): AfricanGeographyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AfricanGeographyQuizState, action: AfricanGeographyQuizAction): AfricanGeographyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AfricanGeographyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
