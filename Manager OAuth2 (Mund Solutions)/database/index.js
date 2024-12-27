const {db} = require("../index");
const { JsonDatabase } = require("wio.db");
const data = new JsonDatabase({databasePath:"./database/db.json"});
const fat = new JsonDatabase({databasePath:"./database/db2.json"});
const serv = new JsonDatabase({databasePath:"./database/db3.json"});
const renov = new JsonDatabase({databasePath:"./database/db4.json"});
const { QuickDB } = require("quick.db");
const ms = new QuickDB({filePath:"./database/logs.sqlite"});
const axios = require("axios");

db.on("ready", () => {
    setInterval(async() => {
        
        const o = (await db.all()).filter(a => a.data.token).filter(a => !a.data.adicionais.includes("div"))
        o.map(async(a) => {
            const url = 'https://discord.com/api/v10/applications/@me';
            const data2 = {
                description: `${data.get("bio")}`,
            };
    
            await axios.patch(url, data2, {
                headers: {
                    Authorization: `Bot ${a.data.token}`,
                    'Content-Type': 'application/json'
                }
            }).then((a) => {}).catch((error) => {});
			await new Promise(resolve => setTimeout(resolve, 2400));
        });
    }, 60000);
});

module.exports = {
    db,
    data,
    ms,
    fat,
    serv,
    renov
}