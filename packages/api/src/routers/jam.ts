import { Router } from "express";
import {
  newJam,
  getJam,
  newQueueSong,
  voteOnSong,
  joinJam,
} from "../handlers/jam";

export const jam = Router();

jam.get("/:jamId", getJam);

jam.post("/", newJam);
jam.post("/:jamId/join", joinJam);
jam.post("/:jamId/queue/song", newQueueSong);

jam.put("/:jamId/queue/:songId/vote", voteOnSong);
