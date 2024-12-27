const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const {data,db, ms, serv} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require("axios");
const qs = require('qs');



module.exports = {
    name:"canal_crate",
    description:"Cria os canais do bot.",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({content:`Você não tem permissão de usar este comando.`, ephemeral:true});
        const svs = await serv.get(`${interaction.guild.id}`);
        if(svs) return interaction.reply({content:`Já foi criado a sua Loja! use \`/botconfig\` para Configura-lo`, ephemeral: true});
        await interaction.reply({
            content:`Aguarde um momento, estou Criando os Canais...`,
            ephemeral:true
        });
        const categoryMembers = await interaction.guild.channels.create({
            name:"MEMBROS REAIS",
            type: ChannelType.GuildCategory,
            position: 3
        }).catch(() => {return false});
        if(!categoryMembers) return interaction.editReply({content:`Não tenho permissão de criar canais.`, ephemeral:true});
        const channelMember = await interaction.guild.channels.create({
            name:"👥・m3mbros",
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                allow: ["ViewChannel"],
                deny: ["SendMessages"]
              },
              {
                id: interaction.client.user.id,
                allow: ["ViewChannel", "SendMessages"],
              },
              {
                id: interaction.user.id,
                allow: ["ViewChannel", "SendMessages"],
              },
            ],
            parent: categoryMembers.id
        }).then((channel) => {
            channel.send({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`Membros Reais`)
					          .setThumbnail(interaction.guild.iconURL())
                    .setImage("https://cdn.discordapp.com/attachments/1230606844024590437/1234691220182274128/membrosreais.gif?ex=6631a74e&is=663055ce&hm=0a5c0cc18b0bd1fa19c95c8fcd72c7a23209ff3985a8dcdd81dee1d8eb61c1bf&")
                    .setDescription(`## Promoçâo ~~70%  OFF~~ \n **Nichos** \n - Lojas de Valorant.\n- Lojas de Roblox.\n- Lojas de Nitro.\n- Lojas de Bot.\n- Lojas em geral.\n\n Deseja comprar **Membros Reais** para seu servidor pelo menor valor do mercado? \n\n  Adquira abaixo entrega totalmente automática e instantânea!\n\n  Sem risco de banimento, sem risco de perder membros.\n **Qualidade Premium** (Melhor qualidade do mercado) \n\n ** Informaçoes**\n M3mbr0s Reais.\n 100% Brasileiros.\n\n> ** Membros reais, ativos e engajados.**`)
                    .setColor("#2b2d31")
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`revenda_adquirir_membros`)
                        .setLabel("Comprar Membros")
                        .setStyle(3)
                    )
                ]
            });
            return channel;
        });
        const categoryStaff = await interaction.guild.channels.create({
            name:"MEMBROS REAIS",
            type: ChannelType.GuildCategory,
            position: 3
        }).catch(() => {return false});
        if(!categoryStaff) return interaction.editReply({content:`Não tenho permissão de criar canais.`, ephemeral:true});
        const channelvendas = await interaction.guild.channels.create({
            name:"🛒・logs-vendas",
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: ["ViewChannel", "SendMessages"],
              },
              {
                id: interaction.client.user.id,
                allow: ["ViewChannel", "SendMessages"],
              },
              {
                id: interaction.user.id,
                allow: ["ViewChannel", "SendMessages"],
              },
            ],
            parent: categoryStaff.id
        }).then((channel) => {
            channel.send({
                content:`🛒・logs-vendas\n\n**Canal de logs de vendas**\n\nNeste canal, você pode ver todas as logs de vendas que ocorreram no servidor.`
            }).catch(() => {});;
            return channel;
        });

        const channelcarrinho = await interaction.guild.channels.create({
            name:"🎈・logs-carrinho",
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: ["ViewChannel", "SendMessages"],
              },
              {
                id: interaction.client.user.id,
                allow: ["ViewChannel", "SendMessages"],
              },
              {
                id: interaction.user.id,
                allow: ["ViewChannel", "SendMessages"],
              },
            ],
            parent: categoryStaff.id
        }).then((channel) => {
            channel.send({
                content:`🎈・logs-carrinho\n\n**Canal de logs de carrinho**\n\nNeste canal, você pode ver todas as logs de carrinho que ocorreram no servidor.`
            }).catch(() => {});;
            return channel;
        });


        const channelimportante = await interaction.guild.channels.create({
            name:"🎯・importante",
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: ["ViewChannel", "SendMessages"],
              },
              {
                id: interaction.client.user.id,
                allow: ["ViewChannel", "SendMessages"],
              },
              {
                id: interaction.user.id,
                allow: ["ViewChannel", "SendMessages"],
              },
            ],
            parent: categoryStaff.id
        }).then((channel) => {
            channel.send({
                content:`🎯・Importante\n\n**Canal de avisos importantes**\n\nNeste canal, você pode ver todos os avisos importantes que ocorreram no servidor.`
            }).catch(() => {});;
            return channel;
        });
        await serv.set(`${interaction.guild.id}`, {
            channels: {
                membro: channelMember.id,
                vendas: channelvendas.id,
                carrinho: channelcarrinho.id,
                importante: channelimportante.id
            },
            cliente: null,
            chave_pix: null,
            saldo: 0.00
        });
        interaction.editReply({
            content:"",
            embeds: [
                new EmbedBuilder()
                .setDescription(`Todos os Canais foram criados com sucesso!`)
                .setColor("#2b2d31")
            ]
        });
        
    }
}