const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 7878;
const mysql = require('mysql');

app.use(express.json());
app.use(express.static('public'));

// Setting for connection with database
const connection = mysql.createConnection({
    host: 'classmysql.engr.oregonstate.edu',
    user: 'cs340_baekji',
    password: 'retry2002',
    database: 'cs340_baekji'
});

// Start Connection
connection.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connection to database with id ' + connection.threadId);
});

// Function that execute the database function
const executeQuery = (sql, values) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
};

// Function to read SQL file
const readSQLFile = (filename) => {
    try {
        const rawData = fs.readFileSync(path.join(__dirname, filename), 'utf8');
        // Split the file content into individual queries
        const queries = rawData.split(';')
            .map(query => query.trim()) // Trim whitespace
            .filter(query => query.length > 0); // Remove empty queries
        return queries;
    } catch (error) {
        console.error('Error reading SQL file:', error);
        return [];
    }
};

// Read queries from DML.sql
const sqlQueries = readSQLFile('DML.sql');

// Helper function to find a specific SQL query by a descriptive comment
const findSQLQuery = (commentSnippet) => {
    const commentLine = sqlQueries.find(query => query.includes(commentSnippet));
    if (!commentLine) {
        console.warn(`SQL query with comment "${commentSnippet}" not found.`);
        return null;
    }

    const queryStart = commentLine.indexOf('\n') + 1;
    return commentLine.substring(queryStart).trim();
};

const setupRoutes = () => {

    // Helper function to handle GET requests
    const handleGet = (app, entityName, idField) => {
        app.get(`/api/${entityName}`, async (req, res, next) => {
            try {
                const selectQuery = findSQLQuery(`-- Query for SELECT all ${entityName}.`);
                if (!selectQuery) {
                    return res.status(500).json({ error: `SELECT query for ${entityName} not found` });
                }
                console.log(selectQuery);
                const entities = await executeQuery(selectQuery);
                res.json(entities);
            } catch (error) {
                next(error);
            }
        });

        app.get(`/api/${entityName}/:id`, async (req, res, next) => {
            try {
                const id = req.params.id;
                const sql = `SELECT * FROM ${entityName} WHERE ${idField} = ?`;
                const entities = await executeQuery(sql, [id]);
                if (entities.length > 0) {
                    res.json(entities[0]);
                } else {
                    res.status(404).json({ message: `${entityName} not found` });
                }
            } catch (error) {
                next(error);
            }
        });
    };

    // Helper function to handle POST requests
    const handlePost = (app, entityName) => {
        app.post(`/api/${entityName}`, async (req, res, next) => {
            try {
                const data = req.body;
                const insertQuery = findSQLQuery(`-- Query for INSERT ${entityName}.`);
                if (!insertQuery) {
                    return res.status(500).json({ error: `INSERT query for ${entityName} not found` });
                }

                // Extract the column names from the INSERT query for replacement
                const columnsMatch = insertQuery.match(/\(([^)]+)\)/);
                if (!columnsMatch || columnsMatch.length < 2) {
                    return res.status(500).json({ error: "Could not extract columns from INSERT query" });
                }
                const columns = columnsMatch[1].split(',').map(col => col.trim());

                // Prepare values array based on the order of columns in the SQL query
                const values = columns.map(column => data[column.replace(/[$]/g, '')]); // Remove $ from column names

                // Replace placeholders in the SQL query
                let sql = insertQuery;
                columns.forEach((column, index) => {
                    const placeholder = new RegExp(column, 'g');
                    sql = sql.replace(placeholder, '?');
                });

                const result = await executeQuery(sql, values);
                const newEntityId = result.insertId;
                const newEntity = await executeQuery(`SELECT * FROM ${entityName} WHERE ${entityName.slice(0, -1)}ID = ?`, [newEntityId]);
                res.status(201).json(newEntity[0]);
            } catch (error) {
                next(error);
            }
        });
    };

    // Helper function to handle PUT requests
    const handlePut = (app, entityName, idField) => {
        app.put(`/api/${entityName}/:id`, async (req, res, next) => {
            try {
                const id = req.params.id;
                const data = req.body;

                // Construct the SET part of the SQL query dynamically
                const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
                const values = [...Object.values(data), id];

                const sql = `UPDATE ${entityName} SET ${updates} WHERE ${idField} = ?`;
                const result = await executeQuery(sql, values);

                if (result.affectedRows > 0) {
                    // Fetch the updated entity and respond with it
                    const updatedEntity = await executeQuery(`SELECT * FROM ${entityName} WHERE ${idField} = ?`, [id]);
                    res.json(updatedEntity[0]);
                } else {
                    res.status(404).json({ message: `${entityName} not found` });
                }
            } catch (error) {
                next(error);
            }
        });
    };

    // Helper function to handle DELETE requests
    const handleDelete = (app, entityName, idField) => {
        app.delete(`/api/${entityName}/:id`, async (req, res, next) => {
            try {
                const id = req.params.id;
                const sql = `DELETE FROM ${entityName} WHERE ${idField} = ?`;
                const result = await executeQuery(sql, [id]);

                if (result.affectedRows > 0) {
                    res.json({ message: `${entityName} deleted successfully` });
                } else {
                    res.status(404).json({ message: `${entityName} not found` });
                }
            } catch (error) {
                next(error);
            }
        });
    };
    
    // Customers
    handleGet(app, 'Customers', 'customerID');
    handlePost(app, 'Customers');

    // Stores
    handleGet(app, 'Stores', 'storeID');
    handlePost(app, 'Stores');

    // MenuItems
    handleGet(app, 'MenuItems', 'menuID');
    handlePost(app, 'MenuItems');

    // Orders (Demonstrates nullable relationship and requires a custom UPDATE)
    handleGet(app, 'Orders', 'orderID');
    handlePost(app, 'Orders');
    app.put('/api/orders/:orderID', async (req, res, next) => {
        try {
            const orderID = req.params.orderID;
            const updateQuery = findSQLQuery("-- Query for UPDATE Orders.");
            if (!updateQuery) {
                return res.status(500).json({ error: `UPDATE query for Orders not found` });
            }
            await executeQuery(updateQuery, [orderID]);
            res.json({ message: `Order ${orderID} updated successfully` });
        } catch (error) {
            next(error);
        }
    });

    // Phones
    handleGet(app, 'Phones', 'phoneID');
    handlePost(app, 'Phones');

    // OrderItems (Many-to-Many relationship)
    handleGet(app, 'OrderItems', 'orderItemID');
    handlePost(app, 'OrderItems');
    handleDelete(app, 'OrderItems', 'orderItemID');

    // Positions
    handleGet(app, 'Positions', 'positionID');
    handlePost(app, 'Positions');
    handlePut(app, 'Positions', 'positionID');
    handleDelete(app, 'Positions', 'positionID');

    // Employees
    handleGet(app, 'Employees', 'employeeID');
    handlePost(app, 'Employees');

    // StorePositions (Many-to-Many relationship)
    handleGet(app, 'StorePositions', 'storePositionID');
    handlePost(app, 'StorePositions');
    handleDelete(app, 'StorePositions', 'storePositionID');
};

setupRoutes();

// SPA catch-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 500,
        message: 'Internal Server Error',
        error: err.message
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://classwork.engr.oregonstate.edu:${PORT}`);
});
