// import voor config parameters
const keys = require('./keys');

// imports voor express app
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// initialiseer backend service als een express client
const app = express();
app.use(cors());                // sta calls van andere domeinen / cross origin resource sharing toe
app.use(bodyParser.json());     // converteer inkomende requests naar json formaat

// postgress client
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

// maak tabel aan als deze nog niet bestaat
pgClient.on("connect", (client) => {
    client
        .query("CREATE TABLE IF NOT EXISTS values (number INT)")
        .catch((err) => console.error(err));
});

// redis client
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
})

// maak een duplicaat van de connectie want volgens redis spec kan een connectie maar voor één doeleinde gebruikt worden. hier voor publishen, ergens anders voor subscriben
const redisPublisher = redisClient.duplicate();

// express route handlers

// test route
app.get('/', (req, res) => {
    res.send('hallo, je hebt / aangeroepen');
})

// asynchrone call met 'async', afhandelen via een promise met 'await'
app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * FROM values');

    res.send(values.rows);
})

// asynchrone call met 'async', afhandelen via een old school callback want redis heeft geen promise handling support
app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
})

// endpoint voor submitten van nieuwe getallen
app.post('/values', async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
        res.status(422).send('index is te hoog voor snelle fib');
    }

    // persisteer nieuw getal in redis en postgress - na publish zal worker de waarde vullen en kan deze getoond worden via een api call naar /values/current
    redisClient.hset('values', index, 'Nog niet bekend, gaat worker uitrekenen na publish op r71');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    // arbitrair response object
    res.send({ working: true });
});

app.listen(5000, err => {
    console.log('express server luistert');
})