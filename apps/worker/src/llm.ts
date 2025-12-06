import GeminiClient from "@repo/llm";
import systemPrompt from "./systempPrompt.js";

interface ChatConfig {
    model: string;
    history: Array<{ role: string; content: string }>;
    config: {
        systemInstruction: string;
        temperature?: number;
        maxOutputTokens?: number;
    };
}

type chatHistory = {
    id: number,
    type: string;
    content: string;
    projectId: number;
}


const extractPythonCode = (llmResponse: string): string | null => {

    const code = llmResponse.split("<>")[1]

    if (!code) {
        console.warn('Warning: Extracted code missing "from manim import" statement');

        return null;
    }

    return code;
};

const GetAIResponse = async (videoDescription: string, chatHistory: chatHistory[]): Promise<{
    pythonCode: string | null;
}> => {
    try {


        const history = chatHistory.map((chatItem) => {
            return {
                role: chatItem.type.toString(),
                content: chatItem.content
            }
        })

        if (!history) {
            throw new Error("Error while contructin chat history")
        }

        console.log("history", history)


        const chat = GeminiClient.chats.create({
            model: "gemini-2.5-flash",
            history: history,
            config: {
                temperature: 1.0,
                maxOutputTokens: 8192,
                systemInstruction: systemPrompt,
            },
        } as ChatConfig);

        
        const response = await chat.sendMessage({ "message": videoDescription });
        const rawResponse = response.text;

        if (!rawResponse) {
            throw new Error('Empty response from AI');
        }

        const pythonCode = extractPythonCode(rawResponse);

        if (!pythonCode) {
            console.log(pythonCode, rawResponse)
            throw new Error('Error while parsing AI response');
        }

        return {
            pythonCode
        };

    } catch (error) {
        console.error("Error while generating AI response:", error);
        throw new Error("Unexpected Error while generating AI response");
    }
};

export default GetAIResponse;