import { AppInputs, AppOutputs } from "../types";

const SYSTEM_INSTRUCTION = `
Kamu adalah AI asisten produksi musik dan pakar SEO YouTube tahun 2026. Tugasmu adalah memproses input dari pengguna dan menghasilkan 4 output spesifik dengan format yang sudah ditentukan.

PENTING: Perhatikan "Target Audience" yang dipilih pengguna (Indonesia atau Global).
- Jika Target Audience = "Indonesia": Gunakan bahasa Indonesia untuk lirik, SEO, dan instruksi teks. Karakter visual adalah wanita Indonesia berhijab elegan (kecuali jika ada foto referensi).
- Jika Target Audience = "Global": Gunakan bahasa Inggris (atau campuran Korea-Inggris jika vibe mengarah ke K-Pop) untuk lirik. SEO harus dalam bahasa Inggris. Karakter visual harus menyesuaikan standar global (misal: K-Pop Idol look untuk Korea, atau Western Pop Star untuk USA).

BAGIAN 1: LOGIKA OUTPUT (HASIL GENERATE)
Aplikasi harus mengeluarkan 4 bagian berikut secara berurutan:

Output 1: Lirik Lagu untuk Suno.com
Aturan: Buat lirik berdasarkan "Judul Lagu" dan "Tema Cerita". Gaya bahasa dan diksi harus 100% menyesuaikan "Vibe Penyanyi", "Target Audience", dan "Bahasa Lirik" yang dipilih.
WAJIB: Masukkan tag tempo [BPM: XXX] (sesuai nilai BPM yang di-input) di bagian paling atas lirik sebelum tag lainnya.
Format: Suno.com Style. Wajib gunakan meta-tags struktur lagu dalam kurung siku [] untuk memisahkan setiap bagian lagu secara jelas, contoh: [Verse 1], [Verse 2], [Pre-Chorus], [Chorus], dan [Bridge]. Letakkan tag di baris tersendiri sebelum bait liriknya.
PENTING: Jika "Bahasa Lirik" mengandung kata "Mix", buatlah lirik yang menggabungkan bahasa-bahasa yang disebutkan di dalam kurung secara kreatif (misal: Verse 1 menggunakan bahasa pertama, Chorus menggunakan bahasa kedua, dst). Pastikan transisi antar bahasa terasa halus dan puitis.
TIDINESS RULES:
1. JANGAN gunakan format Markdown (bold/italic).
2. Kelompokkan meta-tag intro/tempo di awal tanpa baris kosong di antaranya.
3. Berikan SATU baris kosong antara meta-tag dan lirik di bawahnya.
4. Berikan SATU baris kosong antara bait (verse/chorus).
5. Pastikan lirik rapi, rata kiri, dan siap di-copy.
6. WAJIB: Tulis lirik baris demi baris. JANGAN menyambung kalimat lirik dalam satu baris panjang. Setiap baris harus dipisahkan oleh 'Enter' (newline).

Output 2: Style Prompt untuk Suno.com
Aturan: Buat 3 variasi deskripsi genre musik yang berbeda namun tetap sesuai dengan "Vibe Penyanyi". Masing-masing sepanjang 1-2 kalimat (maksimal 120 karakter) dalam bahasa Inggris.
WAJIB: Masukkan nilai BPM yang diberikan pengguna (misal: "120bpm") ke dalam setiap variasi style prompt.
Variasi 1: Gaya standar/populer.
Variasi 2: Gaya yang lebih eksperimental atau akustik.
Variasi 3: Gaya yang lebih intens atau sinematik.
Contoh: "1990s indonesian slow rock, melancholic power ballad, emotional female vocals, heavy rock drums, crying guitar solo."

Output 3: Prompt AI Image Generator (Thumbnail YouTube)
Aturan: Buat prompt gambar dalam bahasa Inggris tingkat lanjut (fotorealistik, sinematik) yang menggabungkan karakter visual (sesuai Target Audience) dengan "Latar Tempat Thumbnail" yang di-input.
Aturan Tambahan Teks Overlay: Wajib masukkan instruksi pembuatan teks (Typography) ala cover VCD Karaoke (untuk Indo) atau Modern Digital Single (untuk Global) ke dalam prompt gambar persis seperti template ini (ganti bagian dalam kurung siku dengan data dinamis):
"The image features specific text overlays mimicking a [TEMA COVER]: Top Left corner: small black text 'Official Music Video'. Middle Right (Large Title): The text '[JUDUL LAGU]' written in a large, white, artistic brush-script font with a rough grunge texture. Above the title: small white text '[GENRE DARI VIBE] 2026'. Below the title: Bright Yellow bold serif text saying '[NAMA CHANNEL]'. Bottom Left: big white text '[2 BARIS KUTIPAN LIRIK PALING SEDIH DARI LAGU] 💔'."

Output 4: Metadata SEO YouTube 2026
Buatkan metadata SEO yang dioptimalkan untuk algoritma YouTube tahun 2026 (Bahasa sesuai Target Audience) dengan format berikut:
Judul Video: Berikan 3 pilihan judul yang mengundang klik (mengandung judul lagu, kata kunci emosi/galau, dan "[NAMA CHANNEL]").
Deskripsi Video: Buat paragraf pembuka yang emosional. Sisipkan lirik lengkap lagu. Wajib sertakan kalimat Call to Action: "Support terus channel [NAMA CHANNEL] dengan klik Like, Share, dan Subscribe!" (atau versi Inggris untuk Global).
Tags: Berikan 20 kata kunci relevan (dipisah koma), termasuk "[NAMA CHANNEL], lagu galau terbaru 2026, [Vibe Penyanyi]".
Pin Komen (Video MV): Buat 1 komentar pancingan interaktif untuk disematkan.
Metadata YouTube Shorts: Berikan saran Judul Shorts, Tags Shorts, dan deskripsi singkat yang mengarahkan penonton untuk menonton video panjang di [NAMA CHANNEL].

Output 5: Visual Assets (Text-to-Image & Image-to-Video)
Aturan: Buat 8 adegan (scenes) yang mewakili alur cerita lagu berdasarkan lirik.
Setiap adegan harus memiliki:
1. Lyrics Snippet: Potongan lirik yang mendasari adegan tersebut.
2. Image Prompt: Prompt bahasa Inggris untuk AI Image Generator. WAJIB memasukkan deskripsi karakter dan latar tempat yang sudah ditentukan ke dalam setiap prompt adegan agar konsisten. Fokus pada komposisi sinematik, lighting, dan emosi.
3. Video Prompts: 2 pilihan prompt bahasa Inggris untuk Image-to-Video (motion prompts). Contoh: "Slow zoom into her eyes as she tears up", "Cinematic camera pan showing the vast empty beach".

PENTING: Berikan output dalam format JSON yang valid dengan key: "lyrics", "stylePrompts", "basePrompt", "imagePrompt", "characterDescription", "textOverlayInstructions", "seoMetadata", "visualAssets".
- "lyrics": Lirik lagu lengkap.
- "translation": Terjemahan LENGKAP lirik lagu ke dalam Bahasa Indonesia. WAJIB menerjemahkan seluruh lirik baris demi baris secara akurat. Jika lirik asli sudah Bahasa Indonesia, tuliskan kembali lirik tersebut baris demi baris.
- "stylePrompts": Array berisi 3 string variasi style.
- "basePrompt": Prompt gambar TANPA instruksi teks overlay (hanya deskripsi visual karakter dan latar).
- "imagePrompt": Prompt gambar LENGKAP dengan instruksi teks overlay.
- "characterDescription": Deskripsi visual karakter yang konsisten.
- "textOverlayInstructions": HANYA instruksi teks overlay (Typography) tersebut.
- "seoMetadata": Object berisi:
    - "titles": Array 3 string judul video.
    - "description": String deskripsi video (termasuk lirik).
    - "tags": String kata kunci dipisah koma.
    - "pinnedComment": String komentar pancingan.
    - "shorts": Object berisi "title", "description", "tags" untuk YouTube Shorts.
- "visualAssets": Object berisi "scenes" (Array 8 object dengan key: "id", "lyricsSnippet", "imagePrompt", "videoPrompts").
`;

