import pdf from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { getCollection } from "./chroma";

export async function ingestPDF(file: Blob, filename: string): Promise<{ chunkCount: number }> {
  // 1. Manually parse PDF to bypass Langchain's broken Vercel integration
  const buffer = Buffer.from(await file.arrayBuffer());
  const data = await pdf(buffer);
  const text = data.text;
  
  // 2. Chunk with RecursiveCharacterTextSplitter
  // Why these values? 
  // chunkSize: 500 characters strikes a good balance between providing enough context 
  // for the LLM to understand semantic meaning, and keeping it focused enough to pinpoint facts.
  // chunkOverlap: 50 ensures that concepts split across chunk boundaries aren't lost, 
  // maintaining continuity between adjacent chunks.
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  
  const docs = await textSplitter.createDocuments([text], [{ source: filename }]);

  // 3. Embed with HuggingFace Free Inference API
  const embeddings = new HuggingFaceInferenceEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    apiKey: process.env.HF_TOKEN,
  });

  const texts = docs.map((doc) => doc.pageContent);
  const embeddingsArray = await embeddings.embedDocuments(texts);

  // 4. Upsert into ChromaDB with metadata
  const collection = await getCollection("pdf_docs");

  const metadatas = docs.map((doc, i) => ({
    source: filename,
    page: doc.metadata.loc?.pageNumber || doc.metadata.page || 1,
    chunkIndex: i,
  }));

  const ids = docs.map((_, i) => `${filename}-chunk-${i}`);

  await collection.upsert({
    ids,
    embeddings: embeddingsArray,
    metadatas,
    documents: texts,
  });

  // 5. Return chunkCount
  return { chunkCount: docs.length };
}
