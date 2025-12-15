const db = require("../config/db");

exports.getProductos = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Productos");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};


exports.createSale = async (req, res) => {
  try {
    const {
      nombreProducto,
      cantidad,
      Id_Metodo,
      Id_Usuarios,
      precioNuevoProducto
    } = req.body;

    const imagenPath = req.file ? req.file.path : null;

    if (!nombreProducto || !cantidad || cantidad <= 0) {
      return res.status(400).json({ error: "Datos incompletos o inválidos" });
    }

    const [results] = await db.query(
      "SELECT Id_Productos, Precio FROM Productos WHERE Nombre = ?",
      [nombreProducto]
    );

    let Id_Productos;
    let precioFinal;

    if (results.length > 0) {
      Id_Productos = results[0].Id_Productos;
      precioFinal = results[0].Precio;
    } else {
      precioFinal = precioNuevoProducto ? parseFloat(precioNuevoProducto) : 0;

      const [insertResult] = await db.query(
        "INSERT INTO Productos (Nombre, Precio, Imagen) VALUES (?, ?, ?)",
        [nombreProducto, precioFinal, imagenPath]
      );

      Id_Productos = insertResult.insertId;
    }

    const sql = `
      INSERT INTO Registro_Ventas
      (nombreProducto, cantidad, precio, imagen, Id_Metodo, Id_Usuarios, Id_Productos)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [ventaResult] = await db.query(sql, [
      nombreProducto,
      cantidad,
      precioFinal,
      imagenPath,
      Id_Metodo,
      Id_Usuarios,
      Id_Productos
    ]);

    res.status(201).json({
      message: "Venta registrada correctamente",
      Id_Venta: ventaResult.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// 🔹 Obtener ventas registradas
exports.getVentas = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        rv.Id_Venta,
        rv.nombreProducto,
        rv.cantidad,
        rv.precio,
        rv.imagen
      FROM Registro_Ventas rv
      ORDER BY rv.Id_Venta DESC
    `);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener ventas" });
  }
};


exports.updateVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreProducto, cantidad, precio } = req.body;

    await db.query(
      `UPDATE Registro_Ventas 
       SET nombreProducto = ?, cantidad = ?, precio = ?
       WHERE Id_Venta = ?`,
      [nombreProducto, cantidad, precio, id]
    );

    res.json({ message: "Venta actualizada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la venta" });
  }
};