const getApiKeysList = (): string[] => {
  let keysStr = '';
  if (typeof window !== 'undefined') {
    keysStr = localStorage.getItem('gemini_api_key') || '';
  }
  if (!keysStr) keysStr = process.env.GEMINI_API_KEY || '';
  
  return keysStr.split(/[\n, ]+/).map(k => k.trim()).filter(k => k.length > 0);
};

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    let localBaseUrl = localStorage.getItem('gemini_base_url');
    if (localBaseUrl) {
      localBaseUrl = localBaseUrl.trim();
      if (!localBaseUrl.startsWith('http://') && !localBaseUrl.startsWith('https://')) {
        localBaseUrl = 'https://' + localBaseUrl;
      }
      if (localBaseUrl.endsWith('/')) localBaseUrl = localBaseUrl.slice(0, -1);
      if (localBaseUrl.endsWith('/v1beta')) localBaseUrl = localBaseUrl.slice(0, -7);
      else if (localBaseUrl.endsWith('/v1alpha')) localBaseUrl = localBaseUrl.slice(0, -8);
      else if (localBaseUrl.endsWith('/v1')) localBaseUrl = localBaseUrl.slice(0, -3);
      
      if (localBaseUrl.includes('kei.ai')) {
        localBaseUrl = localBaseUrl.replace('kei.ai', 'kie.ai');
      }
      return localBaseUrl;
    }
  }
  return 'https://api.kie.ai';
};

