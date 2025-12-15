import { Router } from "express";
import {
  getReportes,
  getReporteById
} from "../controllers/reporteventas.controller.js";

const router = Router();

/* =====================================================
   🔹 OBTENER TODOS LOS REPORTES
   GET /reportes
===================================================== */
router.get("/", getReportes);

/* =====================================================
   🔹 OBTENER REPORTE POR ID
   GET /reportes/:id
===================================================== */
router.get("/:id", getReporteById);

export default router;
