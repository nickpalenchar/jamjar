/**
 * Routes with actions only allowed by the owner of a Jam
 */
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { getSpotifyPlayState } from "../handlers/getSpotifyPlayState";

const prisma = new PrismaClient();

export const jamOwnerRouter = Router();

jamOwnerRouter.use(async (req, res, next) => {});

jamOwnerRouter.get("/player/spotify", getSpotifyPlayState);