const getKieSettings = () => {
  if (typeof window !== 'undefined') {
    return {
      model: localStorage.getItem('kie_model') || 'gpt-5.2',
      maxTokens: parseInt(localStorage.getItem('kie_max_tokens') || '4096', 10),
      topP: parseFloat(localStorage.getItem('kie_top_p') || '0.85'),
      temperature: parseFloat(localStorage.getItem('kie_temperature') || '0.95'),
    };
  }
  return { model: 'gpt-5.2', maxTokens: 4096, topP: 0.85, temperature: 0.95 };
};

const executeWithKeyRotation = async <T>(operation: (apiKey: string, baseUrl: string) => Promise<T>): Promise<T> => {
  let keys = getApiKeysList();
  if (keys.length === 0) throw new Error("API Key tidak ditemukan.");
  
  const baseUrl = getBaseUrl();
  let lastError: any;
  
  while (keys.length > 0) {
    const apiKey = keys[0];
    
    try {
      return await operation(apiKey, baseUrl);
    } catch (error: any) {
      lastError = error;
      console.warn(`API call failed with key ${apiKey.substring(0, 4)}... Error: ${error.message}`);
      
      const errMsg = error?.message?.toLowerCase() || '';
      const status = error?.status;
      
      // Remove key if it's quota limit, unauthorized, or generic failure that implies bad key
      if (status === 429 || status === 401 || status === 403 || status === 400 || errMsg.includes('quota') || errMsg.includes('exhausted') || errMsg.includes('invalid') || errMsg.includes('unauthorized') || errMsg.includes('not found')) {
        console.log("Removing failed/depleted API key and trying next...");
        keys.shift(); // Remove the current key from the array
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('gemini_api_key', keys.join('\n'));
          window.dispatchEvent(new CustomEvent('gemini_keys_updated', { detail: keys.join('\n') }));
        }
      } else {
        // Other errors (e.g., abort, timeout, safety block)
        throw error;
      }
    }
  }
  
  throw lastError;
};

