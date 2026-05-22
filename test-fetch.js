fetch("https://api.kie.ai/v1/chat/completions")
  .then(res => console.log(res.status))
  .catch(err => console.error("Error:", err.message, err.cause));
