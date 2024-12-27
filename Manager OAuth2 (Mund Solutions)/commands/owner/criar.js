const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("discord.js");
const {} = require("../../database/index");
const {owner} = require("../../config.json");


module.exports = {
    name:"criar",
    description:"Criar uma nova aplicação.",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(owner !== interaction.user.id) return interaction.reply({content:`❌ | Você não tem permissão para usar este comando.`, ephemeral:true});
        const modal = new ModalBuilder()
        .setCustomId(`criar_app`)
        .setTitle("🔎 - Crie uma Aplicação para Auth");


        const text = new TextInputBuilder()
        .setCustomId("text")
        .setStyle(1)
        .setLabel("token do bot")
        .setRequired(true)
        .setPlaceholder("MTE....");

        const text1 = new TextInputBuilder()
        .setCustomId("text1")
        .setLabel("secret do bot")
        .setRequired(true)
        .setStyle(1);

        const text3 = new TextInputBuilder()
        .setCustomId("text3")
        .setLabel("Nome da Aplicação")
        .setStyle(1)
        .setPlaceholder("Qual será o nome da aplicação?")
        .setRequired(true);

        const text2 = new TextInputBuilder()
        .setCustomId("text2")
        .setLabel("ID do usuario")
        .setStyle(1)
        .setPlaceholder("ID do Usuario que terá a aplicação.")
        .setRequired(true)
        .setValue(`${interaction.user.id}`);
        
        const text4 = new TextInputBuilder()
        .setCustomId("text4") 
        .setLabel("plano")
        .setStyle(1)
        .setPlaceholder("mensal, semanal, quinzenal")
        .setMinLength(6)
        .setMaxLength(9)
        .setRequired(true)

        modal.addComponents(new ActionRowBuilder().addComponents(text));
        modal.addComponents(new ActionRowBuilder().addComponents(text1));
        modal.addComponents(new ActionRowBuilder().addComponents(text3));
        modal.addComponents(new ActionRowBuilder().addComponents(text2));
        modal.addComponents(new ActionRowBuilder().addComponents(text4));

        return interaction.showModal(modal);
    }
}