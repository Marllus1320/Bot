const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder, UserSelectMenuBuilder, WebhookClient, ChannelType, AttachmentBuilder } = require("discord.js");
const { db, data, ms} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require('axios');
const qs = require('qs');
const https = require('https');
const fs = require('fs');




module.exports = {
    name:"interactionCreate", 
    run: async( interaction, client) => {
        const customId = interaction.customId;
        if(!customId) return;
        if(customId === "config_select") {
            const values = interaction.values[0];
            if(values === "porcentagem") {
                const modal = new ModalBuilder()
                .setCustomId("porcentagensmodal")
                .setTitle("Alterar Porcentagens");

                const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setLabel("Porcentagens:")
                .setPlaceholder("40/20")
                .setMaxLength(5)
                .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            }
            if(values === "logs") {
                const modal = new ModalBuilder()
                .setCustomId("channellogsmodal")
                .setTitle("Alterar Canal de Logs");

                const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setLabel("Canal de logs:")
                .setRequired(true);

                const text1 = new TextInputBuilder()
                .setCustomId("text1")
                .setStyle(1)
                .setLabel("canal de saques:")
                .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));
                modal.addComponents(new ActionRowBuilder().addComponents(text1));

                return interaction.showModal(modal);
            }
            if(values === "acesstoken") {
                const modal = new ModalBuilder()
                .setCustomId("acesstoken_modal")
                .setTitle("Alterar Acess-Token");

                const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setLabel("Coloque o novo acesstoken:")
                .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            }
            if(values === "bio") {
                const modal = new ModalBuilder()
                .setCustomId("bio_modal")
                .setTitle("Alterar Biografia Padrão");

                const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(2)
                .setLabel("Coloque a nova descrição:")
                .setRequired(true)
                .setMaxLength(350);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            }
            if(values === "adicionais") {
                const modal = new ModalBuilder()
                .setCustomId("adicionais_modal")
                .setTitle("Alterar Preço Adicionais");
                const adicionais = await data.get("adicionais");

                const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setLabel("Remoção da Divulgação")
                .setValue(`${adicionais.div}`)
                .setRequired(true);

                const text1 = new TextInputBuilder()
                .setCustomId("text1")
                .setStyle(1)
                .setLabel("Suporte Prioritario")
                .setValue(`${adicionais.suporte}`)
                .setRequired(true);

                const text2 = new TextInputBuilder()
                .setCustomId("text2")
                .setStyle(1)
                .setLabel("Cooldown de Puxada")
                .setValue(`${adicionais.cooldown}`)
                .setRequired(true);

                const text3 = new TextInputBuilder()
                .setCustomId("text3")
                .setStyle(1)
                .setLabel("Capturar Email:")
                .setValue(`${adicionais.email}`)
                .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));
                modal.addComponents(new ActionRowBuilder().addComponents(text1));
                modal.addComponents(new ActionRowBuilder().addComponents(text2));
                modal.addComponents(new ActionRowBuilder().addComponents(text3));

                return interaction.showModal(modal);
            }
            if(values === "planos") {
                const modal = new ModalBuilder()
                .setCustomId("planos_modal")
                .setTitle("Alterar Preço dos Planos");
                const planos = await data.get("bot");

                const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setLabel("Preço Mensal:")
                .setValue(`${planos.mensal}`)
                .setRequired(true);

                const text1 = new TextInputBuilder()
                .setCustomId("text1")
                .setStyle(1)
                .setLabel("Preço Quinzenal:")
                .setValue(`${planos.quinzenal}`)
                .setRequired(true);

                const text2 = new TextInputBuilder()
                .setCustomId("text2")
                .setStyle(1)
                .setLabel("Preço Semanal:")
                .setValue(`${planos.semanal}`)
                .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));
                modal.addComponents(new ActionRowBuilder().addComponents(text1));
                modal.addComponents(new ActionRowBuilder().addComponents(text2));

                return interaction.showModal(modal);
            }
            if(values === "members") {
                const modal = new ModalBuilder()
                .setCustomId("members_modal")
                .setTitle("Configurar Membros");
                const membros = await data.get("membros");

                const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setLabel("Valor:")
                .setValue(`${Number(membros.valor).toFixed(2)}`)
                .setRequired(true);

                const text1 = new TextInputBuilder()
                .setCustomId("text1")
                .setStyle(1)
                .setLabel("Quantidade minima:")
                .setValue(`${membros.minimo}`)
                .setRequired(true);

                const text2 = new TextInputBuilder()
                .setCustomId("text2")
                .setStyle(1)
                .setLabel("Valor da reposição:")
                .setValue(`${membros.reposicao}`)
                .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));
                modal.addComponents(new ActionRowBuilder().addComponents(text1));
                modal.addComponents(new ActionRowBuilder().addComponents(text2));

                return interaction.showModal(modal);
            }
            if(values === "cliente") {
                const modal = new ModalBuilder()
                .setCustomId(`cliente_modal`)
                .setTitle("Cargo de Cliente");

                const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setLabel("coloque o novo cargo de cliente:")
                .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            }
        }
        if(customId === "cliente_modal") {
            const text = interaction.fields.getTextInputValue("text");
            const rol = interaction.guild.roles.cache.get(text);
            if(!rol) return interaction.reply({content:`❌ | Coloque um Cargo Valido!`, ephemeral:true});
            await data.set("cliente", text);
            main();
        }
        if(customId === "members_modal") {
            const text = parseFloat(interaction.fields.getTextInputValue("text")).toFixed(2);
            const text1 = parseInt(interaction.fields.getTextInputValue("text1"));
            const text2 = parseFloat(interaction.fields.getTextInputValue("text2")).toFixed(2);
            if(isNaN(text)) return interaction.reply({content:`❌ | Coloque um Numero Valido no Valor`, ephemeral:true});
            if(text <= 0) return interaction.reply({content:`❌ | Coloque um Valor Acima de 0 no Valor`,ephemeral: true});
            
            if(isNaN(text1)) return interaction.reply({content:`❌ | Coloque um Numero Valido na Quantidade Minima`, ephemeral:true});
            if(text1 <= 0) return interaction.reply({content:`❌ | Coloque um Valor Acima de 0 na Quantidade Minima`, ephemeral:true});
            
            if(isNaN(text2)) return interaction.reply({content:`❌ | Coloque um Numero Valido no Valor da Reposição`, ephemeral:true});
            if(text2 <= 0) return interaction.reply({content:`❌ | Coloque um Valor Acima de 0 no Valor da Reposição`, ephemeral:true});
            await data.set("membros", {
                valor: Number(text),
                minimo: String(text1),
                reposicao: Number(text2)
            });
            main();
            
        }
        if(customId === "planos_modal") {
            const text = parseFloat(interaction.fields.getTextInputValue("text")).toFixed(2);
            const text1 = parseFloat(interaction.fields.getTextInputValue("text1")).toFixed(2);
            const text2 = parseFloat(interaction.fields.getTextInputValue("text2")).toFixed(2);
            if(isNaN(text)) return interaction.reply({content:`❌ | Coloque um Numero Valido no Plano Mensal`, ephemeral:true});
            if(text <= 0) return interaction.reply({content:`❌ | Coloque um Valor Acima de 0 no Plano Mensal`,ephemeral: true});
            
            if(isNaN(text1)) return interaction.reply({content:`❌ | Coloque um Numero Valido no Plano Quinzenal`, ephemeral:true});
            if(text1 <= 0) return interaction.reply({content:`❌ | Coloque um Valor Acima de 0 no Plano Quinzenal`, ephemeral:true});
            
            if(isNaN(text2)) return interaction.reply({content:`❌ | Coloque um Numero Valido no Plano Semanal`, ephemeral:true});
            if(text2 <= 0) return interaction.reply({content:`❌ | Coloque um Valor Acima de 0 no Plano Semanal`, ephemeral:true});
            

            await data.set("bot", {
                "mensal": Number(text).toFixed(2),
                "quinzenal": Number(text1).toFixed(2),
                "semanal": Number(text2).toFixed(2)
            });
            main();
        }
        if(customId === "adicionais_modal") {
            const text = parseFloat(interaction.fields.getTextInputValue("text")).toFixed(2);
            const text1 = parseFloat(interaction.fields.getTextInputValue("text1")).toFixed(2);
            const text2 = parseFloat(interaction.fields.getTextInputValue("text2")).toFixed(2);
            const text3 = parseFloat(interaction.fields.getTextInputValue("text3")).toFixed(2);
            if(isNaN(text)) return interaction.reply({content:`❌| Coloque um Numero nos Preços de Divulgação.`, ephemeral:true});
            if(text <= 0) return interaction.reply({content:`❌ | Coloque um Numero acima de **0** nos Preços de Divulgação.`, ephemeral:true});
            
            if(isNaN(text1)) return interaction.reply({content:`❌ | Coloque um Numero nos Preços de Suporte.`, ephemeral:true});
            if(text1 <= 0) return interaction.reply({content:`❌ | Coloque um Numero acima de **0** nos Preços de Suporte.`, ephemeral:true});
            
            if(isNaN(text2)) return interaction.reply({content:`❌ | Coloque um Numero nos Preços de Cooldown.`, ephemeral:true});
            if(text2 <= 0) return interaction.reply({content:`❌ | Coloque um Numero acima de **0** nos Preços de Cooldown.`, ephemeral:true});
            
            if(isNaN(text3)) return interaction.reply({content:`❌ | Coloque um Numero nos Preços de Capturar Email.`, ephemeral:true});
            if(text3 <= 0) return interaction.reply({content:`❌ | Coloque um Numero acima de **0** nos Preços de Capturar Email.`, ephemeral:true});

            await data.set(`adicionais`,{
                "div": Number(text).toFixed(2),
                "suporte": Number(text1).toFixed(2),
                "cooldown": Number(text2).toFixed(2),
                "email":Number(text3).toFixed(2)
            });
            main();
            
        }
        if(customId === "bio_modal") {
            const text = interaction.fields.getTextInputValue("text");
            await data.set(`bio`, text);
            main();
        }
        if(customId === "acesstoken_modal") {
            const text = interaction.fields.getTextInputValue("text");
            await data.set(`acesstoken`, text);
            main();
        }
        if(customId === "channellogsmodal") {
            const text = interaction.client.channels.cache.get(interaction.fields.getTextInputValue("text"));
            const text1 = interaction.client.channels.cache.get(interaction.fields.getTextInputValue("text1"));
            if(!text) return interaction.reply({content:`Canal de Logs não encontrado.`, ephemeral:true});
            if(!text1) return interaction.reply({content:`Canal de Saques não encontrado.`, ephemeral:true});
            await data.set(`logs`, text.id);
            await data.set(`saque`, text1.id);
            main();
        }
        if(customId === "porcentagensmodal") {
            const text = parseFloat(interaction.fields.getTextInputValue("text")).toFixed(2);
            if(isNaN(text)) return interaction.reply({content:`Coloque numeros Validos!`, ephemeral:true});
            await data.set(`porcentagem`, Number(text));
            main();
        }

        async function main() {
            const role = interaction.guild.roles.cache.get(await data.get("cliente")) || "`Não Configurado`";
            const logs = interaction.guild.channels.cache.get(await data.get("logs")) || "`Não Configurado`";
            const saque = interaction.guild.channels.cache.get(await data.get("saque")) || "`Não Configurado`";

            
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`Painel de Gerenciamento`)
                    .setColor("#ff1900")
                    .setDescription(`Porcentagem Revenda de Membros: ${await data.get(`porcentagem`)}%\n Canal de Saques: ${saque}\n Canal de Logs: ${logs}\n Cargo de Cliente: ${role}\n**Acess-token** ||${await data.get(`acesstoken`)}||\n**Biografia Padrão:** ${await data.get("bio")}\n\n**Preço dos Adicionais:**\n - Remoção de Divulgação:\`R$ ${await data.get("adicionais.div")}\`\n - Suporte Prioritario: \`R$ ${await data.get("adicionais.suporte")}\`\n - Cooldown dê Puxada: \`R$ ${await data.get("adicionais.cooldown")}\`\n - Capturar E-mails \`R$ ${await data.get("adicionais.email")}\`\n\n**Preço Dos Planos**: \n - Mensal: \`R$ ${await data.get("bot.mensal")}\`\n - Quinzenal: \`R$ ${await data.get("bot.quinzenal")}\`\n - Semanal: \`R$ ${await data.get("bot.semanal")}\`\n\n**Membros:**\n - Valor(Unidade): R$${Number(await data.get("membros.valor")).toFixed(2)}\n - Quantidade Minima: \`${await data.get("membros.minimo")} Membros\`\n - Reposição: ${Number(await data.get("membros.reposicao")).toFixed(2)}`)
                    .setThumbnail(interaction.client.user.displayAvatarURL())
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder() 
                        .setCustomId("config_select")
                        .setPlaceholder("Selecione qual opção você deseja configurar")
                        .setMaxValues(1)
                        .addOptions(
                            {
                                label:"Configurar Porcentagem",
                                value:"porcentagem",
                            },
                            {
                                label:"Configurar Canal de Logs",
                                value:"logs",
                            },
                            {
                                label:"Configurar Cargo de cliente",
                                value:"cliente",
                            },
                            {
                                label:"Configurar Acess-Token",
                                value:"acesstoken",
                            },
                            {
                                label:"Configurar Biografia",
                                value:"bio"
                            },
                            {
                                label:"Configurar Preços dos Adicionais",
                                value:"adicionais"
                            },
                            {
                                label:"Configurar Preços dos Planos",
                                value:"planos"
                            },
                            {
                                label:"Configurar Membros",
                                value:"members"
                            }
                        )
                    )
                ],
                ephemeral:true
            });
        }
    }}