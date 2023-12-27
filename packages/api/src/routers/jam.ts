import { Router } from "express";
import { newJam, newQueueSong } from "../handlers/jam";

export const jam = Router();

jam.post("/", newJam);
jam.post("/:jamId/queue/song", newQueueSong);
