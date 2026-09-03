const __saltThemeAsset=(path)=>{const value=String(path);return new URL(value.startsWith("./")?value.slice(2):value,import.meta.url).href};
const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./web-CJJ3fygS.js?seo=20260903","./index-CV4Cquht.js?seo=20260903"])))=>i.map(i=>__saltThemeAsset(d[i]));
import{ad as e}from"./salt-entry-caad67bc1a96.js?seo=20260903";import{r as p}from"./index-CV4Cquht.js?seo=20260903";const i=p("App",{web:()=>e(()=>import("./web-CJJ3fygS.js?seo=20260903"),__vite__mapDeps([0,1])).then(r=>new r.AppWeb)});export{i as App};
