import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AfricanGeographyQuizSettings { questions: "10" | "20" | "30"; }
export interface AfricanGeographyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AfricanGeographyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Capital of Egypt?", choices: ["Cairo","Alexandria","Aswan","Luxor"], correct: 0 },
  { question: "Capital of Kenya?", choices: ["Mombasa","Nairobi","Kisumu","Nakuru"], correct: 1 },
  { question: "Capital of Nigeria?", choices: ["Lagos","Abuja","Kano","Ibadan"], correct: 1 },
  { question: "Capital of Ethiopia?", choices: ["Addis Ababa","Mekelle","Adama","Bahir Dar"], correct: 0 },
  { question: "Capital of Morocco?", choices: ["Casablanca","Marrakech","Rabat","Fez"], correct: 2 },
  { question: "Capital of Ghana?", choices: ["Kumasi","Accra","Tamale","Tema"], correct: 1 },
  { question: "Capital of Senegal?", choices: ["Touba","Dakar","Thies","Kaolack"], correct: 1 },
  { question: "Longest river in Africa?", choices: ["Congo","Niger","Nile","Zambezi"], correct: 2 },
  { question: "Which river forms Victoria Falls?", choices: ["Nile","Congo","Zambezi","Limpopo"], correct: 2 },
  { question: "Which country contains the Sahara's largest portion?", choices: ["Egypt","Algeria","Sudan","Libya"], correct: 1 },
  { question: "Capital of Tanzania?", choices: ["Dar es Salaam","Arusha","Dodoma","Zanzibar"], correct: 2 },
  { question: "Capital of Uganda?", choices: ["Entebbe","Jinja","Kampala","Mbarara"], correct: 2 },
  { question: "Capital of Algeria?", choices: ["Oran","Algiers","Constantine","Annaba"], correct: 1 },
  { question: "Capital of Tunisia?", choices: ["Sfax","Sousse","Tunis","Bizerte"], correct: 2 },
  { question: "Capital of Libya?", choices: ["Benghazi","Tripoli","Misrata","Sirte"], correct: 1 },
  { question: "Capital of Sudan?", choices: ["Omdurman","Port Sudan","Khartoum","Kassala"], correct: 2 },
  { question: "Capital of South Sudan?", choices: ["Wau","Juba","Malakal","Yei"], correct: 1 },
  { question: "Capital of Madagascar?", choices: ["Toamasina","Antananarivo","Mahajanga","Fianarantsoa"], correct: 1 },
  { question: "Capital of Zimbabwe?", choices: ["Bulawayo","Harare","Mutare","Gweru"], correct: 1 },
  { question: "Capital of Zambia?", choices: ["Ndola","Kitwe","Lusaka","Livingstone"], correct: 2 },
  { question: "Capital of Botswana?", choices: ["Gaborone","Francistown","Maun","Selebi-Phikwe"], correct: 0 },
  { question: "Capital of Namibia?", choices: ["Walvis Bay","Swakopmund","Windhoek","Oshakati"], correct: 2 },
  { question: "Capital of Angola?", choices: ["Lobito","Benguela","Luanda","Huambo"], correct: 2 },
  { question: "Capital of Mozambique?", choices: ["Beira","Nampula","Maputo","Pemba"], correct: 2 },
  { question: "Capital of Cameroon?", choices: ["Douala","Yaounde","Garoua","Bamenda"], correct: 1 },
  { question: "Capital of Cote d'Ivoire (political)?", choices: ["Abidjan","Yamoussoukro","Bouake","Korhogo"], correct: 1 },
  { question: "Africa's highest mountain?", choices: ["Mt. Kenya","Ras Dashen","Kilimanjaro","Mt. Stanley"], correct: 2 },
  { question: "Lake Victoria is shared by Tanzania, Kenya, and?", choices: ["Rwanda","Burundi","Uganda","Ethiopia"], correct: 2 },
  { question: "Capital of Rwanda?", choices: ["Kigali","Butare","Gisenyi","Ruhengeri"], correct: 0 },
  { question: "Capital of Burundi?", choices: ["Bujumbura","Gitega","Ngozi","Muyinga"], correct: 1 },
  { question: "Largest desert in Africa?", choices: ["Kalahari","Namib","Sahara","Danakil"], correct: 2 },
  { question: "Which African country is landlocked: Niger or Nigeria?", choices: ["Niger","Nigeria","Both","Neither"], correct: 0 },
  { question: "Which sea borders Egypt to the north?", choices: ["Red Sea","Mediterranean","Black Sea","Arabian Sea"], correct: 1 },
  { question: "Capital of Mali?", choices: ["Timbuktu","Mopti","Bamako","Kayes"], correct: 2 },
  { question: "Capital of Eritrea?", choices: ["Asmara","Massawa","Keren","Assab"], correct: 0 },
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
