import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KgbQuizSettings { questions: "10" | "20"; }
export interface KgbQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KgbQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {"question": "KGB stands for what (English)?", "choices": ["Committee for State Security", "Soviet Spy Bureau", "Central Soviet Police", "People's Security"], "correct": 0},
  {"question": "In what year was the KGB founded?", "choices": ["1917", "1934", "1954", "1991"], "correct": 2},
  {"question": "KGB headquarters building in Moscow?", "choices": ["Lubyanka", "Kremlin", "Red Square", "Arbat"], "correct": 0},
  {"question": "Which Soviet leader was a KGB chairman?", "choices": ["Andropov", "Brezhnev", "Khrushchev", "Gorbachev"], "correct": 0},
  {"question": "KGB First Chief Directorate handled?", "choices": ["Foreign intelligence", "Domestic", "Border", "Signals"], "correct": 0},
  {"question": "Which agency replaced the KGB in Russia (foreign)?", "choices": ["SVR", "FSB", "GRU", "FAPSI"], "correct": 0},
  {"question": "Which agency replaced the KGB (domestic)?", "choices": ["FSB", "SVR", "GRU", "MVD"], "correct": 0},
  {"question": "KGB defector who became MI6 asset, exfiltrated 1985?", "choices": ["Gordievsky", "Penkovsky", "Mitrokhin", "Kalugin"], "correct": 0},
  {"question": "KGB archivist who smuggled notes to UK?", "choices": ["Mitrokhin", "Gordievsky", "Kalugin", "Litvinenko"], "correct": 0},
  {"question": "Cheka, OGPU, NKVD, MGB were KGB's?", "choices": ["Predecessors", "Subsidiaries", "Rivals", "Allies"], "correct": 0},
  {"question": "Cheka founder?", "choices": ["Dzerzhinsky", "Yagoda", "Yezhov", "Beria"], "correct": 0},
  {"question": "Beria led which agency?", "choices": ["NKVD", "Cheka", "KGB", "GRU"], "correct": 0},
  {"question": "KGB term for foreign 'illegal' agents?", "choices": ["Nelegaly", "Apparat", "Kontora", "Konspiratsiya"], "correct": 0},
  {"question": "KGB Directorate K was responsible for?", "choices": ["Counterintel in foreign ops", "Surveillance", "Border", "Comms"], "correct": 0},
  {"question": "KGB poisoned Bulgarian dissident with?", "choices": ["Ricin umbrella", "Polonium", "Novichok", "Sarin"], "correct": 0},
  {"question": "Litvinenko was poisoned in 2006 with?", "choices": ["Polonium-210", "Ricin", "Sarin", "Novichok"], "correct": 0},
  {"question": "Putin served in KGB stationed in?", "choices": ["Dresden", "Berlin", "Prague", "Warsaw"], "correct": 0},
  {"question": "KGB's elite spec-ops unit?", "choices": ["Alpha Group", "Vympel", "Both", "Spetsnaz"], "correct": 2},
  {"question": "KGB Ninth Directorate guarded?", "choices": ["Soviet leadership", "Border", "Embassies", "Archives"], "correct": 0},
  {"question": "Which KGB defector revealed Walker spy ring?", "choices": ["Yurchenko", "Gordievsky", "Mitrokhin", "Polyakov"], "correct": 0},
  {"question": "KGB residency abroad was led by?", "choices": ["Rezident", "Resident agent", "Chief", "Komandir"], "correct": 0},
  {"question": "Operation RYAN sought signs of what?", "choices": ["NATO first strike", "US elections", "Reagan illness", "Defections"], "correct": 0},
  {"question": "KGB Line X targeted?", "choices": ["Science/tech", "Politics", "Counterintel", "Press"], "correct": 0},
  {"question": "KGB recruited Aldrich Ames in?", "choices": ["1985", "1979", "1991", "1968"], "correct": 0},
  {"question": "Robert Hanssen spied for KGB/SVR for how long?", "choices": ["~22 years", "~5 years", "~10 years", "~30 years"], "correct": 0},
  {"question": "KGB sponsored 'active measures' meaning?", "choices": ["Disinformation", "Assassinations", "Sabotage", "All"], "correct": 3},
  {"question": "KGB chairman during 1991 coup attempt?", "choices": ["Kryuchkov", "Chebrikov", "Andropov", "Bakatin"], "correct": 0},
  {"question": "After 1991 coup, KGB was disbanded by?", "choices": ["Gorbachev", "Yeltsin", "Putin", "Khrushchev"], "correct": 1},
  {"question": "KGB Border Troops counted roughly how many?", "choices": ["220,000+", "20,000", "5 million", "100"], "correct": 0},
  {"question": "KGB main rival agency in USSR?", "choices": ["GRU", "FSB", "SVR", "NKVD"], "correct": 0}
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KgbQuizSettings): KgbQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KgbQuizState, action: KgbQuizAction): KgbQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KgbQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
