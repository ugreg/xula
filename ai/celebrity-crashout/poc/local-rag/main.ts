import ollama from 'ollama';

async function getWikiPage(title: string): Promise<string> {
  const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  
  console.log(`Fetching Wikipedia page: ${title}`);
  
  const interval = setInterval(() => {
    console.log("waiting... (still fetching)");
  }, 2000);
  const startTime = Date.now();
  try {
    console.log("Sending request...");
    const response = await fetch(url);
    
    clearInterval(interval);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Response received in ${elapsed}s!`);
    
    const data: string = await response.text();
    
    return data;
  } catch (error) {
    clearInterval(interval);
    console.error("Error:", error);
    throw error;
  }
}

async function askLLM(context: string, question: string, model: string = 'lfm2:24b'): Promise<string> {
  console.log(`\nAsking LLM (${model}): "${question}"`);
  console.log("Thinking");
  
  const thinkingInterval = setInterval(() => {
    process.stdout.write(".");
  }, 1000);
  
  const prompt = `You are a helpful assistant who is an expert in the lives of celebrities. Use the following context to answer the question.
    Context:
    ${context}
    Question: ${question}
    Answer:`;
  
  try {
    const response = await ollama.chat({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      stream: false
    });
    
    clearInterval(thinkingInterval);
    console.log(" Done!");
    
    return response.message.content;
  } catch (error) {
    clearInterval(thinkingInterval);
    throw error;
  }
}

async function main() {
  console.log("In main function...");
  const result = await getWikiPage("Kanye_West");
  const cleanedData = result.replace(/<[^>]+>/g, '').replace(/<!DOCTYPE.*?>/gi, '');
  // const json = JSON.parse(cleanedData);
  // const prettyJson = JSON.stringify(cleanedData, null, 2);
  // const lines = prettyJson.split('\n');
  const numLines = 2005;
  // const firstFewLines = lines.slice(0, numLines);
  console.log(`\n--- Response (truncated to first ${numLines} chars of JSON) ---\n`);
  // console.log(firstFewLines.join('\n'));
  console.log(result.slice(0, numLines));
  console.log("\n--- End of truncated response ---");
  // console.log("\n--- Some of the JSON text from the Wiki ---");
  // console.log(cleanedData.parse.text["*"].toString().substring(0, 550));
  // console.log("\n--- End of JSON text from the Wiki ---");
  
  const question = "What is Kanye West infamous for?";
  // const answer = await askLLM(cleanedData.parse.text["*"].toString(), question);
  const answer = await askLLM(result, question);
  console.log("\n--- LLM Answer ---");
  console.log(answer);
  console.log("\n--- End of LLM Answer ---");
    
}

main().then(() => console.log("Done!")).catch(err => console.error("Failed:", err));
