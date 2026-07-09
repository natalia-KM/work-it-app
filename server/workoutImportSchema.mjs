export const workoutImportJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["sourceName", "summary", "warnings", "workouts"],
  properties: {
    sourceName: { type: "string" },
    summary: { type: ["string", "null"] },
    warnings: {
      type: "array",
      items: { type: "string" }
    },
    workouts: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "notes", "exercises"],
        properties: {
          title: { type: "string" },
          notes: { type: ["string", "null"] },
          exercises: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "title",
                "instructions",
                "notes",
                "isOptional",
                "sortOrder",
                "targetSets",
                "targetReps",
                "targetWeight",
                "logs"
              ],
              properties: {
                title: { type: "string" },
                instructions: { type: ["string", "null"] },
                notes: { type: ["string", "null"] },
                isOptional: { type: "boolean" },
                sortOrder: { type: "integer", minimum: 0 },
                targetSets: { type: ["integer", "null"], minimum: 1 },
                targetReps: { type: ["integer", "null"], minimum: 1 },
                targetWeight: { type: ["number", "null"], minimum: 0 },
                logs: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["date", "sets", "notes"],
                    properties: {
                      date: {
                        type: "string",
                        pattern: "^\\d{4}-\\d{2}-\\d{2}$"
                      },
                      sets: {
                        type: "array",
                        minItems: 1,
                        items: {
                          type: "object",
                          additionalProperties: false,
                          required: ["set", "weight", "reps", "notes"],
                          properties: {
                            set: { type: "integer", minimum: 1 },
                            weight: { type: "number", minimum: 0 },
                            reps: { type: "integer", minimum: 0 },
                            notes: { type: ["string", "null"] }
                          }
                        }
                      },
                      notes: { type: ["string", "null"] }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

