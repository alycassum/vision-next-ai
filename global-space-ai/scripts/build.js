// Usage: node scripts/build.js  -> writes worker/prompt.generated.js
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const PERSONAS = {
  visionnext: { file: "persona-visionnext.md", brand: "Vision Next",
    knowledge: ["company", "design", "scanline", "woodhouse", "global-space"],
    wa: "923360839136", waDisplay: "+92 336 0839136" },
  globalspace: { file: "persona-globalspace.md", brand: "Global Space",
    knowledge: ["global-space"],
    wa: "923282277370", waDisplay: "0328-2277370" },
};
function knowledgeFor(dirs) {
  return dirs.map(d => {
    const dir = path.join(root, "knowledge", d);
    return fs.readdirSync(dir).filter(f => f.endsWith(".md") && !f.startsWith("_"))
      .map(f => `\n## FILE: ${d}/${f}\n` + fs.readFileSync(path.join(dir, f), "utf8")).join("\n");
  }).join("\n");
}
const out = {};
for (const [name, p] of Object.entries(PERSONAS)) {
  const text = (read("prompts/" + p.file) + "\n" + read("prompts/base.md"))
    .replace("{{KNOWLEDGE}}", knowledgeFor(p.knowledge))
    .replaceAll("{{BRAND}}", p.brand)
    .replaceAll("{{WA_NUMBER}}", p.wa).replaceAll("{{WA_DISPLAY}}", p.waDisplay);
  out[name] = text;
  console.log(name, text.length, "chars");
}
fs.writeFileSync(path.join(root, "worker", "prompt.generated.js"), "export default " + JSON.stringify(out) + ";\n");
