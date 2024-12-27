const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType } = require("discord.js");
const {} = require("../../database/index");
const {owner} = require("../../config.json");


module.exports = {
    name:"set",
    description:"Setar mensagem de venda",
    type: ApplicationCommandType.ChatInput,
    options:[
        {
            name:"tipo",
            description:"Qual mensagem você vai enviar?",
            type:ApplicationCommandOptionType.String,
            choices: [
                { name:"Mensagem para Vender Membros", value:"membros"},
                { name: "Mensagem para Vender o Auth", value:"venda"}
            ],
            required:true
        }
    ],
    run: async(client, interaction) => {
        const type = interaction.options.getString("tipo");
        if(owner !== interaction.user.id) return interaction.reply({content:`❌ | Você não tem permissão para usar este comando.`, ephemeral:true});
        const modal = new ModalBuilder()
        .setTitle("Enviar mensagem de Venda")
        .setCustomId(`${type}_message_modal`);

        const text = new TextInputBuilder()
        .setCustomId("content")
        .setStyle(2)
        .setMaxLength(4000)
        .setLabel("Content")
        .setPlaceholder("Oque fica em cima da mensagem")
        .setRequired(true);

        const preview = new TextInputBuilder()
        .setCustomId("preview")
        .setLabel("Link da Preview")
        .setStyle(1)
        .setRequired(false);

        const banner = new TextInputBuilder()
        .setCustomId("banner")
        .setLabel("Banner")
        .setStyle(1)
        .setRequired(false)
        .setPlaceholder("Banner da Embed");

        const button = new TextInputBuilder()
        .setCustomId("button")
        .setStyle(1)
        .setRequired(false)
        .setPlaceholder("Texto do Botão")
        .setMaxLength(25)
        .setLabel("Botão");

        modal.addComponents(new ActionRowBuilder().addComponents(text));
        modal.addComponents(new ActionRowBuilder().addComponents(preview));
        modal.addComponents(new ActionRowBuilder().addComponents(banner));
        modal.addComponents(new ActionRowBuilder().addComponents(button));

        return interaction.showModal(modal);
    }
}