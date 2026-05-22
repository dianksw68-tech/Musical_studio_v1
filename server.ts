import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API proxy route to bypass CORS issues on the client
  app.post("/api/proxy", async (req, res) => {
    try {
      let { endpoint, method, headers, body } = req.body;
      
      if (!endpoint) {
        return res.status(400).json({ error: { message: "Endpoint URL is required" } });
      }

      // Auto-correct common typos
      if (endpoint.includes('kei.ai')) {
        endpoint = endpoint.replace('kei.ai', 'kie.ai');
      }

      console.log(`Proxying request to: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: method || "POST",
        headers: headers || {},
        body: body ? JSON.stringify(body) : undefined
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        let details = responseText;
        try {
          details = JSON.parse(responseText);
        } catch {}
        
        return res.status(response.status).json({
          error: { 
            message: `API Error: ${response.status} ${response.statusText}`, 
            details,
            code: response.status
          }
        });
      }

      try {
        const responseJson = JSON.parse(responseText);
        return res.json(responseJson);
      } catch {
        return res.send(responseText);
      }
    } catch (error: any) {
      console.error("Proxy error:", error);
      const cause = error.cause ? error.cause.message : '';
      res.status(500).json({ error: { message: `fetch failed to ${req.body.endpoint}: ${cause || error.message}` } });
    }
  });

  // Image Generation Endpoint using AI Studio SDK
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, apiKey: requestApiKey } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: { message: "Prompt is required" } });
      }

      const apiKey = requestApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: { message: "Server doesn't have GEMINI_API_KEY configured and no manual key provided." } });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      console.log(`Generating image for prompt: ${prompt.substring(0, 100)}...`);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            { text: prompt },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          }
        }
      });

      let imageUrl = "";
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mimeType};base64,${base64EncodeString}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        return res.status(500).json({ error: { message: "AI didn't return an image part" } });
      }

      return res.json({ imageUrl });

    } catch (error: any) {
      console.error("Generate image error:", error);
      return res.status(500).json({ 
        error: { 
          message: error.message || "Failed to generate image" 
        } 
      });
    }
  });

  // AI Studio Key Validation Endpoint
  app.post("/api/validate-aistudio-key", async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey) return res.status(400).json({ error: { message: "API Key is required" } });
      
      const ai = new GoogleGenAI({ apiKey });
      await ai.models.get({ model: "gemini-2.5-flash" });
      
      return res.json({ valid: true });
    } catch (error: any) {
      console.error("AI Studio Key Validation Error:", error);
      return res.status(500).json({ error: { message: error.message || "Invalid API Key" } });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
