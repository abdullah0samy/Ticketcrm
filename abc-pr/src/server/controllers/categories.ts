import { Router } from "express";
import { validate } from "../middleware/validate";
import { requireAnyAuthenticated, requireAdmin } from "../middleware/auth";
import { createCategorySchema } from "../schemas";
import { categoryRepo } from "../repositories";
import { asyncHandler } from "../utils/asyncHandler";

export const categoriesRouter = Router();

categoriesRouter.get("/", requireAnyAuthenticated, asyncHandler(async (_req, res) => {
  const categories = await categoryRepo.listAll();
  res.json(categories);
}));

categoriesRouter.post("/", requireAdmin, validate({ body: createCategorySchema }), asyncHandler(async (req, res) => {
  const { nameArabic, nameEnglish } = req.body;
  const existing = await categoryRepo.findByNameEnglish(nameEnglish);
  if (existing) {
    res.status(400).json({ error: "هذه الفئة مسجلة بالفعل بالاسم الإنجليزي المحدد." });
    return;
  }
  const newCategory = await categoryRepo.create(nameEnglish, nameArabic);
  res.status(201).json(newCategory);
}));

categoriesRouter.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id." });
    return;
  }
  const cat = await categoryRepo.findById(id);
  if (!cat) {
    res.status(404).json({ error: "لا توجد فئات لحذفها." });
    return;
  }
  await categoryRepo.deleteById(id);
  res.json({ message: "تم حذف الفئة الإدارية بنجاح." });
}));
