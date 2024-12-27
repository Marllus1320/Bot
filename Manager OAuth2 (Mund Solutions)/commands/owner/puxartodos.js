const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder } = require("discord.js");
const {} = require("../../database/index");
const {owner} = require("../../config.json");


module.exports = {
    name:"puxartodos",
    description:"Puxe Todos os Usuarios.",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        
        if(owner !== interaction.user.id) return interaction.reply({content:`❌ | Você não tem permissão para usar este comando.`, ephemeral:true});
        interaction.reply({
            content:`- Você já Adicionou Todos os Bots?\n - Se Sim, Clique no Botão Abaixo\n - Se Não, Use \`/authselecao\` e adicione todos os Bots`,
            ephemeral:true,
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("puxarmembrosall")
                    .setLabel("Puxar Todos os Usuários")
                    .setStyle(2)
                    .setEmoji("<:members:1216217569384730775>")
                )
            ]
        })
    }
}