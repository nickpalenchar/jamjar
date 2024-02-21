import { Router } from "express";
import {
  newJam,
  refreshOwnVibes,
  newQueueSong,
  voteOnSong,
  joinJam,
  getJamByPhrase,
  getJam,
  startJam
} from "../handlers/jam";

export const jam = Router();

jam.get("/phrase/:phrase", getJamByPhrase);
jam.get("/:jamId", getJam);
jam.post("/:jamId/refreshOwnVibes", refreshOwnVibes);
jam.post('/:jamId/start', startJam)

jam.post("/", newJam);
jam.post("/:jamId/join", joinJam);
jam.post("/:jamId/queue/song", newQueueSong);

jam.put("/:jamId/queue/:songId/vote", voteOnSong);
