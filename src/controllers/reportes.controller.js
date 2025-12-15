import db from "../config/db.js";  
// =======================
// 📊 VENTAS MENSUALES (Calcula el Monto Total, no solo la Cantidad)
// =======================
export const getVentasMensuales = async (req, res) => {
    try {
        let { year, month } = req.query;
        const ahora = new Date();

        if (!year) year = ahora.getFullYear();
        if (!month) month = ahora.getMonth() + 1; // Corregido: 0-11

        const [rows] = await db.query(
            `SELECT 
                -- Fórmula para calcular la semana del mes
                WEEK(rv.Fecha, 1) - WEEK(DATE_SUB(rv.Fecha, INTERVAL DAYOFMONTH(rv.Fecha)-1 DAY), 1) + 1 AS semana,
                mp.Nombre AS metodo_pago,
                -- CÁLCULO DE MONTO TOTAL: Cantidad * Precio del Producto
                SUM(rv.Cantidad * p.Precio) AS monto_total 
            FROM Registro_Ventas rv
            INNER JOIN Metodo_Pago mp ON rv.Id_Metodo = mp.Id_Metodo
            INNER JOIN Productos p ON rv.Id_Productos = p.Id_Productos -- Nuevo JOIN para obtener el precio
            WHERE YEAR(rv.Fecha) = ? AND MONTH(rv.Fecha) = ?
            GROUP BY semana, metodo_pago
            ORDER BY semana, metodo_pago;`,
            [year, month]
        );

        res.json({ year, month, ventas: rows });
    } catch (error) {
        console.error("Error en getVentasMensuales:", error);
        res.status(500).json({ message: "Error al obtener reporte mensual" });
    }
};

// =======================
// 📊 SEMANA ESPECÍFICA (Calcula el Monto Total, no solo la Cantidad)
// =======================
export const getSemanaEspecifica = async (req, res) => {
    try {
        const { year, week } = req.query;
        if (!year || !week) return res.status(400).json({ message: "Falta year o week" });

        const [rows] = await db.query(
            `SELECT 
                WEEK(rv.Fecha, 1) AS semana,
                mp.Nombre AS metodo_pago,
                -- CÁLCULO DE MONTO TOTAL
                SUM(rv.Cantidad * p.Precio) AS monto_total
            FROM Registro_Ventas rv
            INNER JOIN Metodo_Pago mp ON rv.Id_Metodo = mp.Id_Metodo
            INNER JOIN Productos p ON rv.Id_Productos = p.Id_Productos
            WHERE YEAR(rv.Fecha) = ? AND WEEK(rv.Fecha, 1) = ?
            GROUP BY semana, metodo_pago`,
            [year, week]
        );

        res.json(rows);
    } catch (error) {
        console.error("Error en getSemanaEspecifica:", error);
        res.status(500).json({ message: "Error al obtener datos" });
    }
};


export const getVentasAnuales = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ message: "Falta el parámetro year" });

    const [rows] = await db.query(
      `SELECT 
          MONTH(rv.Fecha) AS mes,
          SUM(rv.Cantidad * p.Precio) AS monto_total
        FROM Registro_Ventas rv
        INNER JOIN Productos p ON rv.Id_Productos = p.Id_Productos
        WHERE YEAR(rv.Fecha) = ?
        GROUP BY mes
        ORDER BY mes`,
      [year]
    );

    const meses = [
      "Enero","Febrero","Marzo","Abril","Mayo","Junio",
      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];

    // ============================
    // 📊 DATA PARA EL PIE CHART
    // ============================
    const labels = meses;
    const data = Array(12).fill(0);

    rows.forEach(r => {
      const index = r.mes - 1;
      data[index] = Number(r.monto_total) || 0;
    });

    const datasets = [
      {
        label: "Ganancias",
        data,
        backgroundColor: [
          "#4BC0C0", "#FF6384", "#FFCE56", "#9966FF",
          "#FF9F40", "#36A2EB", "#8E44AD", "#2ECC71",
          "#dd6bfaff", "#3498DB", "#F1C40F", "#D35400"
        ]
      }
    ];

    // ============================
    // 📋 TABLA TOTAL POR MES
    // ============================
    const tabla = {};

    meses.forEach((mes, i) => {
      const encontrado = rows.find(r => r.mes === i + 1);
      tabla[mes] = {
        total: encontrado ? Number(encontrado.monto_total) : 0
      };
    });

    // ============================
    // 📤 RESPUESTA FINAL
    // ============================
    res.json({
      labels,
      datasets,
      tablaMetodos: tabla
    });

  } catch (error) {
    console.error("Error en getVentasAnuales:", error);
    res.status(500).json({ message: "Error al obtener reporte anual" });
  }
};



// =======================
// 💰 GANANCIAS DIARIAS (Usando Reporte_Ganancias)
// =======================
export const getGananciasDiarias = async (req, res) => {
    try {
        const { fecha } = req.params; // Ejemplo: /ganancias/2025-06-01

        // La tabla Reporte_Ganancias ya tiene el Monto total.
        const [rows] = await db.query(
            `SELECT mp.Nombre AS metodo_pago, 
                    SUM(rg.Monto) AS monto_ganancia -- Suma el Monto de la ganancia
            FROM Reporte_Ganancias rg
            INNER JOIN Metodo_Pago mp ON rg.Id_Metodo = mp.Id_Metodo
            WHERE DATE(rg.Fecha) = ?
            GROUP BY metodo_pago;`,
            [fecha]
        );

        // Se obtienen todos los métodos de pago únicos disponibles en la consulta
        const metodos = rows.map(r => r.metodo_pago); 
        
        // Se mapean los datos al formato del gráfico
        const data = rows.map(r => r.monto_ganancia);

        const datasets = [
            {
                label: "Ganancias",
                data,
                // Mantengo tus colores originales
                backgroundColor: ["#2f2540", "#9ea0a8", "#efe0c7", "#FF6384", "#36A2EB", "#FFCE56"],
            },
        ];

        res.json({ labels: metodos, datasets });
    } catch (error) {
        console.error("Error en getGananciasDiarias:", error);
        res.status(500).json({ message: "Error al obtener reporte diario de ganancias" });
    }
};