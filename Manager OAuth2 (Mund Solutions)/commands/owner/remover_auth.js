const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const {data,db, ms} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require("axios");
const qs = require('qs');



module.exports = {
    name:"remover_auth",
    description:"Delete algum Auth.",
    type: ApplicationCommandType.ChatInput,
    options:[
        {
            name:"bot",
            description:"Selecione o Bot que você deseja deletar.",
            type: ApplicationCommandOptionType.String,
            required:true,
            autocomplete: true,
        }
    ],
    async autocomplete(interaction) {
        const value = interaction.options.getFocused().toLowerCase();
        const obj = (await db.all()).filter(a => a.data.owner !== interaction.user.id);
        const c = (await db.all()).filter(a => a.data.owner === interaction.user.id);

        const filtered = obj.filter((ok) => ok.data.name.toLowerCase().includes(value));
        const filtered2 = obj.filter((ok) => ok.ID.toLowerCase().includes(value));
        const filtered3 = c.filter((ok) => ok.data.name.toLowerCase().includes(value));
        const filtered4 = c.filter((ok) => ok.ID.toLowerCase().includes(value));
    
        const combined = [...new Map([...filtered, ...filtered2, ...filtered3, ...filtered4,].map(item => [item[0], item])).values()].slice(0, 25)
        if (!interaction) return;
        if(interaction.user.id !== owner) {
            return interaction.respond([
                { name: "❌ | Você não tem permissão de usar este comando.", value: "a22139183954312asd92384XASDASDSADASDSADASDASD12398212222" }
            ]);
        } else if (c.length <= 0 && combined.length === 0) {
            await interaction.respond([
                { name: "Você não tem nenhum BOT.", value: "a22139183954312asd92384XASDASDSADASDSADASDASD12398212222" }
            ]);
        } else {
            await interaction.respond(
                combined.map((ok) => ({ name: `🤖 ID: ${ok.ID} | Nome - ${ok.data.name}`, value: ok.ID }))
            );
        }
    },   
    run: async(client, interaction) => {
        const bot = interaction.options.getString("bot");
        const grc = await db.get(`${bot}`);
        if(interaction.user.id !== owner) return interaction.reply({content:`❌ | Você não tem permissão de usar este BOT`, ephemeral:true});
        if(!grc) return interaction.reply({content:`❌ | não existe nenhum bot com o ID: \`${bot}\`.`, ephemeral:true});
        
        const modal = new ModalBuilder()
        .setCustomId(`${bot}_removerauth_modal`)
        .setTitle("Remover Auth");

        const text = new TextInputBuilder()
        .setCustomId("text")
        .setStyle(1)
        .setLabel("você tem certeza?")
        .setPlaceholder("SIM")
        .setMaxLength(3)
        .setMinLength(3)
        .setRequired(true);

        const text1 = new TextInputBuilder()
        .setCustomId("text1")
        .setStyle(1)
        .setLabel("você confirma?")
        .setPlaceholder("CONFIRMO")
        .setMaxLength(8)
        .setMinLength(8)
        .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(text));
        modal.addComponents(new ActionRowBuilder().addComponents(text1));

        return interaction.showModal(modal);
    }}