const { OpenAI } = require('openai');
async function test() {
  const openai = new OpenAI({
    apiKey: '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',
    baseURL: 'https://integrate.api.nvidia.com/v1'
  });
  console.log("sending request...");
  try {
    const stream = await openai.chat.completions.create({
      model: 'qwen/qwen3.5-397b-a17b',
      messages: [{role: 'user', content: 'hello'}],
      stream: true,
      timeout: 5000 // 5 seconds
    });
    for await (const chunk of stream) {
      console.log(chunk);
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
