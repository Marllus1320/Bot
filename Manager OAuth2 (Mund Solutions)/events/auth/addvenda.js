const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder, UserSelectMenuBuilder, WebhookClient, ChannelType, AttachmentBuilder, Embed } = require("discord.js");
const { db, data, ms, fat, serv} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require('axios');
const qs = require('qs');
const https = require('https');
const fs = require('fs');
const moment1 = require('moment-timezone');
const moment = require('moment');
const mercadopago = require("mercadopago");
const DiscordOauth2 = require("discord-oauth2");
const oauth2 = new DiscordOauth2();


module.exports = {
    name:"interactionCreate", 
    run: async( interaction, client) => {
        const customId = interaction.customId;
        if(!customId) return;
        if(customId === "add_venda_lol") {
            const modal = new ModalBuilder()
            .setCustomId("addvendas_modal")
            .setTitle("Adicionar uma Venda");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setLabel("Coloque o id da aplicação:")
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));


            return interaction.showModal(modal);
        }

        if(customId === "addvendas_modal") {
            const text = interaction.fields.getTextInputValue("text");
            const dadus = await db.get(`${text}`);
            if(!dadus) return interaction.reply({content:`**❌ Não tem nenhum Auth com esse ID**`, ephemeral:true});
            if(await data.get("vendas").includes(`${text}`)) return interaction.reply({content:`**❌ Este ID já está a venda...**`, ephemeral:true});
            await data.push("vendas", `${text}`);
            await interaction.update({
                content:`Aguarde um momento...`,
                ephemeral:true,
                embeds:[],
                components:[]
            });
            const all = await data.get("vendas");
            let msg = "";
            if(all.length <= 0) {
                msg = "`Não Foi Adicionado nenhuma Venda`";
            } else {
                msg = "**Todas as Suas Vendas:**\n\n"
                const m = all.map(async(a) => {
                    const d = await db.get(`${a}`);
                    msg += `- BotID: ${a}\n - Total de Verificados: ${d.verify.length}\n - Dono: <@${d.owner}> \`${d.owner}\`\n`;
                });
                await Promise.all(m);
            }
            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} Gerenciar vendas`)
                    .setColor("#2b2d31")
                    .setDescription(`${msg}`)
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("add_venda_lol")
                        .setLabel("Adicionar Venda de Membros")
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId("refresh_venda")
                        .setEmoji("<a:1237886515879870504:1242267137448607774>")
                        .setStyle(1)
                    )
                ]
            });
        }
        if(customId === "refresh_venda") {
            await interaction.update({
                content:`Aguarde um momento...`,
                ephemeral:true,
                embeds:[],
                components:[]
            });
            const all = await data.get("vendas");
            let msg = "";
            if(all.length <= 0) {
                msg = "`Não Foi Adicionado nenhuma Venda`";
            } else {
                msg = "**Todas as Suas Vendas:**\n\n"
                const m = all.map(async(a) => {
                    const d = await db.get(`${a}`);
                    msg += `- BotID: ${a}\n - Total de Verificados: ${d.verify.length}\n - Dono: <@${d.owner}> \`${d.owner}\`\n`;
                });
                await Promise.all(m);
            }
            interaction.editReply({
                content:"",
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} Gerenciar vendas`)
                    .setColor("#2b2d31")
                    .setDescription(`${msg}`)
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("add_venda_lol")
                        .setLabel("Adicionar Venda de Membros")
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId("refresh_venda")
                        .setEmoji("<a:1237886515879870504:1242267137448607774>")
                        .setStyle(2)
                    )
                ]
            });
        }
        
        if(customId === "membros_message_modal") {
            const content = interaction.fields.getTextInputValue("content") || null;
            const preview = interaction.fields.getTextInputValue("preview") || null;
            const banner = interaction.fields.getTextInputValue("banner") || null;
            const button = interaction.fields.getTextInputValue("button") || "Adquirir";

            await interaction.reply({content:` Aguarde um momento...`, ephemeral:true});
            const files = [];
            if(banner) {
                const attach = new AttachmentBuilder(banner);
                files.push(attach);
            }
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("adquirir_membros")
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
            }).catch((err) => {
                return interaction.editReply({content:`❌ | Ocorreu um erro...\n\n- Mensagem do Erro: \`${err.message}\``});
            });
            interaction.editReply({content:`✅ | Enviado com sucesso!`});
        }

        
        if(customId.endsWith("adquirir_membros")) {
            const verif = customId.startsWith("revenda_");
            const asd = interaction.channel.threads.cache.find(x => x.name === `🛒・${interaction.user.username}・${interaction.user.id}`);
            if(asd) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription(`**❌ Você já tem um carrinho aberto em ${asd.url}**`)
                        .setColor("Red")
                    ],
                    ephemeral:true
                });
                return asd.send({content:`${interaction.user}`}).then((msg) => {msg.delete().catch(() => {})});
            }
            await interaction.reply({content:` Aguarde um momento...`, ephemeral:true});
            const thread = await interaction.channel.threads.create({
                name:`🛒・${interaction.user.username}・${interaction.user.id}`,
                autoArchiveDuration: 60,
                type: ChannelType.PrivateThread,
                reason: `Comprar Membros`,
            });
            const valor = Number(await data.get("membros.valor"));
            const resposition = Number(await data.get("membros.reposicao"));
            const min = Number(await data.get(`membros.minimo`));
            const blz = await quantiakkk();
            await thread.send({
				content:`@${interaction.user.username}`,
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({name:`${interaction.user.username}`, iconURL: interaction.member.displayAvatarURL()})
                    .setTitle(`Carrinho de Membros aberto!`)
                    .setDescription(`Você está prestes a comprar ${min} membros reais para o Discord.`)
                    .addFields(
                        {
                            name:"\`\`🟢 Valor com Reposição\`\`",
                            value:`> ${Number((min * valor) * resposition).toFixed(2)}`,
                            inline:true
                        },
                        {
                            name:"\`\`🔴 Valor sem Reposição\`\`",
                            value:`> ${Number(min * valor).toFixed(2)}`,
                            inline:false
                        }
                    )
                    .setFooter({text:`Você pode comprar até ${blz} membros.`, iconURL:interaction.guild.iconURL()})
                    .setColor("#2b2d31")
                    .setTimestamp()
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`add_member_cart`)
                        .setEmoji("<:1224400132687265926:1242268299870601236>")
                        .setStyle(2),
                        new ButtonBuilder()
                        .setCustomId(`edit_member_cart`)
                        .setEmoji("<:1220490882239954965:1242270603772297296>")
                        .setStyle(1),
                        new ButtonBuilder()
                        .setCustomId(`remove_member_cart`)
                        .setEmoji("<:1224400170318303323:1242268188390195231>")
                        .setStyle(2),
                        new ButtonBuilder()
                        .setCustomId(`finalizar_compra_member`)
                        .setLabel("Finalizar Compra")
                        .setEmoji("<a:c_sim:1242559854070206535>")
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId("cancelar_compra")
                        .setStyle(4)
                        .setEmoji("<a:c_nao:1242558302836232284>")
                    )
                ]
            });
            await thread.send({
                content:`${interaction.user}`
            }).then((msg) => {msg.delete()});

            interaction.editReply({
                content:"", 
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`✅ | Seu carrinho foi criado com sucesso ${thread.url}`)
                    .setColor("Green")
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setStyle(5)
                        .setLabel("Ir ao Carrinho")
                        .setURL(thread.url)
                    )
                ]
            });
            await ms.set(`${thread.id}`, {
                quantidade: Number(min),
                rep: false,
                revenda: verif
            });
            if(verif) {
                const gui = await serv.get(`${interaction.guild.id}`);
                const channel = interaction.guild.channels.cache.get(gui.channels.carrinho);
                if(channel) {
                    channel.send({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`Novo Carrinho Aberto (Membros)`)
                            .setDescription(`**Usuário:** \n ${interaction.user} \n **Carrinho:** \n ${thread.url} \n **Horário:** \n <t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/ 1000)}:R>)`)
                            .setColor("Green")
                            .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                            .setTimestamp()
                        ]
                    });
                }
                const channel_ws = interaction.client.channels.cache.get(await data.get("logs"));
                if(channel_ws) channel_ws.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Novo Carrinho Aberto (Membros)`)
                        .setDescription(`**Usuário:** \n ${interaction.user} \n **Carrinho:** \n ${thread.url} \n **Horário:** \n <t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/ 1000)}:R>) \n **Servidor:** ${interaction.guild.name} (\`${interaction.guild.id}\`)`)
                        .setColor("Green")
                        .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                        .setTimestamp()
                    ]
                });
            } else {
                const channel_ws = interaction.client.channels.cache.get(await data.get("logs"));
                if(channel_ws) channel_ws.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Novo Carrinho Aberto (Membros)`)
                        .setDescription(`**Usuário:** \n ${interaction.user} \n **Carrinho:** \n ${thread.url} \n **Horário:** \n <t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/ 1000)}:R>)`)
                        .setColor("Green")
                        .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                        .setTimestamp()
                    ]
                });
            }
        }
        if(customId === "add_member_cart") {
			
			const msg = await interaction.reply({content:`Aguarde um momento, estou Verificando algumas informações...`, ephemeral:true});
            const q = await quantiakkk();
            if(q < Number(await ms.get(`${interaction.channel.id}.quantidade`) + 1)) return interaction.message.edit({content:`❌ | Você atingiu a quantidade máxima de MEMBROS disponíveis para compra! `})
            await ms.add(`${interaction.channel.id}.quantidade`, 1);
            await inicio();
			interaction.editReply({content:`✅ | Informações Verificadas com sucesso!`});
        }
        if(customId === "remove_member_cart") {
			
			const msg = await interaction.reply({content:`Aguarde um momento, estou Verificando algumas informações...`, ephemeral:true});
            const q = await data.get("membros.minimo");
            if(q > Number(await ms.get(`${interaction.channel.id}.quantidade`) - 1)) return interaction.message.edit({content:`❌ | Você atingiu a quantidade mínima de MEMBROS disponíveis para compra!`});
            await ms.sub(`${interaction.channel.id}.quantidade`, 1);
          await  inicio();
			interaction.editReply({content:`✅ | informações Verificadas com sucesso!`});
			
        }
        if(customId === "edit_member_cart") {
            const modal = new ModalBuilder()
            .setCustomId("editmembercart_modal")
            .setTitle("Alterar Quantidade");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("Quantidade?")
            .setStyle(1)
            .setMaxLength(7)
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if(customId === "editmembercart_modal") {
            const text = parseInt(interaction.fields.getTextInputValue("text"));
			
			const msg = await interaction.reply({content:`Aguarde um momento, estou Verificando algumas informações...`, ephemeral:true});
            if(isNaN(text)) return interaction.message.edit({content:`❌ Quantidade Invalida`});
            const q = await data.get("membros.minimo");
            const q1 = await quantiakkk();
            if(text > q1) return interaction.message.edit({content:`❌ | Você atingiu a quantidade máxima de MEMBROS disponíveis para compra! `})
            if(text < q) return interaction.message.edit({content:`❌ | Você atingiu a quantidade mínima de MEMBROS disponíveis para compra!`});
            await ms.set(`${interaction.channel.id}.quantidade`, Number(text));
          await  inicio();
			interaction.editReply({content:`✅ | Informações verificadas com sucesso!`});
        }

        async function inicio() {
			const members = await data.get("membros")
            const valor = Number(members.valor);
            const resposition = Number(members.reposicao);
            const min = await ms.get(`${interaction.channel.id}.quantidade`);
            const blz = await quantiakkk();
            interaction.message.edit({
                content:"<@&1242604540545728532>",
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({name:`${interaction.user.username}`, iconURL: interaction.member.displayAvatarURL()})
                    .setTitle(`Carrinho de Membros aberto!`)
                    .setDescription(`Você está prestes a comprar ${min} membros reais para o Discord.`)
                    .addFields(
                        {
                            name:"\`\`🟢 Valor com Reposição\`\`",
                            value:`> ${Number((min * valor) * resposition).toFixed(2)}`,
                            inline:true
                        },
                        {
                            name:"\`\`🔴 Valor sem Reposição\`\`",
                            value:`> ${Number(min * valor).toFixed(2)}`,
                            inline:false
                        }
                    )
                    .setFooter({text:`Você pode comprar até ${blz} membros.`, iconURL:interaction.guild.iconURL()})
                    .setColor("#2b2d31")
                    .setTimestamp()
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`add_member_cart`)
                        .setEmoji("<:1224400132687265926:1242268299870601236>")
                        .setStyle(2),
                        new ButtonBuilder()
                        .setCustomId(`edit_member_cart`)
                        .setEmoji("<:1220490882239954965:1242270603772297296>")
                        .setStyle(1),
                        new ButtonBuilder()
                        .setCustomId(`remove_member_cart`)
                        .setEmoji("<:1224400170318303323:1242268188390195231>")
                        .setStyle(2),
                        new ButtonBuilder()
                        .setCustomId(`finalizar_compra_member`)
                        .setLabel("᲼Finalizar Compra")
                        .setEmoji("<a:c_sim:1242559854070206535>")
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId("cancelar_compra")
                        .setStyle(4)
                        .setEmoji("<a:c_nao:1242558302836232284>")
                    )
                ]
            });
        }
        if(customId === "cancelar_compra") {
            const verif = await ms.get(`${interaction.channel.id}.revenda`);
            const gui = await serv.get(`${interaction.guild.id}`);
            const thread = interaction.channel;
            if(verif) {
                const channel = interaction.guild.channels.cache.get(gui.channels.carrinho);
                if(channel) {
                    channel.send({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`Carrinho Fechado (Membros)`)
                            .setDescription(`**Usuário:** \n ${interaction.user} \n**Carrinho:** \n ${thread.url} \n **Horário:** \n<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/ 1000)}:R>)`)
                            .setColor("Red")
                            .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                            .setTimestamp()
                        ]
                    });
                }
                const channel_ws = interaction.client.channels.cache.get(await data.get("logs"));
                if(channel_ws) channel_ws.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Carrinho Fechado (Membros)`)
                        .setDescription(`**Usuário:** \n ${interaction.user} \n**Carrinho:** \n ${thread.url} \n **Horário:** \n<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/ 1000)}:R>)\n**Servidor:** ${interaction.guild.name} (\`${interaction.guild.id}\`)`)
                        .setColor("Red")
                        .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                        .setTimestamp()
                    ]
                });
            } else {
                const channel_ws = interaction.client.channels.cache.get(await data.get("logs"));
                if(channel_ws) channel_ws.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Carrinho Fechado (Membros)`)
                        .setDescription(`**Usuário:** \n ${interaction.user} \n**Carrinho:** \n ${thread.url} \n **Horário:** \n<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/ 1000)}:R>)`)
                        .setColor("Red")
                        .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                        .setTimestamp()
                    ]
                });
            }
            interaction.channel.delete();
        }
        if(customId === "finalizar_compra_member") {
            await interaction.update({
                content:"",
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("comrefil")
                        .setLabel("1 - Com Refil")
                        .setDisabled(true)
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId("semrefil")
                        .setLabel("2 - Sem Refil")
                        .setDisabled(true)
                        .setStyle(4),
                    )
                ]
            });
            setTimeout(() => {
                interaction.editReply({
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId("comrefil")
                            .setLabel("1 - Com Refil")
                            .setStyle(3),
                            new ButtonBuilder()
                            .setCustomId("semrefil")
                            .setLabel("2 - Sem Refil")
                            .setStyle(4),
                        )
                    ]
                });
                
            }, 2500);
        }
        if(customId.endsWith("refil")) {
            const valor = Number(await data.get("membros.valor"));
            const resposition = Number(await data.get("membros.reposicao"));
            const min = await ms.get(`${interaction.channel.id}.quantidade`);

            const ref = customId.split("ref")[0] == "sem" ? Number(min * valor).toFixed(2) : Number((min * valor) * resposition).toFixed(2)
            await interaction.update({
                content:`Gerando seu Pagamento...`,
                embeds: [],
                components:[]
            });

            await ms.set(`${interaction.channel.id}.ref`, customId.split("ref")[0] == "com");

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
                transaction_amount: Number(precototal3.toFixed(2)),
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
            const oasdmnuasid = Number(Number(ref).toFixed(2));
            await ms.set(`${interaction.channel.id}.status`, false);
            await ms.set(`${interaction.channel.id}.dinheiro`, oasdmnuasid);
            

        const buceta = setTimeout(async() => {
            const verif = await ms.get(`${interaction.channel.id}.revenda`);
            const gui = await serv.get(`${interaction.guild.id}`);
            const thread = interaction.channel;
            if(verif) {
                const channel = interaction.guild.channels.cache.get(gui.channels.carrinho);
                if(channel) {
                    channel.send({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`Carrinho Fechado (Membros)`)
                            .setDescription(`**Usuário:** \n ${interaction.user} \n**Carrinho:** \n ${thread.url} \n **Horário:** \n<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/ 1000)}:R>)`)
                            .setColor("Red")
                            .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                            .setTimestamp()
                        ]
                    });
                }
                const channel_ws = interaction.client.channels.cache.get(await data.get("logs"));
                if(channel_ws) channel_ws.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Carrinho Fechado (Membros)`)
                        .setDescription(`**Usuário:** \n ${interaction.user} \n**Carrinho:** \n ${thread.url} \n **Horário:** \n<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/ 1000)}:R>)\n**Servidor:** ${interaction.guild.name} (\`${interaction.guild.id}\`)`)
                        .setColor("Red")
                        .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                        .setTimestamp()
                    ]
                });
            } else {
                const channel_ws = interaction.client.channels.cache.get(await data.get("logs"));
                if(channel_ws) channel_ws.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Carrinho Fechado (Membros)`)
                        .setDescription(`**Usuário:** ${interaction.user}\n**ID:** ${interaction.guild.id}\n**Canal:** ${thread.url}\n**Horário:** <t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/ 1000)}:R>)`)
                        .setColor("Red")
                    ]
                });
            }
            interaction.channel.delete();
        }, 12 * 60 * 1000);

        const collectorFilter = (interaction) => interaction.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter: collectorFilter });
        const b = setInterval(async() => {
            
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
                    } 
                  }).catch(err => {
                    
                  });
                  const sts = await ms.get(`${interaction.channel.id}.status`);
            if(sts) {
                clearTimeout(buceta);
                clearInterval(b);
                
                await interaction.channel.bulkDelete(25);
                interaction.channel.edit({name:`✅・${interaction.user.username}・${interaction.user.id}`});
                const edi = await procurartotal(min);
                setTimeout(() => {
                    
                    interaction.channel.send({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`${interaction.client.user.username} | Sistema de Pagamento`)
                            .addFields(
                                {
                                    name:"✅ Pagamento Aprovado",
                                    value:"Para começar a adicionar os membros, siga os passos abaixo:",
                                },
                                {
                                    name:"1️⃣ | Adicione o BOT no servidor de destino dos membros.",
                                    value:"Clique no botão abaixo para adicionar o **BOT** no servidor de destino dos membros."
                                },
                                {
                                    name:"2️⃣ | Clique no botão abaixo para enviar os membros.",
                                    value:"Clique no botão abaixo para enviar os membros."
                                },
                                {
                                    name:"3️⃣ | Certifique-se de conceder as permissões de Administrador ao BOT",
                                    value:`Não se preocupe, nenhum ajuste será feito, apenas os **MEMBROS** serão entregues.`
                                },
                                {
                                    name:"atenção:",
                                    value:"Certifique-se de fornecer o **ID** do seu Servidor quando solicitado para garantir uma entrega precisa."
                                }
                            )
                            .setFooter({text:'Após adicionar o BOT, clique em "Enviar Membros" para iniciar o processo de envio.', iconURL:interaction.client.user.displayAvatarURL()})
                            .setColor("#2b2d31")
                        ],
                        components: [
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setCustomId(`${edi}_enviar_members`)
                                .setStyle(3)
                                .setLabel("Enviar Membros"),
                                new ButtonBuilder()
                                .setURL(`https://discord.com/oauth2/authorize?client_id=${edi}&permissions=8&scope=bot`)
                                .setStyle(5)
                                .setLabel("Adicionar BOT"),
                            )
                        ]
                    });
                    const roleID= data.get("cliente");
                    if(!interaction.member.roles.cache.has(roleID)) interaction.member.roles.add(roleID).catch(() => {});
                }, 500);
                
            }
        }, 3500);
        collector.on("collect", async(interaction) => {
            if (interaction.customId === 'pxcop') {
                interaction.reply({ content: `${pay.body.point_of_interaction.transaction_data.qr_code}`, ephemeral: true });
            }
            if (interaction.customId === 'qrc') {
                interaction.reply({ files: [qrCodeAttachment], ephemeral: true });
            }
            if (interaction.customId === 'cancl') {
                clearTimeout(buceta);
                clearInterval(b);
                interaction.reply({content:`❌ | Este Carrinho Será fechado em breve`});
                setTimeout(async() => {
                    const verif = await ms.get(`${interaction.channel.id}.revenda`);
                    const gui = await serv.get(`${interaction.guild.id}`);
                    const thread = interaction.channel;
                    if(verif) {
                        const channel = interaction.guild.channels.cache.get(gui.channels.carrinho);
                        if(channel) {
                            channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Carrinho Fechado (Membros)`)
                                    .setDescription(`**Usuário:** ${interaction.user}\n**ID:** ${interaction.guild.id}\n**Canal:** ${thread.url}\n**Horário:** <t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/ 1000)}:R>)`)
                                    .setColor("Red")
                                    .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                                    .setTimestamp()
                                ]
                            });
                        }
                        const channel_ws = interaction.client.channels.cache.get(await data.get("logs"));
                        if(channel_ws) channel_ws.send({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`Carrinho Fechado (Membros)`)
                                .setDescription(`**Usuário:** \n ${interaction.user} \n**Carrinho:** \n ${thread.url} \n **Horário:** \n<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/ 1000)}:R>)\n**Servidor:** ${interaction.guild.name} (\`${interaction.guild.id}\`)`)
                                .setColor("Red")
                                .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                                .setTimestamp()
                            ]
                        });
                    } else {
                        const channel_ws = interaction.client.channels.cache.get(await data.get("logs"));
                        if(channel_ws) channel_ws.send({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`Carrinho Fechado (Membros)`)
                                .setDescription(`**Usuário:** \n ${interaction.user} \n**Carrinho:** \n ${thread.url} \n **Horário:** \n<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/ 1000)}:R>)`)
                                .setColor("Red")
                                .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                                .setTimestamp()
                            ]
                        });
                    }
                    interaction.channel.delete();
                }, 1000);
              }
            });
        }

        if(customId.endsWith("_enviar_members")) {
            const edi = customId.split("_")[0];
            const modal = new ModalBuilder()
            .setCustomId(`${edi}_enviarmembers_modal`)
            .setTitle("✏ | ID do Servidor");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("id do servidor?")
            .setStyle(1)
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if(customId.endsWith("_enviarmembers_modal")) {
            const clientid = customId.split("_")[0];
            const text = interaction.fields.getTextInputValue("text");
            await interaction.update({
                content:`Estamos verificando se o BOT está no servidor!`,
                embeds:[],
                components: []
            });
            const a = await db.get(`${clientid}`);
            const headers = {
                Authorization: `Bot ${a.token}`
            };
            let sts;
            try {
                const response = await axios.get(`https://discord.com/api/v9/guilds/${text}`, {
                    headers: {
                        Authorization: `Bot ${a.token}`
                    }
                });
                if(!response) {
                    sts = false;
                } else if(!response.data) {
                    sts = false;
                } else if(response.data.id) {
                    sts = true
                } else {
                    sts = false
                }
            } catch (error) {
                sts = false;
            }
            if(!sts) return interaction.message.edit({
                content:`❌ ** | O Bot não está no Servidor Solicitado.**`,
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`${interaction.client.user.username} | Sistema de Pagamento`)
                    .addFields(
                        {
                            name:"✅ Pagamento Aprovado",
                            value:"Para começar a adicionar os membros, siga os passos abaixo:",
                        },
                        {
                            name:"1️⃣ | Adicione o BOT no servidor de destino dos membros.",
                            value:"Clique no botão abaixo para adicionar o **BOT** no servidor de destino dos membros."
                        },
                        {
                            name:"2️⃣ | Clique no botão abaixo para enviar os membros.",
                            value:"Clique no botão abaixo para enviar os membros."
                        },
                        {
                            name:"3️⃣ | Certifique-se de conceder as permissões de Administrador ao BOT",
                            value:`Não se preocupe, nenhum ajuste será feito, apenas os **MEMBROS** serão entregues.`
                        },
                        {
                            name:"Atenção:",
                            value:"Certifique-se de fornecer o **ID** do seu Servidor quando solicitado para garantir uma entrega precisa."
                        }
                    )
                    .setFooter({text:'Após adicionar o BOT, clique em "Enviar Membros" para iniciar o processo de envio.', iconURL:interaction.client.user.displayAvatarURL()})
                    .setColor("#2b2d31")
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${clientid}_enviar_members`)
                        .setStyle(3)
                        .setLabel("Enviar Membros"),
                        new ButtonBuilder()
                        .setURL(`https://discord.com/oauth2/authorize?client_id=${clientid}&permissions=8&scope=bot`)
                        .setStyle(5)
                        .setLabel("Adicionar BOT"),
                    )
                ]
            });
            interaction.editReply({
                content:`✅ | Estamos puxando todos os membros para o seu Servidor!, Obrigado Pela Compra!`
            });
            const min = moment().add(2, 'days');
            const time = Math.floor(min.valueOf() / 1000);
            interaction.user.send({
                content:`\`\`\`✅ | Estamos puxando todos os membros para seu Servidor!, Obrigado Pela Compra!\`\`\` \n <:1221271388644577280:1242269094003343442> O processo será concluído em até **48 horas.** Caso não receba todos os membros dentro deste prazo, por favor, vá até https://discord.com/channels/1242598979418460280/1242604600473817099 e abra um ticket`
            });
            const abac = await ms.get(`${interaction.channel.id}.ref`);
            const puxada = await ms.get(`${interaction.channel.id}.quantidade`);
            if(abac) {
                await fat.set(`${interaction.channel.id}`, {
                    quantia: puxada,
                    owner: interaction.user.id,
                    bot: clientid,
                    guild: text
                });
            }
            setTimeout(() => {
                interaction.channel.delete();
            }, 2500);
            const users = a.verify;
            const ok = [];
            const f = {idapp: clientid};
            const verif = await ms.get(`${interaction.channel.id}.revenda`);
            const gui = await serv.get(`${interaction.guild.id}`);
            if(verif) {
                const channel_venda = interaction.guild.channels.cache.get(gui.channels.carrinho);
                const o = await ms.get(`${interaction.channel.id}.dinheiro`);
                const ok = (o / 100) * await data.get("porcentagem");
                const saldo = Number(gui.saldo) + Number(ok);
                const st = o;
                try {
                    await serv.add(`${interaction.guild.id}.saldo`, Number(ok));
                } catch {}
                if(channel_venda) channel_venda.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Compra Aprovada`)
                        .setColor("Green")
                        .setDescription(`\`\`\`Nessa Venda sua comissão foi dê R$ ${Number(ok).toFixed(2)} \n Você já tem R$ ${Number(saldo).toFixed(2)} de saldo\`\`\``)
                        .addFields(
                            {
                                name:"Usuário",
                                value:`${interaction.user} - \`${interaction.user.id}\``
                            },
                            {
                                name:"Valor",
                                value:`R$ ${Number(st).toFixed(2)}`
                            },
                            {
                                name:"📦 Quantidade",
                                value:`${puxada} membros`,
                                inline: true
                            },
                            {
                                name:"Refill",
                                value:`\`${abac ? "Sim" : "Não"}\``,
                                inline:true
                            },
                            {
                                name:"Horário",
                                value:`<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/1000)}:R>)`,
                                inline:false
                            },
                            {
                                name:"Previsão de entrega:",
                                value:`> <t:${time}:R>`
                            },
                        )
                        .setFooter({text:"Pagamento processado ", iconURL: interaction.client.user.avatarURL()})
                    ]
                });
                const chn_logs = interaction.client.channels.cache.get(await data.get("logs"));
                if(chn_logs) chn_logs.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Compra Aprovada`)
                        .setColor("Green")
                        .setDescription(`\`\`\`Nessa Venda a comissão foi dê R$ ${Number(ok).toFixed(2)} \n Agora o Dono já tem R$ ${Number(saldo).toFixed(2)} de saldo\`\`\``)
                        .addFields(
                            {
                                name:"Usuário",
                                value:`${interaction.user} - \`${interaction.user.id}\``
                            },
                            {
                                name:"Valor",
                                value:`R$ ${Number(st).toFixed(2)}`
                            },
                            {
                                name:"📦 Quantidade",
                                value:`${puxada} membros`,
                                inline: true
                            },
                            {
                                name:"Refill",
                                value:`\`${abac ? "Sim" : "Não"}\``,
                                inline:true
                            },
                            {
                                name:"Horário",
                                value:`<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/1000)}:R>)`,
                                inline:false
                            },
                            {
                                name:"Previsão de entrega:",
                                value:`> <t:${time}:R>`
                            },
                            {
                                name:"Servidor",
                                value:`Nome: ${interaction.guild.name}\n- ID: \`${interaction.guild.id}\``
                            }
                        )
                        .setFooter({text:"Pagamento processado", iconURL: interaction.client.user.avatarURL()})
                    ]
                });
            } else {
                const o = await ms.get(`${interaction.channel.id}.dinheiro`);
                const chn_logs = interaction.client.channels.cache.get(await data.get("logs"));
                if(chn_logs) chn_logs.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Compra Aprovada`)
                        .setColor("Green")
                        .addFields(
                            {
                                name:"Usuário",
                                value:`${interaction.user} - \`${interaction.user.id}\``
                            },
                            {
                                name:"Valor",
                                value:`R$ ${Number(o).toFixed(2)}`
                            },
                            {
                                name:"Quantidade",
                                value:`${puxada} membros`,
                                inline: true
                            },
                            {
                                name:"Refill",
                                value:`\`${abac ? "Sim" : "Não"}\``,
                                inline:true
                            },
                            {
                                name:"Horário",
                                value:`<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/1000)}:R>)`,
                                inline:false
                            },
                            {
                                name:"Previsão de entrega:",
                                value:`> <t:${time}:R>`
                            }
                        )
                        .setFooter({text:"Pagamento processado", iconURL: interaction.client.user.avatarURL()})
                    ]
                });
            }
            let nu = 0;
            while(nu <= puxada) {
                const users = await db.get(`${f.idapp}.verify`);
                const user = users[nu];
                nu++;
                if(user) {
                    const token = user.token;

                const renew = await renewToken(token.refresh_token, token.code, a.idbot, a.secret);
                await db.pull(`${f.idapp}.verify`, a => a.token.refresh_token !== token.refresh_token, true);
                
				const body = { access_token: renew?.access_token ?? token.access_token }
				const response2 = await axios.put(`https://discord.com/api/guilds/${text}/members/${user.id}`, JSON.stringify(body), {
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bot ${a.token}`,
					},
				}).catch(() => {});
                await db.push(`${f.idapp}.verify`, 
                {
                    id: user.id,
                    username: user.username,
                    token: {
                        access_token: renew?.access_token ?? token.access_token,
                        refresh_token: renew?.refresh_token ?? token.refresh_token,
                        code: token.code
                    },
                    state: user.state,
                    ip: user.ip,
                    email: user.email ?? "Não encontrado"
                });
                } else {
                    
                }
            }
        }

    }}

    async function procurartotal(quantia) {
        const bele = await data.get("vendas");
        const allData = (await db.all()).filter(a => a.data.verify.length >= quantia).filter(a => bele.includes(a.ID));
        if(allData.length > 0 ) {
            const blz = allData[Math.floor(Math.random() * allData.length)];
            
            
            return blz.ID;
        } else {
            const allData = (await db.all()).filter(a => a.data.verify.length <= quantia).filter(a => bele.includes(a.ID));
            const blz = allData[Math.floor(Math.random() * allData.length)];
            
            
            return blz.ID;
        }
    }
    async function quantiakkk() {
        const b = await data.get("vendas");
        const allData = (await db.all()).filter(a => a.data.token && b.includes(a.ID));
        let max = 0;
        const m = await allData.map((a) => {
            if(a.data.verify.length >= max) {
                max = a.data.verify.length;
            }
        });
		
        return Number(max);
    }

    
    async function renewToken(refreshToken, code, clientid, secret) {
        try {
              
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            const data = {
                client_id: clientid,
                client_secret: secret,
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            };
    
            const response = await axios.post("https://discord.com/api/oauth2/token", data, {
                headers: headers,
            });
            if (response.data && response.data.access_token) {
                const renewedToken = response.data.access_token;
                const newRefreshToken = response.data.refresh_token;
                return { access_token: renewedToken, refresh_token: newRefreshToken };
            } else {
                return false;
            }
        } catch (error) {
            console.log(error.message);
            return false;
        }
    }