import { Router } from "express";
import { newJam } from "../handlers/jam/newJam";

export const jam = Router();

jam.post("/", newJam);
