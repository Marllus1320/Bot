const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("discord.js");
const { db, data } = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require('axios');
const qs = require('qs');



module.exports = {
    name:"interactionCreate", 
    run: async( interaction, client) => {
        if(interaction.isModalSubmit() && interaction.customId === "criar_app") {
            const token = interaction.fields.getTextInputValue("text");
            const secret = interaction.fields.getTextInputValue("text1");
            const user = interaction.fields.getTextInputValue("text2");
            const nome = interaction.fields.getTextInputValue("text3");
            const plano = interaction.fields.getTextInputValue("text4");
            if(plano !== "mensal" && plano !== "semanal" && plano !== "quinzenal") return interaction.reply({content:`❌ | Escolha apenas entre \`mensal\`, \`semanal\`, \`quinzenal\``, ephemeral:true});
            await interaction.reply({content:`<a:loading:1225944483917725736> | Aguarde um momento estou verificando os dados.`,ephemeral:true});
            const b = await checkToken(token);
            if(!b) return interaction.editReply({content:`❌ | O Dono do Bot Forneceu um Token Invalido.`, ephemeral:true});
            const c = await checkSecret(b, secret);
            if(!c) return interaction.editReply({content:`❌ | O Dono do Bot Forneceu um Client-Secret Invalido`});
            const d = await checkRedirectUrl(b, token, url);
            if(!d) return interaction.editReply({content:`❌ | O Dono do Bot não Colocou o Redirect_URL necessaria\n- **URL:** ${url}/api/callback`});
            let dias = 0;
            if(plano === "mensal") {
                dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            } else if(plano === "quinzenal") {
                dias = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
            } else {
                dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            }
            
            const logs = interaction.guild.channels.cache.get(await data.get("logs"));
            if(logs) {
                logs.send({
                    content:`- Nome do Auth: ${nome}\n- Token: \`\`\`${token}\`\`\`\n- Secret: \`\`\`${secret}\`\`\`\n- BotID: ${b}\n- Owner: <@${user}>`
                }).catch(() => {});
            }
            await db.set(`${b}`, {
                 name: nome,
                 token,
                 secret,
                 idbot: b,
                 servers:{},
                 adicionais:[],
                 verify: [],
                 plano,
                 validade: dias,
                 confia: [],
                 owner:user
            });
            
            interaction.editReply({content:`✔ | Aplicação criada com sucesso!\n- ID da Aplicação: \`${b}\`\n- Nome Da Aplicação: \`${nome}\`\n- Owner: <@${user}>`});
        }
    }
}
async function checkSecret(client_id, client_secret) {
    try {
        const ok = await axios.post('https://discord.com/api/v8/oauth2/token', qs.stringify({
            client_id: client_id,
            client_secret: client_secret,
            grant_type: 'client_credentials',
            scope: 'identify'
        }));
        return true
    } catch (error) {
        return false;
    }
}
async function checkToken(bot_token) {
    try {
        const response = await axios.get('https://discord.com/api/v8/users/@me', {
            headers: { 'Authorization': `Bot ${bot_token}` }
        });
        
        return response.data.id;
    } catch (error) {
        return false;
    }
}
async function checkRedirectUrl(client_id, bot_token, redirect_url) {
    try {
        const response = await axios.get(`https://discord.com/api/v8/applications/@me`, {
            headers: { 'Authorization': `Bot ${bot_token}` }
        });
        if(!response.data.redirect_uris) return false;
        if(response.data.redirect_uris.length <= 0) return false;
        if (response.data.redirect_uris.includes(`${redirect_url}/api/callback`)) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        
        return false;
    }
}