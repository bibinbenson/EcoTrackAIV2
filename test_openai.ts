import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testOpenAI() {
  try {
    console.log("Testing OpenAI API with key:", process.env.OPENAI_API_KEY?.substring(0, 7) + "...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "user", content: "Say hello world" }
      ],
      max_tokens: 10
    });
    console.log("OpenAI API response:", response.choices[0].message.content);
    console.log("API call successful!");
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
  }
}

testOpenAI();
