import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CybersecQuizSettings { questions: "10" | "20" | "30"; }
export interface CybersecQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CybersecQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What does SSL/TLS provide?", choices: ["Compression", "Encryption in transit", "Faster speed", "More storage"], correct: 1 },
  { question: "What attack tries every password combination?", choices: ["Phishing", "Brute force", "MITM", "DDoS"], correct: 1 },
  { question: "What is phishing?", choices: ["Network scan", "Tricking users into revealing info", "Type of encryption", "Malware type"], correct: 1 },
  { question: "What is a DDoS attack?", choices: ["Distributed denial-of-service overload", "Disk failure", "Disk operating system", "Direct DNS Override"], correct: 0 },
  { question: "What type of cryptography uses public/private keys?", choices: ["Symmetric", "Asymmetric", "Hash", "Salt"], correct: 1 },
  { question: "What is AES?", choices: ["Symmetric encryption standard", "Public key algorithm", "Hash function", "Network protocol"], correct: 0 },
  { question: "What is RSA?", choices: ["Symmetric cipher", "Asymmetric (public-key) algorithm", "Hash function", "Hash salt"], correct: 1 },
  { question: "What is 2FA?", choices: ["Two-factor authentication", "Two-fold antivirus", "Two file authority", "Two-flag access"], correct: 0 },
  { question: "Which is a hash function?", choices: ["AES", "RSA", "SHA-256", "DES"], correct: 2 },
  { question: "What is SQL injection?", choices: ["Inserting malicious SQL via input", "DB optimization", "Network scan", "Backup tool"], correct: 0 },
  { question: "What is XSS?", choices: ["Cross-Site Scripting", "Extra Service System", "X-Site Server", "Extended Security Spec"], correct: 0 },
  { question: "What is ransomware?", choices: ["Malware that encrypts files for ransom", "Adware", "Spyware", "Virus checker"], correct: 0 },
  { question: "What does VPN stand for?", choices: ["Virtual Private Network", "Verified Public Network", "Virtual Public Node", "Verified Personal Network"], correct: 0 },
  { question: "Who broke the Enigma cipher in WWII?", choices: ["Turing's team", "Bell Labs", "Stanford", "MIT"], correct: 0 },
  { question: "Which is a famous worm from 1988?", choices: ["Morris worm", "Stuxnet", "WannaCry", "ILOVEYOU"], correct: 0 },
  { question: "Which malware targeted Iran's nuclear program?", choices: ["WannaCry", "Stuxnet", "Mirai", "Conficker"], correct: 1 },
  { question: "What is a firewall?", choices: ["Antivirus", "Network traffic filter", "OS component", "Compression tool"], correct: 1 },
  { question: "What is salting (in passwords)?", choices: ["Adding random data before hashing", "Removing data", "Encrypting twice", "Hashing in plaintext"], correct: 0 },
  { question: "Which company had the 2017 massive credit-data breach?", choices: ["Target", "Equifax", "Yahoo", "Sony"], correct: 1 },
  { question: "What does CIA stand for in security?", choices: ["Confidentiality, Integrity, Availability", "Computer Internet Access", "Central Information Authority", "Code Integrity Audit"], correct: 0 },
  { question: "What is a zero-day?", choices: ["Patch released day", "Unknown unpatched vulnerability", "First day of new install", "Data wipe"], correct: 1 },
  { question: "What is MFA?", choices: ["Multi-factor authentication", "More Firewall Active", "Major Flow Authority", "Mandatory File Access"], correct: 0 },
  { question: "What is Wireshark?", choices: ["Antivirus", "Packet analyzer", "Firewall", "Encryption tool"], correct: 1 },
  { question: "What did the SolarWinds incident exploit?", choices: ["Phishing email", "Supply-chain compromise", "DDoS", "USB attack"], correct: 1 },
  { question: "Which protocol secures email?", choices: ["FTP", "SMTP", "PGP/S/MIME", "DNS"], correct: 2 },
  { question: "What is the WannaCry attack type?", choices: ["Phishing", "Ransomware worm", "Trojan", "Adware"], correct: 1 },
  { question: "Which is asymmetric? RSA or AES?", choices: ["AES", "RSA", "Both", "Neither"], correct: 1 },
  { question: "What is social engineering?", choices: ["Code injection", "Manipulating people to bypass security", "Network attack", "OS exploit"], correct: 1 },
  { question: "What is HTTPS' default port?", choices: ["80", "443", "8080", "21"], correct: 1 },
  { question: "What is a honeypot?", choices: ["Sweet trap to lure attackers", "Type of firewall", "Hardware token", "VPN endpoint"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CybersecQuizSettings): CybersecQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CybersecQuizState, action: CybersecQuizAction): CybersecQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CybersecQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
