import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// 🔹 Obtener reporte de ventas COMPLETO
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.Id_Reporte,
        p.Nombre AS Producto,
        p.Precio,
        rv.Cantidad,
        rv.Fecha AS Fecha_Venta,
        mp.Nombre AS Metodo_Pago
      FROM Reporte_ventas r
      INNER JOIN Registro_Ventas rv ON r.Id_Venta = rv.Id_Venta
      INNER JOIN Productos p ON rv.Id_Productos = p.Id_Productos
      INNER JOIN Metodo_Pago mp ON rv.Id_Metodo = mp.Id_Metodo
      ORDER BY rv.Fecha DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo reporte de ventas" });
  }
});


export default router;
