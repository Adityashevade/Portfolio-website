¹import axios from "axios";

export const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});
¹*cascade0824file:///C:/SCOUTNEW/scout_db/frontend/src/lib/api.ts