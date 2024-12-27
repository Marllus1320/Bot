const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder, UserSelectMenuBuilder, WebhookClient, ChannelType, AttachmentBuilder } = require("discord.js");
const { db, data, ms, serv} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require('axios');
const qs = require('qs');
const https = require('https');
const fs = require('fs');
const DiscordOauth2 = require("discord-oauth2");
const oauth2 = new DiscordOauth2();
const moment1 = require('moment-timezone');
const cooldowns = new Map();
const mercadopago = require("mercadopago");
const moment = require("moment");



module.exports = {
    name:"interactionCreate", 
    run: async( interaction, client) => {
        const {customId, guild, user, member} = interaction;
        if(!customId) return;
        if(customId === "canaisconfig") return mainchannels();
        if(customId === "voltarkkk1235") {
            interaction.update({
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
                        .setEmoji("<:faq_vex:1242291444736069716>")
                        .setStyle(1),
                        new ButtonBuilder()
                        .setCustomId("chavepixconfig")
                        .setLabel("Chave Pix")
                        .setEmoji("<:1225971724580028456:1242266498484015124>")
                        .setStyle(1),
                        new ButtonBuilder()
                        .setCustomId("sendmsgmemberspanel")
                        .setLabel("Mensagem")
                        .setEmoji("<:1220490882239954965:1242270603772297296>")
                        .setStyle(1),
                    )
                ],
                ephemeral:true
            });
        }
        if(customId === "sendmsgmemberspanel"){
            const modal = new ModalBuilder()
            .setCustomId(`sendmsgmemberpanelmodal`)
            .setTitle("Enviar Painel de Membros");

            const title = new TextInputBuilder()
            .setCustomId("title")
            .setLabel("Insira o Título")
            .setStyle(1)
            .setMaxLength(200)
            .setRequired(false);

            const desc = new TextInputBuilder()
            .setCustomId("desc")
            .setLabel("Insíra a descrição")
            .setStyle(2)
            .setMaxLength(3000)
            .setRequired(false);

            const color = new TextInputBuilder()
            .setCustomId("color")
            .setLabel("Insira a Cor da Embed")
            .setStyle(1)
            .setMaxLength(20)
            .setRequired(false);

            const banner = new TextInputBuilder()
            .setCustomId("banner")
            .setLabel("Insira o Banner")
            .setStyle(1)
            .setRequired(false);

            const button = new TextInputBuilder()
            .setCustomId("button")
            .setLabel("Insira o texto do botão")
            .setStyle(1)
            .setMaxLength(200)
            .setRequired(false);
        

            modal.addComponents(new ActionRowBuilder().addComponents(title));
            modal.addComponents(new ActionRowBuilder().addComponents(desc));
            modal.addComponents(new ActionRowBuilder().addComponents(color));
            modal.addComponents(new ActionRowBuilder().addComponents(banner));
            modal.addComponents(new ActionRowBuilder().addComponents(button));

            return interaction.showModal(modal);
        }
        if(customId === "sendmsgmemberpanelmodal") {
            const title = interaction.fields.getTextInputValue("title") || "Membros Reais";
            const desc = interaction.fields.getTextInputValue("desc") || "## Promoçâo ~~70%  OFF~~ \n **Nichos** \n - Lojas de Valorant.\n- Lojas de Roblox.\n- Lojas de Nitro.\n- Lojas de Bot.\n- Lojas em geral.\n\nDeseja comprar **Membros Reais** para seu servidor pelo menor valor do mercado? \n\n  Adquira abaixo entrega totalmente automática e instantânea!\n\n  Sem risco de banimento, sem risco de perder membros.\n **Qualidade Premium** (Melhor qualidade do mercado) \n\n **<:lupa:1242270238746218531> Informaçoes**\n  M3mbr0s Reais.\n  100% Brasileiros.\n\n> ** Membros reais, ativos e engajados.**";
            const color = interaction.fields.getTextInputValue("color") || "#2b2d31";
            const banner = interaction.fields.getTextInputValue("banner") || null;
            const button = interaction.fields.getTextInputValue("button") || "Comprar Membros";

            await interaction.reply({content:`Aguarde um momento...`, ephemeral:true});
            try {
                const channel_membro = guild.channels.cache.get(`${await serv.get(`${guild.id}.channels.membro`)}`);
                if(!channel_membro) return interaction.reply({content:`Configure o Canal de Membros.`, ephemeral:true});
                await channel_membro.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`${title}`)
                        .setDescription(desc)
						.setThumbnail(interaction.guild.iconURL())
                        .setColor(color)
                        .setImage(banner)
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId(`revenda_adquirir_membros`)
                            .setLabel(button)
                            .setStyle(3)
                        )
                    ]
                }).then(() => {
                    interaction.editReply({content:`Enviado com sucesso no Canal: ${channel_membro}`});
                }).catch(() => {
                    interaction.editReply({content:`Verifique se você colocou tudo Certo (Banner, Cor...)`});
                })
            } catch {
                interaction.editReply({content:`Verifique se você colocou tudo Certo (Banner, Cor...)`});
            }
        }
        if(customId === "chavepixconfig") {
            const modal = new ModalBuilder()
            .setCustomId("chavepixmodal")
            .setTitle("Configurar Chave Pix");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setLabel("Qual é a sua chave pix?")
            .setRequired(true)
            .setMinLength(4);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if(customId === "chavepixmodal") {
            const text = interaction.fields.getTextInputValue("text");
            await serv.set(`${guild.id}.chave_pix`, text);
            interaction.reply({
                content:`✔ Sua Chave Pix foi alterada com Sucesso!\n- Chave Pix Atual: \`${text}\``,
                ephemeral:true
            });
        }
        if(customId === "editcanaisconfig") {
            const type = interaction.values[0];
            if(type === "cliente") {
                const modal =new ModalBuilder()
                .setCustomId(`configrolesedit`)
                .setTitle("Configurar Cargo de Cliente");

                const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setLabel("Coloque o id do cargo")
                .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            } else {
                const modal =new ModalBuilder()
                .setCustomId(`${type}_configchanneledit`)
                .setTitle("Configurar Canal");

                const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setLabel("Coloque o id do Canal Selecionado")
                .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            }
        }
        if(customId === "configrolesedit") {
            const role = interaction.guild.roles.cache.get(interaction.fields.getTextInputValue("text"));
            if(!role) {
                await mainchannels();
                return interaction.followUp({content:`❌ | Cargo não existente.`, ephemeral:true});
            }
            await serv.set(`${guild.id}.cliente`, role.id);
            mainchannels();
        }
        if(customId.endsWith("_configchanneledit")) {
            const type = customId.split("_")[0];
            const channel = interaction.guild.channels.cache.get(interaction.fields.getTextInputValue("text"));
            if(!channel) {
                await mainchannels();
                return interaction.followUp({content:`❌ | Canal não existente.`, ephemeral:true});
            }
            await serv.set(`${guild.id}.${type}`, channel.id);
            mainchannels();
        }
        async function mainchannels() {
            const server = await serv.get(`${guild.id}`);
            const channels = server.channels;
            const cart = guild.channels.cache.get(channels.carrinho);
            const vendas = guild.channels.cache.get(channels.vendas);
            const membro = guild.channels.cache.get(channels.membro);
            const importante = guild.channels.cache.get(channels.importante);
            const cliente = guild.roles.cache.get(server.cliente);
            await interaction.update({
                content:"",
                embeds: [
                    new EmbedBuilder()
                    .setColor("Blue")
                    .setAuthor({name:`${interaction.user.username}`, iconURL: interaction.member.displayAvatarURL()})
                    .setTitle("Configuração dos Canais")
                    .addFields(
                        {
                            name:"#️⃣ Log de Carrinhos",
                            value:`${cart ? `\`${cart.name}\` - (\`${cart.id}\`)` : "`Não Definido`"}`
                        },
                        {
                            name:"#️⃣ Log de vendas:",
                            value:`${vendas ? `\`${vendas.name}\` - (\`${vendas.id}\`)` : "`Não Definido`"}`
                        },
                        {
                            name:"#️⃣ Painel de Membros:",
                            value:`${membro ? `\`${membro.name}\` - (\`${membro.id}\`)` : "`Não Definido`"}`
                        },
                        {
                            name:"#️⃣ Canal Importante:",
                            value:`${importante ? `\`${importante.name}\` - (\`${importante.id}\`)` : "`Não Definido`"}`
                        },
                        {
                            name:"🛡️ Cargo de Cliente:",
                            value:`${cliente ? `\`${cliente.name}\` - (\`${cliente.id}\`)` : "`Não Definido`"}`
                        },
                    )
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                        .setCustomId("editcanaisconfig")
                        .setMaxValues(1)
                        .setPlaceholder("Edite o seu Bot")
                        .addOptions(
                            {
                                label:"Log de Carrinhos",
                                value:"carrinho"
                            },
                            {
                                label:"Log de Vendas",
                                value:"vendas"
                            },
                            {
                                label:"Log de Membros",
                                value:"membro"
                            },
                            {
                                label:"Canal Importante",
                                value:"importante"
                            },
                            {
                                label:"Cargo de Cliente",
                                value:"cliente"
                            },
                        )
                    ),
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("voltarkkk1235")
                        .setLabel("Voltar")
                        .setEmoji("⬅️")
                        .setStyle(2)
                    )
                ]
            });
        }
    }}