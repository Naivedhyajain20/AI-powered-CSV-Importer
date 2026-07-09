import { env } from './src/config/env';
import { PromptBuilderService } from './src/services/ai/prompt-builder.service';
import { GeminiExtractionService } from './src/services/ai/gemini-extraction.service';

async function testGroq() {
  const promptBuilder = new PromptBuilderService();
  const extractionService = new GeminiExtractionService();

  const batch = {
    index: 0,
    startIndex: 0,
    rows: [
      {
        "First Name": "Alice",
        "Last Name": "Green",
        "Email Address": "alice@test.com",
        "Phone": "+15550101",
        "Company": "Green Corp"
      }
    ]
  };

  const mappings = [
    { sourceHeader: "First Name", targetField: "name" },
    { sourceHeader: "Email Address", targetField: "email" },
    { sourceHeader: "Phone", targetField: "mobile_without_country_code" },
    { sourceHeader: "Company", targetField: "company" }
  ];

  const prompt = promptBuilder.buildExtractionPrompt(batch, mappings);
  console.log('Sending prompt to Groq...');
  
  try {
    const rawResult = await extractionService.extract(prompt);
    console.log('--- RAW GROQ RESULT ---');
    console.log(rawResult);
    console.log('-----------------------');
    
    // Test parsing
    let cleanedJson = rawResult.trim();
    const startIdx = cleanedJson.indexOf('[');
    const endIdx = cleanedJson.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
      cleanedJson = cleanedJson.substring(startIdx, endIdx + 1);
    } else if (cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson.replace(/^```(?:json|javascript)?\s*/i, '').replace(/```$/, '').trim();
    }
    
    console.log('--- EXTRACTED JSON STRING ---');
    console.log(cleanedJson);
    console.log('-----------------------------');
    
    const parsed = JSON.parse(cleanedJson);
    console.log('Parsed successfully:', parsed);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

testGroq();
