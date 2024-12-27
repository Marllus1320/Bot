const { Router } = require("express");
const { db, data, ms} = require("../database/index");
const router = Router();
const DiscordOauth2 = require("discord-oauth2");
const oauth2 = new DiscordOauth2();
const {url} = require("../config.json");

router.get('/api/login', async(req, res) => {
    const {state} = req.query;
    if(!state) {
        res.status(401);
        return res.json({
            message:"Está faltando um Query",
            status: 401
        });
    }
    const idapp = state.split(" ")[0];
    const guild = state.split(" ")[1];
    const b = await db.get(`${idapp}`);
    try {
        res.redirect(oauth2.generateAuthUrl({
            clientId: b.idbot,
            clientSecret: b.secret,
            scope: ['identify', 'gdm.join', "guilds.join", "email"],
            redirectUri: `${url}/api/logoin`,
            state:`${idapp}+${guild}`
        }));
    } catch(err) {}
    
});

module.exports = router;