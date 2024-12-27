const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder, UserSelectMenuBuilder, WebhookClient, ChannelType, AttachmentBuilder, Embed } = require("discord.js");
const { db, data, ms} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require('axios');
const qs = require('qs');
const https = require('https');
const fs = require('fs');
const moment1 = require('moment-timezone');
const mercadopago = require("mercadopago");



module.exports = {
    name:"interactionCreate", 
    run: async( interaction, client) => {
        const customId = interaction.customId;
        if(!customId) return;
        if(customId.endsWith("_removerauth_modal")) {
            const text = interaction.fields.getTextInputValue("text");
            const text1 = interaction.fields.getTextInputValue("text1");
            const id = customId.split("_")[0];
            if(text === "SIM" && text1 === "CONFIRMO") {
                await interaction.reply({content:`Deletando o Auth com ID: \`${id}\``, ephemeral:true});
                await db.delete(`${id}`);
                interaction.editReply({content:`✅ | Deletado com sucesso!`, ephemeral:true});
            } else {
                interaction.reply({content:`✅ | Cancelado com sucesso!`, ephemeral:true});
            }
        }
        if(customId === "venda_message_modal") {
            const content = interaction.fields.getTextInputValue("content") || null;
            const preview = interaction.fields.getTextInputValue("preview") || null;
            const banner = interaction.fields.getTextInputValue("banner") || null;
            const button = interaction.fields.getTextInputValue("button") || "Adquirir";

            await interaction.reply({content:`Aguarde um momento...`, ephemeral:true});
            const files = [];
			if(banner) {
				const a = new AttachmentBuilder(banner);
				files.push(a);
			}
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("adquirir_auth")
                .setLabel(button)
                .setStyle(3)
            );
            if(preview) {
                row.addComponents(
                    new ButtonBuilder()
                    .setURL(`${preview}`)
                    .setLabel("Preview")
                    .setEmoji("👀")
                    .setStyle(5)
                )
            }
            await interaction.channel.send({
                content,
                components: [row],
                files
            }).then(() => {
				interaction.editReply({content:`✅ | Enviado com sucesso!`});
			}).catch((err) => {
                return interaction.editReply({content:`❌ | Ocorreu um erro...\n\n- Mensagem do Erro: \`${err.message}\``});
            });
            
        }
        if(customId === "adquirir_auth") {
            const asd = interaction.channel.threads.cache.find(x => x.name === `🛒・${interaction.user.username}・${interaction.user.id}`);
            if(asd) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription(`❌ Você já tem um carrinho aberto em ${asd.url}`)
                        .setColor("Red")
                    ],
                    ephemeral:true
                });
                return asd.send({content:`${interaction.user}`}).then((msg) => {msg.delete().catch(() => {})});
            }
            await interaction.reply({content:`Aguarde um momento...`, ephemeral:true});
            const thread = await interaction.channel.threads.create({
                name:`🛒・ ${interaction.user.username}・${interaction.user.id}`,
                autoArchiveDuration: 60,
                type: ChannelType.PrivateThread,
                reason: `Comprar AUTH`,
            });
            const preco = await data.get("bot");
            await thread.send({
                content:`${interaction.user}`,
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({ name: `Carrinho de ${interaction.user.username}`, iconURL: 'https://cdn.discordapp.com/emojis/1242465776703901706.png?size=2048' })
                    .setTitle("Seja Bem Vindo Ao Seu Carrinho")
                    .setDescription(`** - ${interaction.user.username} Seja Bem Vindo ao seu carrinho adicione um prazo de duração para o seu bot \n - Adquira o Nosso auth Tenha o beckup de seus membros **`)
                    .setColor("#0dff00")
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                        .setPlaceholder("Escolha o Plano")
                        .setCustomId("escolher_plano")
                        .setMaxValues(1)
                        .addOptions(
                            {
                                label:"Mensal",
                                description:`💸 Valor: R$ ${Number(preco.mensal).toFixed(2).replace(".", ",")} | Duração: 30 Dias`,
                                emoji:"<:cedulas:1242468090898415696>",
                                value:"mensal"
                            },
                            {
                                label:"Quinzenal",
                                description:`💸 Valor: R$ ${Number(preco.quinzenal).toFixed(2).replace(".", ",")} | Duração: 15 Dias`,
                                emoji:"<:cedulas:1242468090898415696>",
                                value:"quinzenal"
                            },
                            {
                                label:"Semanal",
                                description:`💸 Valor: R$ ${Number(preco.semanal).toFixed(2).replace(".", ",")} | Duração: 7 Dias`,
                                emoji:"<:cedulas:1242468090898415696>",
                                value:"semanal"
                            },
                        )
                    )
                ]
            });
            interaction.editReply({
                content:"", 
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`Seu carrinho foi criado com sucesso ${thread.url}`)
                    .setColor("Green")
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setStyle(5)
                        .setLabel("Ir ao Carrinho")
						.setEmoji("<:discotoolsxyzicon33:1252724505797722152>")
                        .setURL(thread.url)
                    )
                ]
            });
            const channel_ws = interaction.client.channels.cache.get(await data.get("logs"));
            if(channel_ws) channel_ws.send({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`Novo Carrinho Aberto (Bot)`)
                    .setDescription(`**Usuário:** \n ${interaction.user} \n **Carrinho:** \n ${thread.url} \n **Horário:** \n <t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/ 1000)}:R>)`)
                    .setColor("Green")
                    .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                    .setTimestamp()
                ]
            });
        }
        if(customId === "escolher_plano") {
            const prano = interaction.values[0];
            const channel = interaction.channel;
            await ms.set(`${channel.id}`, {
                plano: prano,
                adicionais: [],
            });
            const ae = {
                "mensal": 30,
                "quinzenal": 15,
                "semanal": 7,
            }
            const preco = await data.get("adicionais");
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({ name: `Carrinho de ${interaction.user.username}`, iconURL: 'https://cdn.discordapp.com/emojis/1264969994543042661.png?size=2048' })
                    .setTitle("Finalizando pedido")
                    .setDescription(`- **Certo ${interaction.user.username} Deseja adicionar ao seu carrinho algum adicional**\n - abaixo tera a explicação dos adicionais\n - **Adicional de suporte prioritário 24/7**\n - Tenha suporte 24/7\n - **Adicional de remoção da divulgação**\n - Configre a bio do seu bot Auth como quiser!\n - **Adicional de remover o cooldown**\n - Sem esse adicional você terá um cooldown de 2h pra puxar membros\n - Com o adicional, você pode puxar os membros a qualquer momento!\n - **Adicional de capturar e-mail dos usuários**\n - Capture o e-mail de todos os usuários que logarem no seu auth!\n - **Resumo do seu Carrinho**\n- Plano ${prano}: R$ ${Number(await data.get(`bot.${prano}`)).toFixed(2).replace(".",",")}\n- **Total:** R$ ${Number(await data.get(`bot.${prano}`)).toFixed(2).replace(".",",")}`)
                    .setColor("#13f502")
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                        .setPlaceholder("Selecione um adicional")
                        .setMaxValues(1)
                        .setCustomId("adicionais_auth_carrinho")
                        .addOptions(
                            {
                                label:"[Online] - Suporte prioritário 24/7",
                                value:"suporte",
                                description:`💸 Valor: ${Number(preco.suporte).toFixed(2).replace(".",",")} | Duração: ${ae[prano]}`,
                            },
                            {
                                label:"[Online] - Remoção da Divulgação",
                                value:"div",
                                description:`💸 Valor: ${Number(preco.div).toFixed(2).replace(".",",")} | Duração: ${ae[prano]}`,
                            },
                            {
                                label:"[Online] - Remover o cooldown",
                                value:"cooldown",
                                description:`💸 Valor: ${Number(preco.cooldown).toFixed(2).replace(".",",")} | Duração: ${ae[prano]}`,
                            },
                            {
                                label:"[Online] - Capturar e-mail dos usuários",
                                value:"email",
                                description:`💸 Valor: ${Number(preco.email).toFixed(2).replace(".",",")} | Duração: ${ae[prano]}`,
                            },
                        )
                    ),
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("continuar_pagamento_auth")
                        .setLabel("Continuar para o pagamento")
                        .setEmoji("<:pix:1242468158590423041>")
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId("cancelar_auth")
                        .setLabel("Fechar carrinho")
                        .setEmoji("<:discotoolsxyzicon37:1252730754547449957>")
                        .setStyle(4),
                    )
                ]
            });
        }
        if(customId === "adicionais_auth_carrinho") {
            const ade = interaction.values[0];
            const be = await ms.get(`${interaction.channel.id}.adicionais`) || [];
            if(be.includes(ade)) {
                await ms.pull(`${interaction.channel.id}.adicionais`, (element) => element == ade, true);
            } else {
                await ms.push(`${interaction.channel.id}.adicionais`, ade);
            }
                const cart = await ms.get(`${interaction.channel.id}`);
                let msg = "";
                const precos = await data.get("adicionais");
                const prano = cart.plano;
                
                const b = [
                    {
                        "id":"div",
                        "valor": Number(precos.div).toFixed(2),
                        "label":"Remoção da divulgação"
                   },
                   {
                        "id":"suporte",
                        "valor": Number(precos.suporte).toFixed(2),
                        "label":"Suporte prioritário 24/7"
                   },
                   {
                        "id":"cooldown",
                        "valor": Number(precos.cooldown).toFixed(2),
                        "label":"Remover o cooldown"
                   },
                   {
                       "id":"email",
                       "valor": Number(precos.email).toFixed(2),
                       "label":"Capturar e-mail dos usuários"
                   },
                ];
                const select = new StringSelectMenuBuilder()
                .setPlaceholder(" Selecione um adicional")
                .setMaxValues(1)
                .setCustomId("adicionais_auth_carrinho");
                const ae = {
                    "mensal": 30,
                    "quinzenal": 15,
                    "semanal": 7,
                };
                if(cart.adicionais.length > 0) msg = `\n- **Adicionais (${cart.adicionais.length})**`;
                let precototal = Number(await data.get(`bot.${prano}`));
                b.map((e) => {
                    if(cart.adicionais.includes(e.id)) {
                        select.addOptions(
                            {
                                label:`[ATIVADO] - ${e.label}`,
                                value:`${e.id}`,
                                description:`💸  Valor: ${Number(e.valor).toFixed(2).replace(".",",")} | 📅 Duração: ${ae[prano]}`,
                            },
                        )
                        msg += `\n - \`${e.label}\`: \`R$ ${Number(e.valor).toFixed(2).replace(".",",")}\``;
                        precototal += Number(e.valor);
                    } else {
                        select.addOptions(
                            {
                                label:`[] - ${e.label}`,
                                value:`${e.id}`,
                                description:`💸  Valor: ${Number(e.valor).toFixed(2).replace(".",",")} | 📅 Duração: ${ae[prano]}`,
                            },
                        )
                    }
                });

                interaction.update({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle("Adicionais | Carrinho")
                        .setDescription(`- **Certo ${interaction.user.username} Deseja adicionar ao seu carrinho algum adicional**\n - abaixo tera a explicação dos adicionais\n - **Adicional de suporte prioritário 24/7**\n - Tenha suporte 24/7\n - **Adicional de remoção da divulgação**\n - Configre a bio do seu bot Auth como quiser!\n - **Adicional de remover o cooldown**\n - Sem esse adicional você terá um cooldown de 2h pra puxar membros\n - Com o adicional, você pode puxar os membros a qualquer momento!\n - **Adicional de capturar e-mail dos usuários**\n - Capture o e-mail de todos os usuários que logarem no seu auth!\n - **Resumo do seu Carrinho**\n- Plano ${prano}: R$ ${Number(await data.get(`bot.${prano}`)).toFixed(2).replace(".",",")}${msg}\n- **Total:** R$ ${precototal.toFixed(2).replace(".",",")}`)
                        .setColor("#13f502")
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(select),
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId("continuar_pagamento_auth")
                            .setLabel("Continuar para o pagamento")
                            .setEmoji("<:pix:1242468158590423041>")
                            .setStyle(3),
                            new ButtonBuilder()
                            .setCustomId("cancelar_auth")
                            .setLabel("Fechar carrinho")
                            .setEmoji("<:discotoolsxyzicon37:1252730754547449957>")
                            .setStyle(4),
                        )
                    ]
                });
        }
        if(customId === "cancelar_auth") {
            const channel_ws = interaction.client.channels.cache.get(await data.get("logs"));
            if(channel_ws) channel_ws.send({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`Carrinho Fechado`)
                    .setDescription(`**- Usuário:** \n ${interaction.user} \n **- ID:** \n ${interaction.guild.id} \n **- Horário:** \n <t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/ 1000)}:R>)`)
                    .setColor("Red")
                    .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                    .setTimestamp()
                ]
            });
            try {
                interaction.channel.delete().catch(() => {});
            } catch {}
        }
        if(customId === "continuar_pagamento_auth") {
            await interaction.update({
                content:`Gerando Pagamento em pix...`,
                embeds: [],
                components:[]
            });
            const cart = await ms.get(`${interaction.channel.id}`);
                let msg1 = "";
                const precos = await data.get("adicionais");
                const prano = cart.plano;
                
                const b = [
                    {
                        "id":"div",
                        "valor": Number(precos.div).toFixed(2),
                        "label":"Remoção da divulgação"
                   },
                   {
                        "id":"suporte",
                        "valor": Number(precos.suporte).toFixed(2),
                        "label":"Suporte prioritário 24/7"
                   },
                   {
                        "id":"cooldown",
                        "valor": Number(precos.cooldown).toFixed(2),
                        "label":"Remover o cooldown"
                   },
                   {
                       "id":"email",
                       "valor": Number(precos.email).toFixed(2),
                       "label":"Capturar e-mail dos usuários"
                   },
                ];
                const select = new StringSelectMenuBuilder()
                .setPlaceholder("Selecione um adicional")
                .setMaxValues(1)
                .setCustomId("adicionais_auth_carrinho");
                const ae = {
                    "mensal": 30,
                    "quinzenal": 15,
                    "semanal": 7,
                };
                if(cart.adicionais.length > 0) msg1 = `\n- **Adicionais (${cart.adicionais.length})**`;
                let precototal = Number(await data.get(`bot.${prano}`));
                b.map((e) => {
                    if(cart.adicionais.includes(e.id)) {
                        select.addOptions(
                            {
                                label:`[ATIVADO] - ${e.label}`,
                                value:`${e.id}`,
                                description:`💸 Valor: ${Number(e.valor).toFixed(2).replace(".",",")} | 📅 Duração: ${ae[prano]}`,
                            },
                        )
                        msg1 += `\n - \`${e.label}\`: \`R$ ${Number(e.valor).toFixed(2).replace(".",",")}\``;
                        precototal += Number(e.valor);
                    } else {
                        select.addOptions(
                            {
                                label:`[DESATIVADO] - ${e.label}`,
                                value:`${e.id}`,
                                description:`💸 Valor: ${Number(e.valor).toFixed(2).replace(".",",")} | 📅 Duração: ${ae[prano]}`,
                            },
                        )
                    }
                });
            
            const min1 = moment1().tz("America/Argentina/Buenos_Aires").add(10, 'minutes').toISOString();
            const min2 = moment1().tz("America/Argentina/Buenos_Aires").add(10, 'minutes');

            const generateRandomString = (length) => {
                const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
            }
            const acesstoken = await data.get(`acesstoken`);
            const ID = `PRANO${generateRandomString(35)}`
            mercadopago.configurations.setAccessToken(acesstoken);
            await ms.set(`${interaction.channel.id}_comprando`, Number(precototal));
            var payment_data = {
                transaction_amount: Number(precototal.toFixed(2)),
                description: `COMPRAR AUTH - ${interaction.user.username}`,
                payment_method_id: 'pix',
                payer: {
                    email: "ghoststudiopayments.cloud@gmail.com",
                    first_name: 'Paula',
                    last_name: 'Guimaraes',
                    identification: {
                        type: 'CPF',
                        number: '07944777984'
                    },
                    address: {
                        zip_code: '06233200',
                        street_name: 'Av. das NaÃƒÂ§oes Unidas',
                        street_number: '3003',
                        neighborhood: 'Bonfim',
                        city: 'Osasco',
                        federal_unit: 'SP'
                    }
                },
                date_of_expiration: min1,
                external_reference: ID
            };
            
            const pay = await mercadopago.payment.create(payment_data);
            const bufferQrCode = Buffer.from(pay.body.point_of_interaction.transaction_data.qr_code_base64, "base64");
            const qrCodeAttachment = new AttachmentBuilder(bufferQrCode, { name: "payment.png"});

            interaction.message.edit({
                content:`${interaction.user}`,
                embeds:[
                    new EmbedBuilder()
                    .setAuthor({name:`${interaction.user.username}`, iconURL:interaction.member.displayAvatarURL()})
                    .setDescription(`- **Pague via QR CODE ou código Pix** \n - O código expirará em 10 minutos`)
                    .setImage("attachment://payment.png")
                    .setFooter({text:`📅 - Pagamento expira em 10 minutos.`})
                    .setColor("#37ff00")
                    .setTimestamp(),
                    new EmbedBuilder()
                    .setTitle(" Resumo do seu carrinho")
                    .setDescription(`- **Plano ${prano}:** R$ ${Number(await data.get(`bot.${prano}`)).toFixed(2).replace(".",",")}${msg1}\n- **Total:** R$ ${precototal.toFixed(2).replace(".",",")}`)
                    .setColor("#2b2d31")
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setLabel('Código Copia e Cola')
                            .setEmoji(`<:pix:1242468158590423041>`)
                            .setCustomId('pcpc')
                            .setDisabled(false)
                            .setStyle(2),
                            new ButtonBuilder()
                            .setLabel("Aprovar pedido")
                            .setEmoji("<:verificado:1242465776703901706>")
                            .setCustomId("aprovar_pdd")
                            .setStyle(2),
                            new ButtonBuilder()
                            .setCustomId(`cancelar123`)
                            .setLabel("Cancelar pedido")
                            .setEmoji("<:discotoolsxyzicon37:1252730754547449957>")
                            .setStyle(4),
                            )
                    ],
                    files:[qrCodeAttachment]
            });
            await ms.set(`${interaction.channel.id}.status`, false);

        const buceta = setTimeout(() => {
            interaction.channel.delete();
        }, 12 * 60 * 1000);

        const collectorFilter = (interaction) => interaction.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter: collectorFilter });
        collector.on("collect", async(interaction) => {
            if (interaction.customId === 'aprovar_pdd') {
                await interaction.deferUpdate();
                await axios.get(`https://api.mercadopago.com/v1/payments/search?external_reference=${ID}`, {
                    headers: {
                      'Authorization': `Bearer ${acesstoken}`
                    }
                  }).then(async (doc) => {
                      const Data = doc.data?.results;
                      let f = false;
                      Data.map((a) => {
                          if(a.status === "approved") {
                              f = true;
                          }
                      })
                    if (f) {
                        await ms.set(`${interaction.channel.id}.status`, true);
                    } else {
                        const sts = await ms.get(`${interaction.channel.id}.status`);
                        if(!sts){
                            return interaction.followUp({content:`Pagamento ainda não foi encontrado!`, ephemeral:true});
                        }
                    }
                  }).catch(err => {
                    interaction.followUp({content:`❌ | Ocorreu um erro ao verificar seu Pagamento.`, ephemeral:true});
                  });
                  const sts = await ms.get(`${interaction.channel.id}.status`);
            if(sts) {
                
                clearTimeout(buceta);
                const roleID= await data.get("cliente");
                if(!interaction.member.roles.cache.has(roleID)) interaction.member.roles.add(roleID).catch(() => {});
                await interaction.channel.bulkDelete(25);
                interaction.channel.edit({name:`✅・${interaction.user.username}・${interaction.user.id}`});
                setTimeout(() => {
                    interaction.channel.send({
                        content:`${interaction.user}`,
                        embeds: [
                            new EmbedBuilder()
                            .setDescription(`Pedido aprovado com sucesso!\n Parabéns por adquirir o seu bot Auth V! \n  Agora, vamos configurar o seu bot Auth!`)
                            .setColor("#2b2d31"),
                            new EmbedBuilder()
                            .setTitle("<:support_Near:1254274313960554578> Configurando o seu BOT")
                            .setDescription(`**Para ativar o seu bot Auth, precisaremos de 2 informações:**\n\n> - **Token:** do seu bot \n > - **Client Secret:** do seu bot \n\n ⚠ Recomendamos fortemente que vocÊ veja o nosso video tutorial abaixo, que ensina a configurar o seu bot Auth e previne erros!`)
                            .setColor("#2b2d31"),
                        ],
                        components: [
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setCustomId("config_bot_authkk")
                                .setLabel("Configurar BOT")
                                .setStyle(1)
                                .setEmoji("<:1220490882239954965:1242270603772297296>"),
                                new ButtonBuilder()
                                .setURL(`https://discord.com/developers/applications/`)
                                .setLabel("Portal do desenvolvedor")
								.setEmoji("<:robo:1254273784530210930>")
                                .setStyle(5),
                                new ButtonBuilder()
                                .setURL("https://youtu.be/KUe3V2VG20M?si=R7UiD4WVh7a-bClV")
                                .setLabel("Video tutorial")
								.setEmoji("<:pasta:1254273476173238323>")
                                .setStyle(5)
                                .setDisabled(false)
                            )
                        ]
                    })
                }, 500);
                
            }
            }
            if (interaction.customId === 'pcpc') {
                interaction.reply({ content: `${pay.body.point_of_interaction.transaction_data.qr_code}`, ephemeral: true });
            }
            if (interaction.customId === 'cancelar123') {
                clearTimeout(buceta);
                interaction.reply({content:`❌ | Este Carrinho Será fechado em breve`});
                setTimeout(() => {
                    interaction.channel.delete();
                }, 1000);
              }
            });
        }
        if(customId === "config_bot_authkk") {
            const modal = new ModalBuilder()
            .setCustomId(`confibotauth_modal`)
            .setTitle("Configurar bot");

            const text = new TextInputBuilder()
            .setCustomId("token")
            .setStyle(1)
            .setLabel("token do seu bot")
            .setRequired(true);

            const text1 = new TextInputBuilder()
            .setCustomId("secret")
            .setStyle(1)
            .setLabel("client secret do seu bot")
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));
            modal.addComponents(new ActionRowBuilder().addComponents(text1));

            return interaction.showModal(modal);
        }
        if(customId === "confibotauth_modal") {
            const token = interaction.fields.getTextInputValue("token");
            const secret = interaction.fields.getTextInputValue("secret");
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setDescription("<a:carregando2:1254276491101999154> Verificando seu Bot")
                    .setColor("#2b2d31")
                ],
                ephemeral:true
            })
            const te = await checkToken(token);
            if(!te) return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`❌ Você não Colocou um token valido.`)
                    .setColor("Red")
                ],
            });
            const tex = await checkSecret(te.id, secret);
            if(!tex) return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`❌ Verifique se você colocou um secret Valido.`)
                    .setColor("Red")
                ]
            });
            const ta = await checkRedirectUrl(te.id, token, url);
            if(!ta) return interaction.editReply({
                content:`Redirect URL: ${url}/api/callback`,
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`❌ Você ainda não configurou a redirect URL da ${interaction.guild.name}`)
                    .setColor("Red")
                ],
                ephemeral:true
            });
            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setDescription("Registrando o seu Bot")
                    .setColor("#2b2d31")
                ]
            });
            const plano = await ms.get(`${interaction.channel.id}.plano`);
            let dias = 0;
            if(plano === "mensal") {
                dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            } else if(plano === "quinzenal") {
                dias = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
            } else {
                dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            }

            await db.set(`${te.id}`, {
                name: te.username,
                token,
                secret,
                idbot: te.id,
                servers:{},
                adicionais:await ms.get(`${interaction.channel.id}.adicionais`) || [],
                verify: [],
                plano,
                validade: dias,
                confia: [],
                owner: interaction.user.id
            });
            interaction.message.delete();
            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`Bot Auth, configurado e registrado com sucesso! Use \`/gerenciar_auth\` para Gerenciar seu Bot`)
                    .setColor("Green")
                ]
            });
            const o = await ms.get(`${interaction.channel.id}_comprando`);
            const chn_logs = interaction.client.channels.cache.get(await data.get("logs"));
            const ads = await ms.get(`${interaction.channel.id}.adicionais`) || [];

            if(chn_logs) chn_logs.send({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`Compra Aprovada`)
                    .setColor("Green")
                    .addFields(
                        {
                            name:" Usuário",
                            value:`**${interaction.user} - \`${interaction.user.id}\`**`
                        },
                        {
                            name:" Valor",
                            value:`**R$ ${Number(o).toFixed(2)}**`
                        },
                        {
                            name:" Token",
                            value:`\`\`\`${token}\`\`\``,
                            inline: true
                        },
                        {
                            name:" Secret",
                            value:`\`\`\`${secret}\`\`\``,
                            inline: true
                        },
                        {
                            name:" Adicionais",
                            value:`${ads.length <= 0 ? "`Comprou Nenhum Adicional.`" : `\`${ads.join(", ")}\``}`,
                            inline:true
                        },
                        {
                            name:"<:Relogio:1254277463165632634>  Horário:",
                            value:`**<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/1000)}:R>)**`,
                            inline:false
                        },
                    )
                    .setFooter({text:"Pagamento processado", iconURL: interaction.client.user.avatarURL()})
                ]
            });
            setTimeout(() => {
                interaction.channel.delete();
            }, 15000);

        }

    }}

    
async function checkSecret(client_id, client_secret) {
    try {
        const ok = await axios.post('https://discord.com/api/v8/oauth2/token', qs.stringify({
            client_id: client_id,
            client_secret: client_secret,
            grant_type: 'client_credentials',
            scope: 'identify'
        }));
        return true
    } catch (error) {
        return false;
    }
}
async function checkToken(bot_token) {
    try {
        const response = await axios.get('https://discord.com/api/v8/users/@me', {
            headers: { 'Authorization': `Bot ${bot_token}` }
        });
        
        return response.data;
    } catch (error) {
        return false;
    }
}
async function checkRedirectUrl(client_id, bot_token, redirect_url) {
    try {
        const response = await axios.get(`https://discord.com/api/v8/applications/@me`, {
            headers: { 'Authorization': `Bot ${bot_token}` }
        });
        if(!response.data.redirect_uris) return false;
        if(response.data.redirect_uris.length <= 0) return false;
        if (response.data.redirect_uris.includes(`${redirect_url}/api/callback`)) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        
        return false;
    }
}