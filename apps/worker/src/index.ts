import express from "express"
import cors from "cors"
import "dotenv/config"
import { prismaClient } from "@repo/db"
import GeminiClient from "@repo/llm"
import GetAIResponse from "./llm.js"
import createVideo from "./video.js"

const app = express();
app.use(express.json())
app.use(cors())


app.get("/health-check", async (req, res) => {
    res.send("hello world")

})


app.post("/project", async (req, res) => {
    try {
        const { firstPrompt } = req.body;
        // add zod validation may be
        if (!firstPrompt) {
            res.status(401).json({ "message": "Prompt is missing!" })
            return;
        }
        //get project name from llm
        const response = await GeminiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Give a short title from the text "${firstPrompt} , title length should be less than 30 characters , in the response give the title directly without any extra things , title should be descriptive about the text given"`
        })

        const title = response.text;

        if (!title) {
            res.status(500).json({ "message": "Error while generating title!" })
            return;
        }

        const project = await prismaClient.project.create({
            data: {
                userId: 1,
                name: title
            }
        })

        res.status(201).json({ "title": project.name })
    } catch (error) {
        console.log("error in /project route", error)
        res.status(500).json({ "message": "unexpected error!" })
    }
})




app.post("/video", async (req, res) => {


    try {
        const { projectId, prompt } = req.body;

        const chatHistory = await prismaClient.prompt.findMany({
            where: {
                projectId: projectId
            },
            orderBy: {
                createdAt: "asc"
            }

        })

        const aiResponse = await GetAIResponse(prompt, chatHistory)

        if (!aiResponse || !aiResponse.pythonCode) {
            res.status(404).json({ "message": "Error while generating AI response" })
            return;
        }

        // store ai response in the db

        const x = await prismaClient.prompt.createMany({
            data: [
                {
                    projectId: projectId,
                    type: "user",
                    content: prompt,
                },
                {
                    projectId: projectId,
                    type: "model",
                    content: aiResponse.pythonCode as string,
                }
            ]
        })

        if (!x || !x.count) {
            res.status(500).json({ "message": "Error while storing data" })
            return;
        }

        const videoData = await createVideo(aiResponse.pythonCode);

        res.json(videoData);
    } catch (error) {
        console.log("error in /video route", error)
        res.status(500).json({ "message": "unexpected error!" })
    }
})


const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})