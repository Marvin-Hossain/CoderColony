import{c as l,j as e}from"./index-BjGb8Yy2.js";/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],f=l("eye",x);/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",key:"mvr1a0"}]],u=l("heart",m);/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]],j=l("search",p);/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],h=l("users",g),c=(s,t=1)=>{const r=["#22c55e","#10b981","#f59e0b","#f97316","#ef4444","#dc2626"][s]||"#6b7280";if(t===1)return r;const n=r.replace("#",""),a=parseInt(n.substring(0,2),16),o=parseInt(n.substring(2,4),16),d=parseInt(n.substring(4,6),16);return`rgba(${a}, ${o}, ${d}, ${t})`},y=s=>["Beginner","Easy","Medium","Hard","Expert","Master"][s]||"Unknown",N=({deck:s,onClick:t})=>{const i=t?"button":"div",r=t?{type:"button",onClick:t,className:"w-full text-left",style:{background:"none",border:"none",padding:0}}:{className:"w-full"};return e.jsx(i,{...r,children:e.jsxs("article",{className:"flex h-full flex-col gap-5 rounded-2xl border bg-card p-6 text-left shadow-lg transition-transform",style:{transition:"transform 0.2s ease, box-shadow 0.2s ease"},children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[s.isOfficial&&e.jsx("span",{className:"inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary",children:"Official"}),e.jsx("span",{className:"inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",style:{backgroundColor:c(s.difficulty,.14),color:c(s.difficulty,1)},children:y(s.difficulty)})]}),e.jsxs("span",{className:"inline-flex items-center rounded-full bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground",children:[e.jsx(h,{size:14,className:"mr-1"}),s.isPublic?"Public":"Private"]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("h3",{className:"text-lg font-semibold",children:s.title}),s.description&&e.jsx("p",{className:"text-sm leading-relaxed text-muted-foreground",children:s.description}),s.tags.length>0&&e.jsxs("div",{className:"flex flex-wrap gap-2",children:[s.tags.slice(0,3).map((n,a)=>e.jsx("span",{className:"inline-flex items-center rounded-full bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground",children:n},`${n}-${a}`)),s.tags.length>3&&e.jsxs("span",{className:"inline-flex items-center rounded-full bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground",children:["+",s.tags.length-3]})]})]}),e.jsx("div",{className:"mt-auto flex items-center justify-between text-xs text-muted-foreground",children:e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs("span",{className:"inline-flex items-center gap-1",children:[e.jsx(u,{size:16}),s.likeCount]}),e.jsxs("span",{className:"inline-flex items-center gap-1",children:[e.jsx(f,{size:16}),s.viewCount]})]})})]})})};export{N as F,u as H,j as S};
