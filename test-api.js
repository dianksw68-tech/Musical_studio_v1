const fetch = require('node-fetch');

async function test() {
  const apiKey = "b09990665477667ef465d2a49f727859";
  const endpoint = "https://api.kie.ai/gpt-5-2/v1/chat/completions";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-5.2",
      messages: [{"role": "user", "content": "hello"}],
      max_tokens: 4096,
      top_p: 0.85,
      temperature: 0.95
    })
  });
  console.log(response.status);
  console.log(await response.text());
}

test();
