const __saltThemeAsset=(path)=>{const value=String(path);return new URL(value.startsWith("./")?value.slice(2):value,import.meta.url).href};
const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./web-CJJ3fygS.js","./index-CV4Cquht.js"])))=>i.map(i=>__saltThemeAsset(d[i]));
import{_ as e}from"./salt-entry-0c585c968141.js";import{r as p}from"./index-CV4Cquht.js";const _=p("App",{web:()=>e(()=>import("./web-CJJ3fygS.js"),__vite__mapDeps([0,1])).then(r=>new r.AppWeb)});export{_ as App};
