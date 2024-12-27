const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const {data,db, ms} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require("axios");
const qs = require('qs');



module.exports = {
    name: `infoauth`,
    description: 'Mostra a url do auth',
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction, args) => {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .addFields(
                    {
                        name:"Para que serve?",
                        value:"Para Conectar o seu bot com nossa **API**\nE obrigatorio colocar isso ao bot !"
                    },
                    {   
                        name:"Qual é a URL?",
                        value:`\`\`\`${url}/api/callback\`\`\``
                    }
                )
            ],
            ephemeral:true
        })
    }
}