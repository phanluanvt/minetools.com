const fs=require("fs"),path=require("path");
const OUT=path.join(__dirname,"dist");let errors=[],htmlFiles=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?walk(p):e.name.endsWith(".html")&&htmlFiles.push(p)}}
function need(ok,msg){if(!ok)errors.push(msg)}
need(fs.existsSync(OUT),"dist/ missing");if(fs.existsSync(OUT))walk(OUT);
const titles=new Map(),canonicals=new Map();
for(const f of htmlFiles){const s=fs.readFileSync(f,"utf8"),rel=path.relative(OUT,f),title=(s.match(/<title>([^<]+)<\/title>/i)||[])[1],canonical=(s.match(/<link rel="canonical" href="([^"]+)"/i)||[])[1];
 need(!!title&&title.length>=8,rel+": missing/short title");need(/<meta name="description" content="[^"]{30,}"/i.test(s),rel+": missing/short meta description");need(/^https:\/\/minetools\.io\//.test(canonical||""),rel+": missing/invalid canonical");need(/<meta name="robots" content="(?:index,follow|noindex,follow)"/i.test(s),rel+": robots directive missing");need(/<h1[\s>]/i.test(s),rel+": missing H1");
 if(title){if(titles.has(title))errors.push(rel+": duplicate title with "+titles.get(title));else titles.set(title,rel)}
 if(canonical){if(canonicals.has(canonical))errors.push(rel+": duplicate canonical with "+canonicals.get(canonical));else canonicals.set(canonical,rel)}
}
for(const p of ["sitemap.xml","robots.txt","data/mods.json","assets/styles.css","assets/app.js","404.html"])need(fs.existsSync(path.join(OUT,p)),p+" missing");
if(fs.existsSync(path.join(OUT,"sitemap.xml"))){const s=fs.readFileSync(path.join(OUT,"sitemap.xml"),"utf8");need(!s.includes("?"),"sitemap contains query/filter URLs");need(s.includes("https://minetools.io/mods/"),"sitemap missing mods directory");need(!s.includes("/404"),"404 must not be in sitemap")}
if(fs.existsSync(path.join(OUT,"data/mods.json"))){const mods=JSON.parse(fs.readFileSync(path.join(OUT,"data/mods.json"),"utf8"));need(Array.isArray(mods)&&mods.length>0,"mods dataset empty");const slugs=new Set();for(const m of mods){need(!!m.slug&&!!m.title,"mod missing slug/title");if(slugs.has(m.slug))errors.push("duplicate mod slug: "+m.slug);slugs.add(m.slug)}}
if(errors.length){console.error("\nBUILD VALIDATION FAILED\n- "+errors.join("\n- "));process.exit(1)}console.log("Build validation passed:",htmlFiles.length,"HTML pages checked.");