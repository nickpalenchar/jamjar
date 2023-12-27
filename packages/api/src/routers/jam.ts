import { Router } from "express";
import { newJam, getJamQueue, newQueueSong, voteOnSong } from "../handlers/jam";

export const jam = Router();

jam.get("/:jamId/queue", getJamQueue);

jam.post("/", newJam);
jam.put("/:jamId/queue/:songId/vote", voteOnSong);
jam.post("/:jamId/queue/song", newQueueSong);
