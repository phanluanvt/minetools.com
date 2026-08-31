const fs=require("fs"),path=require("path");
const OUT=path.join(__dirname,"dist");
let errors=[],htmlFiles=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?walk(p):e.name.endsWith(".html")&&htmlFiles.push(p)}}
function need(ok,msg){if(!ok)errors.push(msg)}
need(fs.existsSync(OUT),"dist/ missing");
if(fs.existsSync(OUT)) walk(OUT);
for(const f of htmlFiles){const s=fs.readFileSync(f,"utf8"),rel=path.relative(OUT,f);
  need(/<title>[^<]{8,}</title>/i.test(s),rel+": missing/short title");
  need(/<meta name="description" content="[^"]{30,}"/i.test(s),rel+": missing/short meta description");
  need(/<link rel="canonical" href="https://minetools.io//i.test(s),rel+": missing canonical");
  need(/<meta name="robots" content="(?:index,follow|noindex,follow)"/i.test(s),rel+": robots directive missing");
  need(/<h1[s>]/i.test(s),rel+": missing H1");
}
for(const required of ["sitemap.xml","robots.txt","data/mods.json","assets/styles.css","assets/app.js","404.html"])need(fs.existsSync(path.join(OUT,required)),required+" missing");
if(fs.existsSync(path.join(OUT,"sitemap.xml"))){const s=fs.readFileSync(path.join(OUT,"sitemap.xml"),"utf8");need(!s.includes("?"),"sitemap contains query/filter URLs");need(s.includes("https://minetools.io/mods/"),"sitemap missing mods directory")}
if(errors.length){console.error("\nBUILD VALIDATION FAILED\n- "+errors.join("\n- "));process.exit(1)}
console.log("Build validation passed:",htmlFiles.length,"HTML pages checked.");
