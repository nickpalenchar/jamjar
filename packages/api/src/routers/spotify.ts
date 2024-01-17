import { Router } from "express";
import { search } from "../handlers/spotify";

export const spotify = Router();

spotify.get("/search", search);
