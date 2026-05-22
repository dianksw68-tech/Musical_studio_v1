fetch("http://localhost:3000/api/proxy", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    endpoint: "https://api.kie.ai/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer b09990665477667ef465d2a49f727859"
    },
    body: {
      model: "gpt-5.2",
      messages: [{role: "user", content: "hello"}],
      max_tokens: 10,
      top_p: 0.85,
      temperature: 0.95
    }
  })
}).then(r => r.json()).then(console.log).catch(console.error);
