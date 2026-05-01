import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CiaQuizSettings { questions: "10" | "20"; }
export interface CiaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CiaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {"question": "In what year was the CIA founded?", "choices": ["1942", "1947", "1953", "1961"], "correct": 1},
  {"question": "Where is CIA headquarters?", "choices": ["Quantico", "Langley, VA", "Fort Meade", "Bethesda"], "correct": 1},
  {"question": "Which act created the CIA?", "choices": ["Espionage Act", "National Security Act", "Patriot Act", "Homeland Security Act"], "correct": 1},
  {"question": "Which WWII agency preceded the CIA?", "choices": ["FBI", "OSS", "G-2", "ONI"], "correct": 1},
  {"question": "Who led the OSS?", "choices": ["William Donovan", "Allen Dulles", "Richard Helms", "Stansfield Turner"], "correct": 0},
  {"question": "Which CIA-backed 1961 invasion failed in Cuba?", "choices": ["Bay of Pigs", "Mongoose", "JMWAVE", "Northwoods"], "correct": 0},
  {"question": "Project ___ tested LSD and mind control.", "choices": ["MK-ULTRA", "Bluebird", "PAPERCLIP", "GLADIO"], "correct": 0},
  {"question": "Who directed the CIA from 1966 to 1973?", "choices": ["Allen Dulles", "Richard Helms", "William Casey", "George Tenet"], "correct": 1},
  {"question": "DCI fired after Bay of Pigs?", "choices": ["Allen Dulles", "John McCone", "Richard Helms", "William Colby"], "correct": 0},
  {"question": "Counterintelligence chief obsessed with KGB moles?", "choices": ["James Angleton", "Cord Meyer", "Frank Wisner", "Tracy Barnes"], "correct": 0},
  {"question": "Iran-Contra DCI?", "choices": ["William Casey", "Stansfield Turner", "Robert Gates", "James Woolsey"], "correct": 0},
  {"question": "CIA officer who betrayed agency for KGB, exposed 1994?", "choices": ["Edward Howard", "Aldrich Ames", "Harold Nicholson", "Brian Kelley"], "correct": 1},
  {"question": "First female CIA Director?", "choices": ["Gina Haspel", "Avril Haines", "Jami Miscik", "Tina Shaver"], "correct": 0},
  {"question": "Which committee investigated CIA abuses in 1975?", "choices": ["Church Committee", "Pike Committee", "Rockefeller Commission", "All of these"], "correct": 3},
  {"question": "Which DCI later became U.S. President?", "choices": ["George H.W. Bush", "Gerald Ford", "Jimmy Carter", "Ronald Reagan"], "correct": 0},
  {"question": "CIA's covert operations branch was originally called?", "choices": ["OPC", "NCS", "SOG", "DDP"], "correct": 0},
  {"question": "CIA paramilitary unit?", "choices": ["Special Activities Center", "Delta", "DEVGRU", "ISA"], "correct": 0},
  {"question": "Famous CIA helicopter evacuation rooftop in 1975 was in?", "choices": ["Saigon", "Phnom Penh", "Kabul", "Tehran"], "correct": 0},
  {"question": "Which agent helped capture Pablo Escobar?", "choices": ["Steve Murphy", "Bob Levinson", "Ric Prado", "Tony Mendez"], "correct": 0},
  {"question": "Tony Mendez led which exfiltration?", "choices": ["Argo (Iran)", "Saigon", "Berlin", "Beirut"], "correct": 0},
  {"question": "CIA's training facility nickname?", "choices": ["The Farm", "The Yard", "The Pit", "The Ranch"], "correct": 0},
  {"question": "CIA station chief killed in Khost bombing 2009?", "choices": ["Jennifer Matthews", "Kathryn Bigelow", "Mary Bush", "Susan Hasler"], "correct": 0},
  {"question": "CIA briefing book for the President is called?", "choices": ["PDB", "NIE", "NID", "CIB"], "correct": 0},
  {"question": "Mossad-CIA op against Iran's centrifuges?", "choices": ["Stuxnet", "Olympic Games", "Both", "Argo"], "correct": 2},
  {"question": "Which DCI resigned after 9/11 critique, 2004?", "choices": ["George Tenet", "Porter Goss", "Michael Hayden", "Leon Panetta"], "correct": 0},
  {"question": "CIA torture program post-9/11 used what euphemism?", "choices": ["Enhanced interrogation", "Special handling", "Hard talk", "Active questioning"], "correct": 0},
  {"question": "Senate Intelligence Committee released report on torture in?", "choices": ["2014", "2010", "2007", "2018"], "correct": 0},
  {"question": "CIA officer Valerie Plame's cover was blown by?", "choices": ["Robert Novak column", "Time", "NYT", "WashPost"], "correct": 0},
  {"question": "CIA's overhead reconnaissance plane in 1950s?", "choices": ["U-2", "SR-71", "A-12", "RQ-170"], "correct": 0},
  {"question": "CIA Memorial Wall stars represent?", "choices": ["Officers killed in line of duty", "Directors", "Stations", "Campaigns"], "correct": 0}
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CiaQuizSettings): CiaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CiaQuizState, action: CiaQuizAction): CiaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CiaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