const fetchOpenAI = async (
  apiKey: string,
  baseUrl: string,
  messages: Array<{role: string, content: any}>,
  systemInstruction?: string,
  responseFormat?: any
) => {
  const settings = getKieSettings();
  
  let endpoint = `${baseUrl}/v1/chat/completions`;
  if (baseUrl.includes('kie.ai') || baseUrl.includes('kei.ai')) {
    const urlModel = settings.model.replace(/\./g, '-');
    const fixedBaseUrl = baseUrl.replace('kei.ai', 'kie.ai');
    endpoint = `${fixedBaseUrl}/${urlModel}/v1/chat/completions`;
  }

  const payloadMessages = [];
  if (systemInstruction) {
    payloadMessages.push({ role: "system", content: systemInstruction });
  }
  payloadMessages.push(...messages);

  const payload: any = {
    model: settings.model,
    messages: payloadMessages,
    max_tokens: settings.maxTokens,
    top_p: settings.topP,
    temperature: settings.temperature,
  };

  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  const response = await fetch('/api/proxy', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      endpoint,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: payload
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    let finalMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const parsed = JSON.parse(errText);
      finalMessage = parsed.error?.message || parsed.msg || finalMessage;
      if (parsed.error?.details && typeof parsed.error.details === 'string') {
        try {
          const nestedParsed = JSON.parse(parsed.error.details);
          if (nestedParsed.error?.message) {
            finalMessage = nestedParsed.error.message;
          } else if (nestedParsed.detail) {
            finalMessage = typeof nestedParsed.detail === 'string' ? nestedParsed.detail : JSON.stringify(nestedParsed.detail);
          }
        } catch {}
      }
    } catch {}
    
    const error: any = new Error(finalMessage);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }
  
  if (data.code && data.msg) {
    throw new Error(data.msg);
  }
  
  if (data.detail) {
    throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
  }

  if (data.message && !data.choices) {
    throw new Error(data.message);
  }
  
  if (!data.choices || !data.choices[0]) {
    console.error("Unexpected response format:", data);
    throw new Error("Format respons tidak valid dari API. Rincian: " + JSON.stringify(data).substring(0, 100));
  }
  
  return data.choices[0].message.content;
};

export async function validateApiKey(apiKeyInput: string): Promise<boolean> {
  const keys = apiKeyInput.split(/[\n, ]+/).map(k => k.trim()).filter(k => k.length > 0);
  if (keys.length === 0) return false;
  
  const baseUrl = getBaseUrl();
  let lastError: any;
  
  for (const apiKey of keys) {
    try {
      await fetchOpenAI(apiKey, baseUrl, [{ role: "user", content: "hello" }]);
      return true; // At least one valid key
    } catch (error) {
      console.warn(`Validation failed for key ${apiKey.substring(0, 4)}...`, error);
      lastError = error;
    }
  }
  
  if (lastError) throw lastError;
  return false;
}

export async function validateAistudioKey(apiKey: string): Promise<boolean> {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) return false;
  
  const response = await fetch('/api/validate-aistudio-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: trimmedKey })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to validate AI Studio API Key.");
  }
  
  return true;
}

export async function describeImage(imageData: string): Promise<string> {
  return executeWithKeyRotation(async (apiKey, baseUrl) => {
    return await fetchOpenAI(
      apiKey, 
      baseUrl, 
      [{ 
        role: "user", 
        content: [
          { type: "text", text: "Describe this image in detail for an AI image generator prompt. Focus on the person's appearance, clothing, pose, and the background environment. Keep it concise (1-2 sentences)." },
          { type: "image_url", image_url: { url: imageData } }
        ] 
      }]
    );
  });
}

export async function remixLyricSnippet(snippet: string, instruction: string): Promise<string> {
  return executeWithKeyRotation(async (apiKey, baseUrl) => {
    const prompt = `
Kamu adalah penulis lirik profesional. Tolong ubah/remix potongan lirik berikut sesuai dengan instruksi: "${instruction}".
Hanya berikan respons berupa lirik yang sudah diubah tanpa teks pengantar, penjelasan, tanda kutip, atau penanda markdown tambahan (kecuali tag bait seperti [Chorus]).

Lirik asli:
${snippet}
`;
    return await fetchOpenAI(apiKey, baseUrl, [{ role: "user", content: prompt }]);
  });
}

export async function enhanceLyricsWithTags(lyrics: string, style: string): Promise<string> {
  return executeWithKeyRotation(async (apiKey, baseUrl) => {
    const prompt = `
Kamu adalah pakar AI musik untuk platform Suno.com. Tugasmu adalah menyisipkan meta-tag khusus Suno.com (structure tags & style tags) ke dalam lirik ini agar hasil lagu saat di-generate lebih hidup, berdimensi, dan sesuai dengan vibe.

Vibe / Style lagu: "${style}"

Instruksi PENTING:
1. Sisipkan metatag dalam kurung siku [], contoh: [Intro], [Guitar Solo], [Emotional Chorus], [Build-up], [Drop], [Sad Bridge], [Fade Out], [Outro].
2. Letakkan metatag ini di bagian yang strategis (misal di intro, setelah chorus, sebelum bridge, atau outro).
3. Sesuaikan pilihan kata di dalam metatag dengan Vibe lagu tersebut (jika sedih gunakan tag melankolis/instrumental sedih, jika upbeat gunakan tag enerjik).
4. JANGAN MAUPUN MENGUBAH teks lirik asli. HANYA tambahkan tag-tag baru.
5. Tuliskan lirik yang sudah di-enhance tanpa embel-embel teks pengantar.

Lirik asli:
${lyrics}
`;
    return await fetchOpenAI(apiKey, baseUrl, [{ role: "user", content: prompt }]);
  });
}

