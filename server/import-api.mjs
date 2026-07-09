import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { workoutImportJsonSchema } from "./workoutImportSchema.mjs";

const app = express();
const port = Number(process.env.IMPORT_API_PORT ?? 8787);
const model = process.env.OPENAI_MODEL ?? "gpt-5.6-terra";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/import-workout-notes", async (req, res) => {
  const { sourceName, text } = req.body ?? {};

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).send("OPENAI_API_KEY is not configured on the import API.");
    return;
  }

  if (typeof sourceName !== "string" || sourceName.trim().length === 0) {
    res.status(400).send("sourceName is required.");
    return;
  }

  if (typeof text !== "string" || text.trim().length < 20) {
    res.status(400).send("Workout note text is too short to import.");
    return;
  }

  try {
    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "Parse messy gym notes into clean workout tracker data.",
                "Keep only useful cleaned data; do not preserve profanity, filler, or irrelevant comments.",
                "Exercise headings are usually followed by setup cues, then dated log lines.",
                "Dates in the source are usually DD/MM. Infer the year from the filename: Archive files are mostly 2025, non-archive files are mostly 2026.",
                "If a non-archive file contains late months such as September, October, November, or December before early-year entries, infer those late-month dates as 2025.",
                "Use ISO date strings in YYYY-MM-DD format.",
                "Convert shorthand like '66x12 x3' into three sets when the meaning is clear.",
                "For weight-only triplets near an exercise target like '12x3', infer reps from the target.",
                "If reps or weights are ambiguous, keep the row only when a reasonable value is clear and add a warning.",
                "Todos/checklists should drive required vs optional exercises. '(opt)' means optional.",
                "Use concise, practical exercise instructions and notes."
              ].join(" ")
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                sourceName,
                text
              })
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "workout_notes_import",
          strict: true,
          schema: workoutImportJsonSchema
        }
      }
    });

    const parsed = JSON.parse(response.output_text);
    res.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown import failure.";
    res.status(500).send(`Could not parse workout notes: ${message}`);
  }
});

app.listen(port, () => {
  console.log(`Workout import API listening on http://localhost:${port}`);
});

