import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const ExerciseTable = sqliteTable("Exercise", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    photo: text("photo"),
    isCustom: integer("isCustom").notNull().default(0)
});

export const TabsTable = sqliteTable("Tabs", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull()
});

export const ExerciseTabsTable = sqliteTable("Exercise_Tabs", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    exerciseId: integer("exerciseId").notNull()
        .references(() => ExerciseTable.id),
    tabId: integer("tabId").notNull()
        .references(() => TabsTable.id)
});
