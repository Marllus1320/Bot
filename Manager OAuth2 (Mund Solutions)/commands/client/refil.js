const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const {data,db, ms, fat} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require("axios");
const qs = require('qs');
const moment = require("moment");



module.exports = {
    name:"refil",
    description:"Faça Refill de uma compra sua.",
    type: ApplicationCommandType.ChatInput,
    options:[
        {
            name:"compra",
            description:"Coloque o ID da Compra.",
            type: ApplicationCommandOptionType.String,
            required:true,
            autocomplete: true,
        },
    ],
    async autocomplete(interaction) {
        const value = interaction.options.getFocused().toLowerCase();
        let choices = fat.all().filter(a => a.data.owner === interaction.user.id);
    
        const filtered = choices.filter(choice => choice.ID.toLowerCase().includes(value)).slice(0, 25);
    
        if(!interaction) return;
         if(choices.length === 0){ 
            await interaction.respond([
                { name: "Você não tem nenhum Refill", value: "a29183912asd92384XASDASDSADASDSADASDASD12398212222" }
            ])
        } else if(filtered.length === 0) {
            await interaction.respond([
                { name: "Não Achei Nenhum Refill com esse ID", value: "a29183912asd92384XASDASDSADASDSADASDASD1239821" }
            ]);
        } else {
            await interaction.respond(
                filtered.map(choice => ({ name: `👤 - Refill: ${choice.ID} | ⏰ - Quantidade: ${choice.data.quantia}`, value: choice.ID}))
            );
        }
    },  
    run: async (client, interaction) => {
        const refil = interaction.options.getString("compra");
        const f = await fat.get(refil);
        const min = moment().add(2, 'days');
        const time = Math.floor(min.valueOf() / 1000);
        if (!f) return interaction.reply({ content: `❌ | Não Foi encontrado seu Refil...`, ephemeral: true });
        await interaction.reply({
            content: `\`\`\`✅ | Estamos puxando todos os membros de volta ao seu servidor!\`\`\`\n**Restam: <t:${time}:R> para chegar todos os membros, caso não chegue abra um ticket**`,
            ephemeral: true
        });
        const a = await db.get(f.bot);
        const puxada = f.quantia;
        const users = a.verify;
        await fat.delete(refil);
        
        let nu = 0;
        const logs_channel = interaction.client.channels.cache.get(await data.get(`logs`));
        if(logs_channel) logs_channel.send({
            embeds: [
                new EmbedBuilder()
                .setTitle(`<a:ping:1233536971243126835>・Logs Refill`)
                .setColor("Green")
                .addFields(
                    {
                        name:"<:membros:1234289919309123605> Usuário",
                        value:`**${interaction.user} - \`${interaction.user.id}\`**`
                    },
                    {
                        name:"<:membroadd:1237220159890919494> Puxadas Totais:",
                        value:`\`${puxada} Membros\``
                    },
                    {
                        name:"<:membros:1234289919309123605> ID do Servidor: ",
                        value:`\`${f.guild}\``,
                        inline: false
                    },
                    {
                        name:"<:relogioazulaamarelo:1225982418796937326> Horário",
                        value:`**<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/1000)}:R>)**`,
                        inline:false
                    },
                )
            ]
        });
        while(nu <= puxada) {
            const users = await db.get(`${f.bot}.verify`);
            const user = users[nu];
            nu++;
            if(user) {
                const token = user.token;

            const renew = await renewToken(token.refresh_token, token.code, a.idbot, a.secret);
            await db.pull(`${f.bot}.verify`, a => a.token.refresh_token !== token.refresh_token, true);
            
            const body = { access_token: renew?.access_token ?? token.access_token }
            const response2 = await axios.put(`https://discord.com/api/guilds/${f.guild}/members/${user.id}`, JSON.stringify(body), {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bot ${a.token}`,
                },
            }).catch(() => {});
            await db.push(`${f.bot}.verify`, 
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
    }
}

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