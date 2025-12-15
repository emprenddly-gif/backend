import express from "express";
import { getPerfil, updatePerfil, deletePerfil } from "../controllers/perfil.controller.js";

const router = express.Router();

router.get("/:usuario", getPerfil);
router.put("/:usuario", updatePerfil);
router.delete("/:usuario", deletePerfil);

export default router;