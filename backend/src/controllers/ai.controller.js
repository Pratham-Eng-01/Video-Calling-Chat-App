import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getSmartReply(req, res) {
  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not configured" });
    }

    const modelName = "gemini-3-flash-preview";
    const model = genAI.getGenerativeModel({ model: modelName });

    console,console.log('====================================');
    console.log(message);
    console.log('====================================');

   const prompt = `
You are a warm, emotionally intelligent chat assistant.

Your task:
Generate the best possible reply to the user's last message.in 10 to 15 lines

User message:
"${message}"
`;


    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 120 },
    });
    

    const reply = response.response?.text?.()?.trim?.() || response.text?.()?.trim?.() || "";

    console.log(reply);
    
    if (!reply) {
      return res.status(500).json({ message: "Empty response from Gemini. Try again." });
    }
    return res.status(200).json({ reply });
  } catch (error) {
    const status = error?.status || error?.response?.status;
    const details = error?.message;

    if (status === 401 || status === 403) {
      return res.status(401).json({ message: "Gemini authentication failed. Check GEMINI_API_KEY." });
    }

    if (status === 429) {
      return res.status(429).json({ message: "Gemini rate limit or quota exceeded." });
    }

    if (status === 400) {
      return res.status(400).json({ message: details || "Gemini request failed." });
    }

    console.error("Error in getSmartReply controller", details || error.message);
    if (details?.includes("404") || details?.includes("not found")) {
      return res.status(400).json({
        message:
          "No compatible Gemini model found. Set GEMINI_MODEL in .env to a supported model (e.g., gemini-1.5-flash).",
      });
    }
    return res.status(500).json({ message: "Internal Server Error" });

  }
}

export async function generateAvatar(req, res) {
  try {
    const { fullName } = req.body || {};

    if (!fullName || typeof fullName !== "string") {
      return res.status(400).json({ message: "Full name is required" });
    }

    const styles = ["avataaars", "pixel-art", "lorelei,", "micah", "adventurer", "bottts", "croodles", "identicon", "initials"];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const seed = fullName.replace(/\s+/g, "-").toLowerCase() + "-" + Date.now();
    const avatarUrl = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}`;

    return res.status(200).json({ avatarUrl });
  } catch (error) {
    const details = error?.message;

    if (error?.status === 401 || error?.status === 403) {
      return res.status(401).json({ message: "Gemini authentication failed. Check GEMINI_API_KEY." });
    }

    if (error?.status === 429) {
      return res.status(429).json({ message: "Gemini rate limit exceeded." });
    }

    console.error("Error in generateAvatar controller", details || error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
