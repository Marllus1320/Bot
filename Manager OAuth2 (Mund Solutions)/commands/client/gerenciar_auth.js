const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const {data,db, ms} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require("axios");
const qs = require('qs');

module.exports = {
    name:"gerenciar_auth",
    description:"gerencie sua aplicação",
    type: ApplicationCommandType.ChatInput,  
    run: async(client, interaction) => {
        const bot = interaction.options.getString("bot");
        await interaction.reply({content:`Aguarde um momento...`, ephemeral:true});
        const grc = (await db.all()).filter(a => {
            if(a.data?.owner !== interaction.user.id && !a.data.confia?.includes(interaction.user.id)) return false;
			if(a.data.ativo) return false;
            return true;
        });
        if(grc.length <= 0) return interaction.editReply({content:`❌ | Você não tem nenhuma aplicação cadastrada!`, ephemeral:true});
        const select = new StringSelectMenuBuilder().setCustomId(`gerenciar_auth_select`).setMaxValues(1).setPlaceholder("🔧 Selecione o Auth abaixo");
        grc.map((a) => {
            select.addOptions(
                {
                    label:`ID: ${a.ID} | Nome - ${a.data.name.slice(0, 20)}`,
                    description:`👥 Total Verificados: ${a.data.verify.length}`,
                    value:`${a.ID}-${a.data.idbot}`
                }
            )
        });
        await interaction.editReply({
            content:"",
            embeds: [
                new EmbedBuilder()
                .setTitle(" Sistema Auth")
                .setDescription(`- Escolha o **Auth** que você deseja gerenciar`)
                .setAuthor({name:`${interaction.user.username}`, iconURL: interaction.member.displayAvatarURL()})
                .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
				.setImage("https://cdn.discordapp.com/attachments/1251231167479414887/1253913303420239903/1719025293619.png?ex=66783e04&is=6676ec84&hm=f21ea13eb50df9e37da4ddbdc8d9e64692052ee2872c08370d44ca9408497ebb&")
                .setTimestamp()
                .setColor("#2b2d31")
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(select)
            ]
        });


    }}