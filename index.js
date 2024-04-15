const pg = require('pg')
const express =require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/ice_creame_shop');
const app = express();

app.use(require('morgan')('dev'));
app.use(express.json())
/*CRUD ORDER BELOW */
//CREATE
app.post("/api/flavors", async (req, res, next) =>{
    try { 
        const SQL= /* sql */ `
        INSERT INTO flavors(txt)
        VALUES ($1)
        RETURNING *
        `;
        const response = await client.query(SQL, [req.body.txt])
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
});

// READ
app.get("/api/flavors", async (req, res, next) => {
    try { 
        const SQL= `SELECT * from flavors;`;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

// GET Request for One Flavor
app.get("/api/flavors/:id", async (req, res, next) => {
    try { 
        const SQL= `SELECT * from flavors WHERE id = $1;`;
        const response = await client.query(SQL, [req.params.id]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});

// UPDATE
app.put("/api/flavors/:id", async(req, res, next) => {
    try {
        const SQL= /* sql */ `
        UPDATE flavors 
        SET txt=$1, is_favorite=$2, updated_at= now()
        WHERE id=$3
        `;
        const response = await client.query(SQL, [req.body.txt, req.body.ranking, 
        req.params.id])
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});

// DELETE 
app.delete("/api/flavors/:id", async(req, res, next) => {
    try {
        const SQL = `
        DELETE from flavors
        WHERE id = $1
        `;
        const response = await client.query(SQL, [req.params.id])
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
});

const init = async () => {
    await client.connect()
    console.log('connected to database');
    let SQL = /* sql */`
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY, 
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        ranking INTEGER DEFAULT 3 NOT NULL, 
        is_favorite BOOLEAN DEFAULT FALSE,
        txt VARCHAR(255)
    )
    `;
    await client.query(SQL)
    console.log("tables created");

    SQL = /* sql */ `
    INSERT INTO flavors(txt) VALUES('Vanilla');
    INSERT INTO flavors(txt, ranking) VALUES('Chocalate', 1);
    INSERT INTO flavors(txt) VALUES('Caramel');
    `; 

    await client.query(SQL);
    console.log("data seeded");

    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port $(port)`));
};

init()