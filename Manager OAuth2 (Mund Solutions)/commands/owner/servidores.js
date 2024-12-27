const fs = require("fs");
const { ApplicationCommandType, ChannelType, Permissions, PermissionFlagsBits } = require("discord.js");
const { data, db, ms } = require("../../database/index");
const { owner } = require("../../config.json");
const axios = require("axios");

module.exports = {
    name: "servidores",
    description: "Veja todos os Servidores da Auth.",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        if (owner !== interaction.user.id) return interaction.reply({ content: `❌ | Você não tem permissão para usar este comando.`, ephemeral: true });
        await interaction.reply({ content: `Aguarde um momento...`, ephemeral: true });
        let msg = "";

        const guildAll = client.guilds.cache;
        const m = await guildAll.map(async (guild) => {
            try {
                const channel = guild.channels.cache.find(a => a.type === ChannelType.GuildText && a.permissionsFor(client.user.id).has(PermissionFlagsBits.CreateInstantInvite));
                if (channel) { 
                    const invite = await channel.createInvite().catch((err) => { console.log(err) });
                    msg += `Servidor: ${guild.name}\n- ID: ${guild.id}\n- Convite: ${invite}\n\n`;
                }
            } catch (err) {
                console.log(err);
            }
        });
        await Promise.all(m);
        

        const filePath = `convites.txt`;
        fs.writeFile(filePath, msg, (err) => {
            if (err) {
                return interaction.editReply({ content: "Ocorreu um erro ao criar o arquivo.", ephemeral: true });
            }

            interaction.editReply({ content: "Aqui está o arquivo com a lista de Convites:", files: [filePath] });
        });
    }
}
