const express = require('express');
const sqlite3 = require('sqlite3');
const app = express();
const port = 3000;

// Conectar a la base de datos SQLite
const db = new sqlite3.Database('./rucpy.db', (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Middleware para parsear JSON
app.use(express.json());

// Endpoint para listar un registro por RUC
app.get('/contribuyente/:ruc', (req, res) => {
    const ruc = req.params.ruc;
    const sql = `SELECT * FROM Contribuyente WHERE ruc = ?`;
    db.get(sql, [ruc], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: 'Contribuyente no encontrado' });
        }
    });
});

// Endpoint para buscar por razón social de manera insensible a mayúsculas/minúsculas
app.get('/razonsocial', (req, res) => {
    const razonSocial = req.query.razonSocial;
    if (!razonSocial) {
        res.status(400).json({ message: 'El parámetro razonSocial es requerido' });
        return;
    }
    const sql = `SELECT * FROM Contribuyente WHERE LOWER(razonSocial) LIKE LOWER(?)`;
    db.all(sql, [`%${razonSocial}%`], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ resultados: rows });
    });
});


// Ruta principal con formulario de búsqueda por ruc
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Ruta principal con formulario de búsqueda por razon social
app.get('/buscar', (req, res) => {
    res.sendFile(__dirname + '/buscar.html');
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});