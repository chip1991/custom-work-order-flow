const { OpenAI } = require('openai');
async function test() {
  const openai = new OpenAI({
    apiKey: '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',
    baseURL: 'https://integrate.api.nvidia.com/v1',
    timeout: 3000
  });
  console.log("sending request (non-stream)...");
  try {
    const response = await openai.chat.completions.create({
      model: 'qwen/qwen3.5-397b-a17b',
      messages: [{role: 'user', content: 'hello'}],
      stream: false,
    });
    console.log(response);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
