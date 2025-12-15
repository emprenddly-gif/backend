import express from "express";
import pool from "../config/db.js";

console.log("🛠 Debug pool config (inventario):", pool.config);

const router = express.Router();

// Listar inventario
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ri.ID_INVENTARIO, ri.NOMBRE, ri.CANTIDAD, ri.VALOR_UNITARIO, p.Nombre AS Producto
      FROM Registro_Inventario ri
      JOIN Productos p ON ri.Id_Productos = p.Id_Productos
      WHERE ri.activo = TRUE --  CAMBIO CLAVE: FILTRAR
    `);
    res.json(rows);
  } catch (err) {
    console.error("/inventario ERROR:", err);
    res.status(500).json({ message: "Error en /inventario", error: err.message, stack: err.stack });
  }
});

// // Agregar producto al inventario
// router.post("/", async (req, res) => {
//   const { NOMBRE, CANTIDAD, VALOR_UNITARIO, Id_Productos } = req.body;
//   try {
//     const [result] = await pool.query(
//       "INSERT INTO Registro_Inventario (NOMBRE, CANTIDAD, VALOR_UNITARIO, Id_Productos) VALUES (?, ?, ?, ?)",
//       [NOMBRE, CANTIDAD, VALOR_UNITARIO, Id_Productos]
//     );
//    // Traer el producto recién insertado junto con nombre de producto
//     const [rows] = await pool.query(`
//       SELECT ri.ID_INVENTARIO, ri.NOMBRE, ri.CANTIDAD, ri.VALOR_UNITARIO, p.Nombre AS Producto
//       FROM Registro_Inventario ri
//       JOIN Productos p ON ri.Id_Productos = p.Id_Productos
//       WHERE ri.ID_INVENTARIO = ?
//     `, [result.insertId]);

//     res.json(rows[0]); // devolver objeto completo
//   } catch (err) {
//     console.error("POST /inventario ERROR:", err);
//     res.status(500).json({ message: "Error al agregar producto", error: err.message });
//   }
// });



// Agregar producto al inventario
router.post("/", async (req, res) => {
  const { NOMBRE, CANTIDAD, VALOR_UNITARIO } = req.body;
  
  // ⭐️ CAMBIO CLAVE: Ya NO se extrae Id_Productos del req.body
  // const { NOMBRE, CANTIDAD, VALOR_UNITARIO, Id_Productos } = req.body; 

  try {
    let productId;

    // 1. Intentar encontrar el producto en la tabla Productos por nombre
    const [existingProduct] = await pool.query(
      "SELECT Id_Productos FROM Productos WHERE Nombre = ?",
      [NOMBRE]
    );

    if (existingProduct.length > 0) {
      // Si el producto existe, usar su ID
      productId = existingProduct[0].Id_Productos;
    } else {
      // 2. Si el producto NO existe, crearlo en la tabla Productos
      // Usamos el NOMBRE y el VALOR_UNITARIO (precio) proporcionados
      const [newProductResult] = await pool.query(
        "INSERT INTO Productos (Nombre, Precio) VALUES (?, ?)",
        [NOMBRE, VALOR_UNITARIO]
      );
      productId = newProductResult.insertId;
    }

    // 3. Insertar en Registro_Inventario usando el Id_Productos obtenido/creado
    const [result] = await pool.query(
      "INSERT INTO Registro_Inventario (NOMBRE, CANTIDAD, VALOR_UNITARIO, Id_Productos) VALUES (?, ?, ?, ?)",
      [NOMBRE, CANTIDAD, VALOR_UNITARIO, productId] // ⭐️ Aquí se usa productId
    );
    
    // Traer el producto recién insertado junto con nombre de producto
    // ... (El resto del código para traer el producto y devolverlo sigue igual)
    const [rows] = await pool.query(`
      SELECT ri.ID_INVENTARIO, ri.NOMBRE, ri.CANTIDAD, ri.VALOR_UNITARIO, p.Nombre AS Producto
      FROM Registro_Inventario ri
      JOIN Productos p ON ri.Id_Productos = p.Id_Productos
      WHERE ri.ID_INVENTARIO = ?
    `, [result.insertId]);

    res.json(rows[0]); // devolver objeto completo
  } catch (err) {
    console.error("POST /inventario ERROR:", err);
    // ⭐️ Importante: Si la restricción UNIQUE de Id_Productos en Registro_Inventario falla,
    // es porque el producto (el Id_Productos) ya está en el inventario.
    // Esto lo puedes manejar con un mensaje más específico.
    if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ message: "El producto ya existe en el inventario.", error: err.message });
    } else {
        res.status(500).json({ message: "Error al agregar producto", error: err.message });
    }
  }
});






// Actualizar producto
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { NOMBRE, CANTIDAD, VALOR_UNITARIO } = req.body;
  try {
    // Actualizar el registro
    await pool.query(
      "UPDATE Registro_Inventario SET NOMBRE=?, CANTIDAD=?, VALOR_UNITARIO=? WHERE ID_INVENTARIO=?",
      [NOMBRE, CANTIDAD, VALOR_UNITARIO, id]
    );

    // Traer el registro actualizado junto con el nombre del producto (join)
    const [rows] = await pool.query(`
      SELECT ri.ID_INVENTARIO, ri.NOMBRE, ri.CANTIDAD, ri.VALOR_UNITARIO, p.Nombre AS Producto
      FROM Registro_Inventario ri
      JOIN Productos p ON ri.Id_Productos = p.Id_Productos
      WHERE ri.ID_INVENTARIO = ?
    `, [id]);

    res.json(rows[0]); // devolver objeto completo actualizado
  } catch (err) {
    console.error("PUT /inventario ERROR:", err);
    res.status(500).json({ message: "Error al actualizar producto", error: err.message });
  }
});


// Desactivar producto (Soft Delete)
router.delete("/:id", async (req, res) => {
  const { id } = req.params; // ID_INVENTARIO
  try {
    // ⭐️ CAMBIO CLAVE: Cambiar DELETE por UPDATE para desactivar
    const [result] = await pool.query(
      "UPDATE Registro_Inventario SET activo = FALSE WHERE ID_INVENTARIO=?", 
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Registro de inventario no encontrado." });
    }
    
    // La respuesta al frontend sigue siendo de éxito
    res.json({ message: "Producto desactivado correctamente." });
  } catch (err) {
    console.error("DELETE (Desactivar) /inventario ERROR:", err);
    res.status(500).json({ message: "Error al desactivar producto", error: err.message });
  }
});

// 🔹 Confirmar y ejecutar eliminación en backend
  const confirmarEliminacion = async () => {
    if (!productToDelete) return;

    try {
      // 1. Llamar al backend
      const res = await fetch(`http://localhost:4000/inventario/${productToDelete.ID_INVENTARIO}`, {
        method: "DELETE",
      });

      // 2. Verificar que la respuesta sea exitosa (código 200-299)
      if (!res.ok) {
        // Si no es ok (ej: 400 o 500), lanzar un error para que sea capturado
        const errorData = await res.json();
        throw new Error(errorData.message || `Error al eliminar (código: ${res.status})`);
      }

      // 3. Si fue exitoso, actualizar el estado
      setProductos(productos.filter(p => p.ID_INVENTARIO !== productToDelete.ID_INVENTARIO));
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      // ⚠️ Opcional: mostrar un mensaje de error al usuario
      setError(err.message); 
    } finally {
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };
export default router;













