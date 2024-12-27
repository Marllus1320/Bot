const fs = require("fs");
const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, TextInputBuilder, ModalBuilder } = require("discord.js");
const { data, db, ms } = require("../../database/index");
const { owner } = require("../../config.json");

module.exports = {
    name: "anuncio-revenda",
    description: "Anunciar aos revendedores.",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        if (owner !== interaction.user.id) return interaction.reply({ content: `❌ | Você não tem permissão para usar este comando.`, ephemeral: true });
        
        const modal = new ModalBuilder()
        .setCustomId("enviarrevendaanuncioembedmodal")
        .setTitle("Enviar Anuncio aos Revendedores");

        const content = new TextInputBuilder()
        .setCustomId("texto")
        .setLabel("insira o texto")
        .setStyle(2)
        .setPlaceholder("Mensagem que ficara fora da embed")
        .setMaxLength(2000)
        .setRequired(false);

        const title = new TextInputBuilder()
        .setCustomId("title")
        .setLabel("insira o titulo")
        .setStyle(1)
        .setMaxLength(200)
        .setRequired(false);

        const desc = new TextInputBuilder()
        .setCustomId("desc")
        .setLabel("insira a Descrição")
        .setStyle(2)
        .setMaxLength(3024)
        .setRequired(false);

        const banner = new TextInputBuilder()
        .setCustomId("banner")
        .setLabel("insira a url do banner")
        .setStyle(1)
        .setRequired(false);

        const cor = new TextInputBuilder()
        .setCustomId("cor")
        .setLabel("insira a cor da embed")
        .setStyle(1)
        .setMaxLength(200)
        .setRequired(false);

        modal.addComponents(new ActionRowBuilder().addComponents(content));
        modal.addComponents(new ActionRowBuilder().addComponents(title));
        modal.addComponents(new ActionRowBuilder().addComponents(desc));
        modal.addComponents(new ActionRowBuilder().addComponents(banner));
        modal.addComponents(new ActionRowBuilder().addComponents(cor));

        return interaction.showModal(modal);
    }
}
