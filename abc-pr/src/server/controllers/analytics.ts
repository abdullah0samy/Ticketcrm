import { Router } from "express";
import { validate } from "../middleware/validate";
import { requireAnyAuthenticated } from "../middleware/auth";
import { analyticsQuerySchema } from "../schemas";
import { surveyRepo } from "../repositories";
import { asyncHandler } from "../utils/asyncHandler";

export const analyticsRouter = Router();

analyticsRouter.get("/", requireAnyAuthenticated, validate({ query: analyticsQuerySchema }), asyncHandler(async (req, res) => {
  const { clinicType, startDate, endDate } = req.query as unknown as {
    clinicType?: string;
    startDate?: string;
    endDate?: string;
  };

  const payload = await surveyRepo.analytics({ clinicType, startDate, endDate });
  res.json(payload);
}));
