const Discord = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");
const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const {data,db, ms} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require("axios");
const qs = require('qs');

module.exports = {
    name: "connect",
    description: "Conectar em um canal de voz.",
    options: [
        {
            name: "canal",
            description: "Coloque o canal de voz.",
            type: Discord.ApplicationCommandOptionType.Channel,
            channelTypes: [
                Discord.ChannelType.GuildVoice,
            ],
            required: true
        }
    ],

    run: async (client, interaction) => {

        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
            interaction.reply({ content: `Você não possui permissão para utilzar este comando!`, ephemeral: true })
        } else {

        let canal = interaction.options.getChannel('canal');

        joinVoiceChannel({
            channelId: canal.id,
            guildId: canal.guild.id,
            adapterCreator: canal.guild.voiceAdapterCreator
        })

        const embed = new Discord.EmbedBuilder()
        .setColor('#2f3136')
        .setDescription(`**${interaction.user.username}, conectei no canal de voz: ${canal}**`)

        interaction.reply({ embeds: [embed], ephemeral: true })
    }
  }
}