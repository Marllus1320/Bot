const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const {data,db, ms, serv} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require("axios");
const qs = require('qs');



module.exports = {
    name:"linkbot-loja",
    description:"Pegue o link de adicionar o bot.",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
		interaction.reply({
			content:` Clique no botão abaixo para adicionar o bot.`,
			components: [
				new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
					.setStyle(5)
					.setLabel("Adicionar o Bot")
					.setURL("https://discord.com/oauth2/authorize?client_id=1249049796845764638&permissions=8&integration_type=0&scope=bot")
				)
			],
			ephemeral:true
		});
	}}