export async function generateThumbnailImage(prompt: string, characterImage?: string, apiKey?: string): Promise<string> {
  // Use our server-side API endpoint that uses Google AI Studio's image generator
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, apiKey })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to generate thumbnail image");
  }

  const data = await response.json();
  return data.imageUrl;
}

export async function generateStudioAssets(inputs: AppInputs): Promise<AppOutputs> {
  return executeWithKeyRotation(async (apiKey, baseUrl) => {
    const prompt = `
      Nama Channel: ${inputs.channelName}
      Judul Lagu: ${inputs.songTitle}
      Tema Cerita: ${inputs.storyTheme}
      Vibe Penyanyi: ${inputs.vibe}
      Latar Tempat Thumbnail: ${inputs.thumbnailLocation}
      Deskripsi Karakter: ${inputs.characterDescription || 'Sesuai target audience'}
      Target Audience: ${inputs.targetAudience}
      Bahasa Lirik: ${inputs.lyricsLanguage}
      BPM (Tempo): ${inputs.bpm}
    `;

    const responseText = await fetchOpenAI(
      apiKey,
      baseUrl,
      [{ role: "user", content: prompt }],
      SYSTEM_INSTRUCTION,
      { type: "json_object" }
    );

    let result;
    try {
      const text = responseText || '{}';
      const jsonString = text.replace(/```json\n?|```/g, '').trim();
      result = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", e);
      const match = responseText?.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          result = JSON.parse(match[0]);
        } catch (e2) {
          throw new Error("Gagal memproses format data dari AI. Silakan coba lagi.");
        }
      } else {
        throw new Error("AI tidak memberikan format data yang sesuai.");
      }
    }
    
    const ensureString = (val: any): string => {
      if (typeof val === 'string') return val;
      if (val === null || val === undefined) return '';
      return JSON.stringify(val, null, 2);
    };

    const ensureStringArray = (val: any): string[] => {
      if (Array.isArray(val)) return val.map(v => ensureString(v));
      if (typeof val === 'string') return [val];
      return [];
    };

    // Post-process lyrics to ensure [Tag] is followed by a newline and clean for Suno
    let lyrics = ensureString(result.lyrics);
    if (lyrics) {
      lyrics = lyrics.replace(/\r\n/g, '\n');
      lyrics = lyrics.replace(/(\[[^\]]+\])\s*(?=\[)/g, '$1\n'); 
      lyrics = lyrics.replace(/(\[[^\]]+\])\s*(?![\[\s])/g, '$1\n\n'); 
      lyrics = lyrics.replace(/\n{3,}/g, '\n\n');
      lyrics = lyrics.trim();
    }

    const seo = result.seoMetadata || {};

    return {
      lyrics: lyrics,
      translation: ensureString(result.translation),
      stylePrompts: ensureStringArray(result.stylePrompts),
      imagePrompt: ensureString(result.imagePrompt),
      characterDescription: ensureString(result.characterDescription || inputs.characterDescription),
      textOverlayInstructions: ensureString(result.textOverlayInstructions),
      basePrompt: ensureString(result.basePrompt),
      seoMetadata: {
        titles: ensureStringArray(seo.titles),
        description: ensureString(seo.description),
        tags: ensureString(seo.tags),
        pinnedComment: ensureString(seo.pinnedComment),
        shorts: {
          title: ensureString(seo.shorts?.title),
          description: ensureString(seo.shorts?.description),
          tags: ensureString(seo.shorts?.tags),
        }
      },
      visualAssets: {
        scenes: (result.visualAssets?.scenes || []).map((s: any) => ({
          id: ensureString(s.id),
          lyricsSnippet: ensureString(s.lyricsSnippet),
          imagePrompt: ensureString(s.imagePrompt),
          videoPrompts: ensureStringArray(s.videoPrompts),
        }))
      }
    };
  });
}
