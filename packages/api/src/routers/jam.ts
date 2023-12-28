import { Router } from "express";
import {
  newJam,
  getJamQueue,
  newQueueSong,
  voteOnSong,
  joinJam,
} from "../handlers/jam";

export const jam = Router();

jam.get("/:jamId/queue", getJamQueue);

jam.post("/", newJam);
jam.post("/:jamId/join", joinJam);
jam.post("/:jamId/queue/song", newQueueSong);

jam.put("/:jamId/queue/:songId/vote", voteOnSong);
