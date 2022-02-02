// doe imports voor redis dependency en config
const keys = require('./keys.js');
const redis = require('redis');

// instellen redis client met automatische reconnect als verbinding wegvalt
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

// maak een duplicaat van de connectie want volgens redis spec kan een connectie maar voor één doeleinde gebruikt worden. hier voor subscriben, ergens anders voor publishen
const redisSubscriber = redisClient.duplicate();

// recursief fibonacci nummer bepalen
function fib(index) {
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2);
}

// configureer subscription - bij iedere nieuwe message wordt de redis hashset uitgebreid met een nieuw berekend fibonacci resultaat
redisSubscriber.on('message', (channel, message) => {
    redisClient.hset('values', message, fib(parseInt(message)))
});

// subscribe op ieder insert event in de redis store
redisSubscriber.subscribe('insert');