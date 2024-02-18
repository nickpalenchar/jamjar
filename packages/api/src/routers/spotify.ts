import { Router } from "express";
import { search, authorize } from "../handlers/spotify";

export const spotify = Router();

spotify.get("/search", search);

spotify.get("/authorize", authorize);
