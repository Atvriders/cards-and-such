import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OttomanEmpireQuizSettings { questions: "10" | "20" | "30"; }
export interface OttomanEmpireQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OttomanEmpireQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who founded the Ottoman Empire (around 1299)?", choices: ["Osman I","Mehmed II","Suleiman","Bayezid"], correct: 0 },
  { question: "What city did the Ottomans conquer in 1453?", choices: ["Constantinople","Vienna","Jerusalem","Cairo"], correct: 0 },
  { question: "Who conquered Constantinople?", choices: ["Mehmed II","Suleiman","Bayezid","Selim I"], correct: 0 },
  { question: "What did Constantinople become after capture?", choices: ["Istanbul (Ottoman capital)","Abandoned","Ankara","Edirne"], correct: 0 },
  { question: "What was the title of the Ottoman ruler?", choices: ["Sultan","Caliph","Emperor","Shah"], correct: 0 },
  { question: "Who was the most famous sultan, called 'the Magnificent'?", choices: ["Suleiman","Mehmed II","Selim","Bayezid"], correct: 0 },
  { question: "In what years did Suleiman the Magnificent reign?", choices: ["1520-1566","1453-1481","1389-1402","1574-1595"], correct: 0 },
  { question: "What 1571 naval battle ended Ottoman dominance in Mediterranean?", choices: ["Lepanto","Preveza","Chesma","Navarino"], correct: 0 },
  { question: "What 1683 siege failed against the Habsburgs?", choices: ["Vienna","Buda","Belgrade","Erlau"], correct: 0 },
  { question: "What was the Ottoman military elite infantry?", choices: ["Janissaries","Sipahi","Akinci","Bashi-bazouk"], correct: 0 },
  { question: "What was the Ottoman elite cavalry?", choices: ["Sipahi","Janissaries","Mamluks","Akinci"], correct: 0 },
  { question: "What was the Devshirme system?", choices: ["Levy of Christian boys","Land system","Tax system","Military draft"], correct: 0 },
  { question: "What was the Ottoman ruling system code?", choices: ["Kanun","Sharia","Both","Code Napoleon"], correct: 2 },
  { question: "What was the Sublime Porte?", choices: ["Ottoman government","Capital gate","Both","Religious office"], correct: 2 },
  { question: "What language was the official literary language?", choices: ["Ottoman Turkish","Arabic","Persian","All used"], correct: 3 },
  { question: "What religion was the Ottoman state?", choices: ["Sunni Islam","Shia Islam","Christianity","Mixed"], correct: 0 },
  { question: "What 1517 conquest brought Ottomans the caliphate?", choices: ["Egypt","Syria","Hejaz","All in Selim I's campaigns"], correct: 3 },
  { question: "What's the famous Ottoman mosque in Istanbul?", choices: ["Hagia Sophia","Blue Mosque","Suleymaniye","All major"], correct: 3 },
  { question: "What architect designed many great Ottoman mosques?", choices: ["Mimar Sinan","Mehmed Aga","Hayreddin","All built mosques"], correct: 0 },
  { question: "Who was the consort known as Hurrem Sultan?", choices: ["Roxelana","Kosem","Mahidevran","Nurbanu"], correct: 0 },
  { question: "What 1908 revolution forced constitutional rule?", choices: ["Young Turk Revolution","Tanzimat","Hatt-i Sherif","Hatt-i Humayun"], correct: 0 },
  { question: "What 19th-century reforms modernized the empire?", choices: ["Tanzimat","Devshirme","Millet","All reforms"], correct: 0 },
  { question: "Where was the Ottoman empire's territory at greatest extent?", choices: ["From Algeria to Iraq, Hungary to Yemen","Arabia only","Anatolia only","Persia"], correct: 0 },
  { question: "What was the millet system?", choices: ["Religious community self-governance","Tax category","Land grant","Military unit"], correct: 0 },
  { question: "What modern country was formed from the Ottoman heartland?", choices: ["Turkey","Iraq","Syria","Multiple emerged"], correct: 0 },
  { question: "Who founded the Republic of Turkey in 1923?", choices: ["Mustafa Kemal Ataturk","Enver Pasha","Ismet Inonu","Abdul Hamid"], correct: 0 },
  { question: "What was the Ottoman Sultan also titled in Mecca/Medina?", choices: ["Caliph and Custodian of the Two Holy Mosques","King","Imam","Just Sultan"], correct: 0 },
  { question: "What was the Topkapi Palace?", choices: ["Sultan's residence","Mosque","Monastery","Harem only"], correct: 0 },
  { question: "What was the harem?", choices: ["Imperial women's quarters","Treasury","Council","Bathhouse"], correct: 0 },
  { question: "In what year did the Ottoman Empire officially end?", choices: ["1918","1922","1923","1920"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OttomanEmpireQuizSettings): OttomanEmpireQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OttomanEmpireQuizState, action: OttomanEmpireQuizAction): OttomanEmpireQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OttomanEmpireQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
