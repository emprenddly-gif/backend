import { Router } from "express";
import db from "../config/db.js";

const router = Router();

// GET todos los gastos
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Registro_Gastos ORDER BY Fecha DESC, Id_Gasto DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error en GET /registrogastos:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST registrar gasto
router.post("/", async (req, res) => {
  try {
    const { valor, tipo_gasto, fecha } = req.body;

    if (!valor || !tipo_gasto) {
      return res.status(400).json({
        error: "Faltan datos obligatorios: valor o tipo_gasto"
      });
    }

    let nombreCategoria;
    if (tipo_gasto === "produccion") nombreCategoria = "Producción";
    else if (tipo_gasto === "logisticos") nombreCategoria = "Logística";
    else nombreCategoria = tipo_gasto;

    const fechaFinal = fecha
      ? fecha
      : new Date().toISOString().split("T")[0];

    const [result] = await db.query(
      `INSERT INTO Registro_Gastos 
       (Categoria, Fecha, Monto, Id_Venta)
       VALUES (?, ?, ?, NULL)`,
      [nombreCategoria, fechaFinal, valor]
    );

    res.status(201).json({
      message: "✅ Gasto registrado correctamente",
      gastoId: result.insertId
    });

  } catch (error) {
    console.error("❌ Error en POST /registrogastos:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
