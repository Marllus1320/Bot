const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const {data,db, ms, serv} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require("axios");
const qs = require('qs');



module.exports = {
    name:"serv-config",
    description:"somente para revendedores.",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({content:`Você não tem permissão de usar este comando.`, ephemeral:true});
        const svs = await serv.get(`${interaction.guild.id}`);
        if(!svs) return interaction.reply({content:`❌ Sua loja ainda não foi criada. Use \`/criar_loja\` para Cria-la!`, ephemeral: true});
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setAuthor({name:`${interaction.user.username}`, iconURL: interaction.member.displayAvatarURL()})
                .setTitle("Configuração do BOT")
                .addFields(
                    {
                        name:"Canais",
                        value:"Canais de logs, canais de vendas, etc."
                    },
                    {
                        name:"Chave PIX",
                        value:"Chave PIX para receber sua comissão."
                    },
                    {
                        name:"Mensagem",
                        value:"Envie o Painel de Membros."
                    },
                )
                .setColor("Blue")
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("canaisconfig")
                    .setLabel("Canais")
                    .setEmoji("<:1225930194427183225:1242266824159133747>")
                    .setStyle(1),
                    new ButtonBuilder()
                    .setCustomId("chavepixconfig")
                    .setLabel("Chave Pix")
                    .setEmoji("<:1225971724580028456:1242266498484015124>")
                    .setStyle(1),
                    new ButtonBuilder()
                    .setCustomId("sendmsgmemberspanel")
                    .setEmoji("<:1220490882239954965:1242270603772297296>")
                    .setLabel("Mensagem")
                    .setStyle(1),
                )
            ],
            ephemeral:true
        });
    }
}