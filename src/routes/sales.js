import express from "express";
import { getProductos, createSale, getVentas, updateVenta } from "../controllers/sale.controller.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// 🔹 Obtener productos
router.get("/productos", getProductos);

// 🔹 Crear nueva venta
router.post("/", upload.single("imagen"), createSale);

// 🔹 Obtener todas las ventas
router.get("/", getVentas);

// 🔹 Actualizar venta por ID
router.put("/sales/:id", updateVenta);

export default router;
