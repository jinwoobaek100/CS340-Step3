const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 7777;
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
    
                // Construct the SQL query with placeholders
                let sql = `INSERT INTO ${entityName} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
    
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
                const updateQuery = findSQLQuery(`-- Query for UPDATE ${entityName}.`);

                if (!updateQuery) {
                    return res.status(500).json({ error: `UPDATE query for ${entityName} not found` });
                }

                // Extract column names and values from the request body
                const columns = Object.keys(data);
                const values = Object.values(data);

                // Construct the SET clause for the UPDATE query
                const setClause = columns.map(column => `${column} = ?`).join(', ');

                // Construct the final UPDATE query
                const sql = `UPDATE ${entityName} SET ${setClause} WHERE ${idField} = ?`;

                // Add the ID to the values array
                values.push(id);

                // Execute the UPDATE query
                const result = await executeQuery(sql, values);

                // Send a success message
                res.json({ message: `${entityName} ${id} updated successfully` });
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
                const deleteQuery = findSQLQuery(`-- Query for DELETE ${entityName}.`);

                if (!deleteQuery) {
                    return res.status(500).json({ error: `DELETE query for ${entityName} not found` });
                }

                const sql = `DELETE FROM ${entityName} WHERE ${idField} = ?`;

                // Execute the DELETE query
                const result = await executeQuery(sql, [id]);

                // Send a success message
                res.json({ message: `${entityName} ${id} deleted successfully` });
            } catch (error) {
                next(error);
            }
        });
    };

    // Customers
    handleGet(app, 'Customers', 'customerID');
    handlePost(app, 'Customers');
    handlePut(app, 'Customers', 'customerID'); // Add PUT handler
    handleDelete(app, 'Customers', 'customerID'); // Add DELETE handler

    // Stores
    handleGet(app, 'Stores', 'storeID');
    handlePost(app, 'Stores');
    handlePut(app, 'Stores', 'storeID'); // Add PUT handler
    handleDelete(app, 'Stores', 'storeID'); // Add DELETE handler

    // MenuItems
    handleGet(app, 'MenuItems', 'menuID');
    handlePost(app, 'MenuItems');
    handlePut(app, 'MenuItems', 'menuID'); // Add PUT handler
    handleDelete(app, 'MenuItems', 'menuID'); // Add DELETE handler

    // Orders (Demonstrates nullable relationship and requires a custom UPDATE)
    handleGet(app, 'Orders', 'orderID');
    handlePost(app, 'Orders');
    handlePut(app, 'Orders', 'orderID'); // Use generic PUT handler
    handleDelete(app, 'Orders', 'orderID'); // Add DELETE handler

    // Phones
    handleGet(app, 'Phones', 'phoneID');
    handlePost(app, 'Phones');
    handlePut(app, 'Phones', 'phoneID'); // Add PUT handler
    handleDelete(app, 'Phones', 'phoneID'); // Add DELETE handler

    // OrderItems (Many-to-Many relationship)
    handleGet(app, 'OrderItems', 'orderItemID');
    handlePost(app, 'OrderItems');
    handlePut(app, 'OrderItems', 'orderItemID'); // Add PUT handler
    handleDelete(app, 'OrderItems', 'orderItemID');

    // Positions
    handleGet(app, 'Positions', 'positionID');
    handlePost(app, 'Positions');
    handlePut(app, 'Positions', 'positionID');
    handleDelete(app, 'Positions', 'positionID');

    // Employees
    handleGet(app, 'Employees', 'employeeID');
    handlePost(app, 'Employees');
    handlePut(app, 'Employees', 'employeeID'); // Add PUT handler
    handleDelete(app, 'Employees', 'employeeID'); // Add DELETE handler

    // StorePositions (Many-to-Many relationship)
    handleGet(app, 'StorePositions', 'storePositionID');
    handlePost(app, 'StorePositions');
    handlePut(app, 'StorePositions', 'storePositionID'); // Add PUT handler
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

app.get('/api/search', async (req, res, next) => {
    try {
        const searchTerm = req.query.term;

        if (!searchTerm) {
            return res.status(400).json({ error: 'Search term is required' });
        }

        const searchQuery = findSQLQuery(`-- Query for SEARCH.`);

        if (!searchQuery) {
            return res.status(500).json({ error: `Search query not found` });
        }

        const likeTerm = `%${searchTerm}%`; // For wildcard matching with LIKE
        const params = Array(19).fill(likeTerm); // Create an array of 18 likeTerm values

        const results = await executeQuery(searchQuery, params);

        res.json(results);
    } catch (error) {
        next(error);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://classwork.engr.oregonstate.edu:${PORT}`);
});
