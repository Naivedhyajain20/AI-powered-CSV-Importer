import { PromptBuilderService } from './src/services/ai/prompt-builder.service';
import { GeminiExtractionService } from './src/services/ai/gemini-extraction.service';

async function testMapping() {
  const promptBuilder = new PromptBuilderService();
  const geminiService = new GeminiExtractionService();
  
  const headers = ['Client Name', 'Primary Email', 'Mobile No.'];
  const sampleRows = [
    { 'Client Name': 'Alice', 'Primary Email': 'alice@test.com', 'Mobile No.': '555-0101' },
    { 'Client Name': 'Bob', 'Primary Email': 'bob@test.com', 'Mobile No.': '555-0102' }
  ];
  
  const prompt = promptBuilder.buildMappingPrompt(headers, sampleRows);
  console.log('Sending Mapping Prompt to Groq...');
  
  try {
    const rawResult = await geminiService.extract(prompt);
    console.log('--- RAW GROQ MAPPING RESULT ---');
    console.log(rawResult);
    console.log('-----------------------');
    
    // Simulate cleanAndParseJsonArray
    let cleanedJson = rawResult.trim();
    if (cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson.replace(/^```(?:json|javascript)?\s*/i, '').replace(/```$/, '').trim();
    }
    const parsed = JSON.parse(cleanedJson);
    let output;
    if (Array.isArray(parsed)) output = parsed;
    else if (parsed && Array.isArray(parsed.records)) output = parsed.records;
    else if (parsed && Array.isArray(parsed.mappings)) output = parsed.mappings;
    else throw new Error('Not valid object wrapper');
    
    console.log('Parsed successfully:', output);
  } catch(e: any) {
    console.error('Error:', e.message);
  }
}

testMapping();
