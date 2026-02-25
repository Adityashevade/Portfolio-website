¤import axios from "axios";

export const api = axios.create({
    baseURL: "/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});
¤ *cascade0824file:///c:/SCOUTNEW/scout_db/frontend/src/lib/api.ts