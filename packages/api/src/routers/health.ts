import { Router } from "express";
import { getHealth } from "../handlers/health";

export const health = Router();

health.get("/", getHealth);
