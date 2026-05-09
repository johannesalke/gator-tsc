import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config.js"

export default defineConfig({
    schema: "src/db",
    out: "src/db/generated",
    dialect: "postgresql",
    dbCredentials: {
        url: readConfig().dbUrl,
    },
});

