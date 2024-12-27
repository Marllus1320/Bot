const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const {data,db, ms, serv} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require("axios");
const qs = require('qs');



module.exports = {
    name:"sacar",
    description:"Resgate a sua quantia de dinheiro do bot.",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({content:`Você não tem permissão de usar este comando.`, ephemeral:true});
        const svs = await serv.get(`${interaction.guild.id}`);
        if(!svs) return interaction.reply({content:`Sua loja ainda não foi criada. Use \`/criar_loja\` para Cria-la!`, ephemeral: true});
        const saldo = svs.saldo;
        if(saldo <= 1) return interaction.reply({content:`❌ Você só pode sacar acima de \`R$ 1,00\`.`, ephemeral:true});
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle("Saque de Saldo")
                .setDescription(`<:lupa:1242270238746218531> Você deseja sacar **R$ ${Number(saldo).toFixed(2)}** da sua carteira do bot?`)
                .setColor("Blue")
                .addFields(
                    {
                        name:"<:1225742791238352920:1242278250038951987> Saldo Disponível",
                        value:`**\`R$ ${Number(saldo).toFixed(2)}\`**`
                    },
                    {
                        name:"<:1225971724580028456:1242266498484015124> Chave PIX",
                        value:`\`${svs.chave_pix ? `${svs.chave_pix}` : "N/A"}\``
                    }
                )
                .setFooter({text:`Responsável pelo Saque・Pps0biel `, iconURL: interaction.client.user.avatarURL()})
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`sacarbutton`)
                    .setLabel("Sacar o Dinheiro")
                    .setStyle(1)
                    .setEmoji("<:qr:1208802630298771467>")
                )
            ],
            ephemeral:true
        });
    }
}