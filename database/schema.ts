import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const ExerciseTable = sqliteTable("Exercise", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull().unique(),
    photo: text("photo"),
    isCustom: integer("isCustom").notNull().default(0)
});

export const MuscleTagsTable = sqliteTable("MuscleTags", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    muscleGroup: text("muscleGroup").notNull()
});

export const ExerciseMuscleTagsTable = sqliteTable("Exercise_MuscleTags", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    exerciseId: integer("exerciseId").notNull()
        .references(() => ExerciseTable.id),
    tabId: integer("tabId").notNull()
        .references(() => MuscleTagsTable.id)
});
