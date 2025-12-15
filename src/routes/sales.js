import express from "express";
import { getProductos, createSale, getVentas, updateVenta } from "../controllers/sale.controller.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Rutas
router.get("/productos", getProductos);
router.post("/", upload.single("imagen"), createSale);
router.get("/", getVentas);
router.put("/sales/:id", updateVenta);

// Exportar router como default
export default router;
