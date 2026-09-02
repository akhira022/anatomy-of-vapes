import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildKnowledgeIndex } from "../lib/knowledge/build-chunks";

const outputPath = resolve(process.cwd(), "data/knowledge-index.json");
const index = buildKnowledgeIndex();

writeFileSync(outputPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");

console.log(`Wrote ${index.chunkCount} chunks to ${outputPath}`);
