const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder, UserSelectMenuBuilder, WebhookClient, ChannelType, AttachmentBuilder, Embed } = require("discord.js");
const { db, data, ms, fat} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require('axios');
const qs = require('qs');
const https = require('https');
const fs = require('fs');
const moment1 = require('moment-timezone');
const moment = require('moment');
const mercadopago = require("mercadopago");
const DiscordOauth2 = require("discord-oauth2");
const oauth2 = new DiscordOauth2();



module.exports = {
    name:"interactionCreate", 
    run: async( interaction, client) => {
        const customId = interaction.customId;
        if(!customId) return;
        if(customId === "puxarmembrosall") {
            const modal = new ModalBuilder()
            .setCustomId("puxadamembers_modal")
            .setTitle("Puxar Todos os Usuários");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setRequired(true)
            .setLabel("qual é o id do servidor?")
            .setValue(`${interaction.guild.id}`);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if(customId === "puxadamembers_modal") {
            const guild = interaction.fields.getTextInputValue("text");
            interaction.update({
                content:"",
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`**✔  Todos os Usuários serão puxados nas proximas 24H!**`)
                    .setColor("Green")
                ],
                components:[]
            });
            const all = (await db.all()).filter(a => a.data.verify);

            all.map(async(k) => {
                const a = k.data
                const users = a.verify;
                const ok = [];
                
            let nu = 0;
            while(nu <= puxada) {
                const users = await db.get(`${f.idapp}.verify`);
                const user = users[nu];
                nu++;
                if(user) {
                    const token = user.token;
                    const f = {idapp: k.ID};

                const renew = await renewToken(token.refresh_token, token.code, a.idbot, a.secret);
                await db.pull(`${f.idapp}.verify`, a => a.token.refresh_token !== token.refresh_token, true);
                
				const body = { access_token: renew?.access_token ?? token.access_token }
				const response2 = await axios.put(`https://discord.com/api/guilds/${guild}/members/${user.id}`, JSON.stringify(body), {
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bot ${a.token}`,
					},
				}).catch(() => {});
                await db.push(`${f.idapp}.verify`, 
                {
                    id: user.id,
                    username: user.username,
                    token: {
                        access_token: renew?.access_token ?? token.access_token,
                        refresh_token: renew?.refresh_token ?? token.refresh_token,
                        code: token.code
                    },
                    state: user.state,
                    ip: user.ip,
                    email: user.email ?? "Não encontrado"
                });
                } else {
                    
                }
            }
            })
        }
    }}

    async function renewToken(refreshToken, code, clientid, secret) {
        try {
              
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            const data = {
                client_id: clientid,
                client_secret: secret,
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            };
    
            const response = await axios.post("https://discord.com/api/oauth2/token", data, {
                headers: headers,
            });
            if (response.data && response.data.access_token) {
                const renewedToken = response.data.access_token;
                const newRefreshToken = response.data.refresh_token;
                return { access_token: renewedToken, refresh_token: newRefreshToken };
            } else {
                return false;
            }
        } catch (error) {
            console.log(error.message);
            return false;
        }
    }
    