const Discord = require("discord.js")
const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const {data,db, ms} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require("axios");
const qs = require('qs');

module.exports = {
    name: "fotoauth",
    description: "Envia uma embed com foto.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "titulo",
            description: "escreva o titulo",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "foto",
            description: "envie o link da imagem",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "color",
            description: "mande a cor da embed",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "channel_send",
            description: "Escolha o canal",
            type: Discord.ApplicationCommandOptionType.Channel,
            required: false,
        },
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            interaction.reply({
                content: `Você não possui permissão para utilizar este comando.`,
                ephemeral: true
            })
        } else {

            const channel_send = interaction.options.getChannel("channel_send")  ?? interaction.channel
            const titulo = interaction.options.getString("titulo")
            const foto = interaction.options.getString("foto")
            const color = interaction.options.getString("color")


            const embed = new Discord.EmbedBuilder()
                .setColor(`${color}`)
                .setImage(`${foto}`)
                .setTitle(`${titulo}`)


            interaction.reply({ 
                content: `Aviso enviado com sucesso!`, 
                ephemeral: true 
            })

            channel_send.send({
                embeds: [embed]
            })

        }
    }
}
