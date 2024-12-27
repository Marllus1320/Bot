const fs = require("fs");
const { ApplicationCommandType } = require("discord.js");
const { data, db, ms } = require("../../database/index");
const { owner } = require("../../config.json");

module.exports = {
    name: "aprovar",
    description: "Aprovar Carrinho.",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        if (owner !== interaction.user.id) return interaction.reply({ content: `❌ | Você não tem permissão para usar este comando.`, ephemeral: true });
        await interaction.reply({ content: `Aguarde um momento...`, ephemeral: true });
        await ms.set(`${interaction.channel.id}.status`, true);
        interaction.editReply({content:`Aprovado com sucesso!`});
    }
}
