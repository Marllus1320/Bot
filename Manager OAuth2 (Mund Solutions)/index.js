const {Client , GatewayIntentBits,Collection, Partials, } = require("discord.js");

const client = new Client({
  intents: Object.keys(GatewayIntentBits),
  partials: Object.keys(Partials)
});

const express = require('express');
const app = express()
const port = 8080;

console.clear();
client.slashCommands = new Map();
const {token, mongodb} = require("./config.json"); 


const { Database, Util } = require("quickmongofixed");
const db = new Database(mongodb);

db.on("ready", () => {
    console.log("- Connected to MongoDB");
});


module.exports = {
  client,
  db
};
const evento = require("./handler/Events");
evento.run(client);
require("./handler/index")(client);

process.on('unhandRejection', (reason, promise) => {
  console.log(`🚫 Erro Detectado:\n\n` + reason, promise);
});
process.on('uncaughtException', (error, origin) => {
  console.log(`🚫 Erro Detectado:\n\n` + error, origin);
});


client.login(token).then(async() => {
  await db.connect();
  try {
    app.listen({
        host:"0.0.0.0",
        port: process.env.PORT ? Number(process.env.PORT) : port,
    });
  } finally {
      console.log("- HTTP Process Running");
  }
});


const login = require("./routes/login");
const callback = require("./routes/callback");

app.use("/", login);
app.use("/", callback);