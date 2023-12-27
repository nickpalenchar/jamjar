import { Router } from "express";
import { newJam, getJamQueue, newQueueSong } from "../handlers/jam";

export const jam = Router();

jam.post("/", newJam);
jam.get("/:jamId/queue", getJamQueue);
jam.post("/:jamId/queue/song", newQueueSong);
