const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder, UserSelectMenuBuilder, WebhookClient, ChannelType, AttachmentBuilder } = require("discord.js");
const { db, data, ms} = require("../../database/index");
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
        const customId = interaction.customId;
        if(!customId) return;
        if(customId === "edit_bot") {
            const options = interaction.values[0];

            if(options === "name") {
                const modal = new ModalBuilder()
                .setCustomId(`name_bot`)
                .setTitle("🔧 - Alterar Nome do BOT");


                const text = new TextInputBuilder()
                .setCustomId("name")
                .setStyle(1)
                .setMaxLength(35)
                .setLabel("Coloque o Novo Nome:")
                .setRequired(true)
                .setMinLength(1);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            }

            if(options === "avatar") {
                const modal = new ModalBuilder()
                .setCustomId(`avatar_bot`)
                .setTitle("🔧 - Alterar Avatar do BOT");


                const text = new TextInputBuilder()
                .setCustomId("url")
                .setStyle(1)
                .setLabel("Coloque a URL:")
                .setPlaceholder("https://....")
                .setRequired(true)
                .setMinLength(1);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            }

            if(options === "bio") {
                const modal = new ModalBuilder()
                .setCustomId(`bio_bot`)
                .setTitle("🔧 - Alterar BIO do BOT");


                const text = new TextInputBuilder()
                .setCustomId("bio")
                .setStyle(2)
                .setLabel("Coloque a nova biografia:")
                .setMaxLength(125)
                .setRequired(true)
                .setMinLength(1);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            }

            if(options === "token") {
                const modal = new ModalBuilder()
                .setTitle("🔧 - Alterar Token do BOT")
                .setCustomId("token_alterar");

                const text = new TextInputBuilder()
                .setCustomId(`text`)
                .setLabel("Coloque o novo token.")
                .setStyle(1)
                .setRequired(true)
                .setPlaceholder("MTE....");


                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            } 

            if(options === "secret") {
                const modal = new ModalBuilder()
                .setTitle("🔧 - Alterar Secret do BOT")
                .setCustomId("secret_alterar");

                const text = new TextInputBuilder()
                .setCustomId(`text`)
                .setLabel("Coloque o novo Secret.")
                .setStyle(1)
                .setRequired(true);


                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            } 
            if(options === "pessoa") {
                await interaction.deferUpdate();
                confi();
            }
        }
        if(customId === "gerenciar_auth_select") {
            const idAll = interaction.values[0];
            const botid = idAll.split("-")[1];
            const idapp = idAll.split("-")[0];
            await interaction.update({
                content:`Carregando informações do Seu Auth, Aguarde um momento...`,
                embeds:[],
                components:[]
            });
            const a = await interaction.fetchReply();
            await ms.set(`${a.id}`, {
                botid,
                idapp
            });
            editcomponent();
        }
        if(customId === "voltar") {
            await interaction.deferUpdate();
            editcomponent();
        }
        if(customId == "secret_alterar") {
            const text = interaction.fields.getTextInputValue("text");
            await interaction.deferUpdate();
            editcomponent();
            
            const a = await interaction.fetchReply();
            const b = await ms.get(a.id);
            const c = await db.get(`${b.idapp}`);
            const te = await checkSecret(c.idbot, text);
            if(!te) return interaction.followUp({content:`❌ | Verifique se você colocou um secret Valido!`, ephemeral:true});

            await db.set(`${b.idapp}.secret`, text);
            interaction.followUp({content:`✅ | Secret Alterado Com Sucesso!`, ephemeral:true});
        }
        if(customId == "token_alterar") {
            const text = interaction.fields.getTextInputValue("text");
            await interaction.deferUpdate();
            editcomponent();
            
            const a = await interaction.fetchReply();
            const b = await ms.get(a.id);
            const c = await db.get(`${b.idapp}`);
            const te = await checkToken(text);
            if(!te) return interaction.followUp({content:`❌ | Coloque um token valido.`, ephemeral:true});
            const ta = await checkRedirectUrl(te.id, text, url);
            if(!ta) return interaction.followUp({content:`❌ | o BOT não tem o Redirect URL: \`\`\`${url}/api/callback\`\`\``, ephemeral:true});
            await db.set(`${b.idapp}.token`, text);
            await db.set(`${b.idapp}.idbot`, te.id);
            interaction.followUp({content:`✅ | Token Alterado Com Sucesso!`, ephemeral:true});
        }

        if(customId === "bio_bot") {
            const text = interaction.fields.getTextInputValue("bio");
            await interaction.deferUpdate();
            editcomponent();
            
            const a = await interaction.fetchReply();
            const b = await ms.get(a.id);
            const c = await db.get(`${b.idapp}`);
            if(!c.adicionais.includes("div") && interaction.user.id !== owner) return interaction.followUp({content:`❌ | Você não comprou o adicional \`Remoção da Divulgação\``, ephemeral:true});

            const url = 'https://discord.com/api/v10/applications/@me';
            const dat = {
                description: text,
            };
            const config = {
                headers: {
                    'Authorization': `Bot ${c.token}`,
                    'Content-Type': 'application/json'
                }
            };

            try {
                const response = await axios.patch(url, dat, config);
                interaction.followUp({content:`${interaction.user}, A Bio do Seu \`BOT\` foi alterado com sucesso.`, ephemeral:true});
            } catch (error) {
                interaction.followUp({
                    content:`${interaction.user}, Ocorreu um erro ao tentar alterar a Bio do seu bot.\nMensagem do Erro: \`${error.message}\``,
                    ephemeral:true
                });
            }

        }

        if(customId === "avatar_bot") {
            const text = interaction.fields.getTextInputValue("url");
            await interaction.deferUpdate();
            editcomponent();
            if(!text.startsWith("https://")) return interaction.followUp({content:`❌ | Coloque uma URL Valida.`, ephemeral:true});
            
            const a = await interaction.fetchReply();
            const b = await ms.get(a.id);
            const c = await db.get(`${b.idapp}`);
            const imagePath = './avatar.jpg';

            await downloadImage(text, imagePath);

            const image = fs.readFileSync(imagePath);
            const base64Image = `data:image/jpeg;base64,${image.toString('base64')}`;

            const url = 'https://discord.com/api/v8/users/@me';
            const data = {
                avatar: base64Image
            };
            const config = {
                headers: {
                    'Authorization': `Bot ${c.token}`,
                    'Content-Type': 'application/json'
                }
            };

            try {
                const response = await axios.patch(url, data, config);
                interaction.followUp({content:`${interaction.user}, O Avatar do Seu \`BOT\` foi alterado com sucesso.`, ephemeral:true});
            } catch (error) {
                interaction.followUp({
                    content:`${interaction.user}, Ocorreu um erro ao tentar alterar o Avatar do seu bot.\nMensagem do Erro: \`${error.message}\``,
                    ephemeral:true
                });
            }

        }

        if(customId === "name_bot") {
            const text = interaction.fields.getTextInputValue("name");
            await interaction.deferUpdate();
            editcomponent();
            const a = await interaction.fetchReply();
            const b = await ms.get(a.id);
            const c = await db.get(`${b.idapp}`);
            const url = 'https://discord.com/api/v8/users/@me';
            const data = {
                username: text
            };
            const config = {
                headers: {
                    'Authorization': `Bot ${c.token}`,
                    'Content-Type': 'application/json'
                }
            };

            try {
                const response = await axios.patch(url, data, config);
                interaction.followUp({content:`${interaction.user}, O Nome do Seu \`BOT\` foi alterado com sucesso.`, ephemeral:true});
            } catch (error) {
                interaction.followUp({
                    content:`${interaction.user}, Ocorreu um erro ao tentar alterar o nome do seu bot.\nMensagem do Erro: \`${error.message}\``,
                    ephemeral:true
                });
            }

        }
        if(customId === "confianca_user") {
            await interaction.deferUpdate();
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const blz = await db.get(`${f.idapp}.confia`);
            if(blz.includes(interaction.values[0])) return confi(); 
            await db.push(`${f.idapp}.confia`, interaction.values[0]);
            confi();
        }
        if(customId === "selecionarid") {
            const modal = new ModalBuilder()
            .setCustomId("selecionarid_modal")
            .setTitle("👤 - Selecionar um usuario por ID");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setLabel("Coloque o ID do usuario:")
            .setMinLength(5)
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if(customId === "selecionarid_modal") {
            await interaction.deferUpdate();
            const text = interaction.fields.getTextInputValue("text");
            if(!interaction.client.users.cache.get(text)) {
                confi();
                interaction.followUp({content:`❌ | Não encontrei esse usuário em nenhum lugar.`, ephemeral:true});
                return;
            }
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const blz = await db.get(`${f.idapp}.confia`);
            if(blz.includes(text)) return confi(); 
            await db.push(`${f.idapp}.confia`, text);
            confi();
        }
        if(customId === "removerconfi") {
            const modal = new ModalBuilder()
            .setCustomId("removerconfi_modal")
            .setTitle("🗑 - Remover pessoa de Confiança");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setRequired(true)
            .setLabel("Coloque o ID do usuário:");

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if(customId === "removerconfi_modal") {
            await interaction.deferUpdate();
            const text = interaction.fields.getTextInputValue("text");
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const blz = await db.get(`${f.idapp}.confia`);
            if(!blz.includes(text)) return confi(); 
            await db.pull(`${f.idapp}.confia`, text, true);
            confi();
        }
        if(customId === "gerenciar_servers") {
            await interaction.deferUpdate();
            const a = await interaction.fetchReply();
            const f = await ms.get(a.id);
            const def = await db.get(`${f.idapp}`);
    
    const pageSize = 25;
    let page = 0;

    const displayPage = async() => {
        const response = await axios.get('https://discord.com/api/v9/users/@me/guilds', {
            headers: {
                Authorization: `Bot ${def.token}`
            }
        }).catch(() => {});
        const guildsverify = Object.keys(def.servers);
const guilds = response?.data || [];


const serversMap = {};


for (const serverId of guildsverify) {
    const gd = def.servers[serverId]
    serversMap[serverId] = { id: serverId, name: gd.name ?? "Nome Desconhecido", registrado: true, description: gd.desc ?? `ID: ${serverId}`};
}


for (const server of guilds) {
    const serverId = server.id;
    if (serversMap[serverId]) {
        const gd = serversMap[serverId];
        if(serversMap[serverId].name === "Nome Desconhecido") {
            serversMap[serverId] = { id: serverId, name: server.name, registrado: true, description: gd.description };
        } else {
            serversMap[serverId] = { id: serverId, name: gd.name, registrado: true, description: gd.description };
        }
    } else {
        serversMap[serverId] = { id: serverId, name: server.name, registrado: false, description: `ID: ${serverId}` };
    }
}


const servers = Object.values(serversMap);


        const pageStart = page * pageSize;
        const pageEnd = pageStart + pageSize;
        const pageItems = servers.slice(pageStart, pageEnd);

        let start = (page - 1) * pageSize;
        let end = start + pageSize; 
      
        const numInicial = page * pageSize + 1; 
        const selec = new StringSelectMenuBuilder()
        .setCustomId("guild_select")
        .setPlaceholder("Selecione um Servidor")
        .setMaxValues(1);
        pageItems.map((entry, index) => {
           selec.addOptions(
            {
                label:`[${entry.registrado ? "REGISTRADO" : "NÃO REGISTRADO"}] - ${entry.name}`,
                emoji:`${entry.registrado ? "🟢" : "🔴"}`,
                description:`${entry.description}`,
                value:`${entry.id}`
            });
        });

        const row2 = new ActionRowBuilder().addComponents(selec);
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('voltar_page')
            .setEmoji('⬅️')
            .setDisabled(page === 0)
            .setStyle(1),
        )
        .addComponents(
          new ButtonBuilder()
          .setCustomId('18273h1782bnsabd')
          .setLabel(`Página ${page + 1}/${Math.ceil(servers.length / pageSize)}`)
          .setDisabled(true)
          .setStyle(2),
        )
        .addComponents(
          new ButtonBuilder()
            .setCustomId('proximo')
            .setEmoji('➡️')
            .setDisabled(page === Math.ceil(servers.length / pageSize) - 1)
            .setStyle(1),
        );
        const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel("Voltar")
            .setStyle(1)
            .setEmoji("⬅️")
            .setCustomId("voltar_1"),
            new ButtonBuilder()
            .setStyle(5)
            .setLabel("Convidar o BOT")
            .setURL(`https://discord.com/oauth2/authorize?client_id=${f.idapp}&permissions=17594870401040&scope=bot`)
        )
      
      return { components: [row2, row, row3] };
    };


 

    
    const { components } = await displayPage();

    if(components[0].components[0].options == 0) return interaction.followUp({content: `❌ Nenhum membro registrado ou BOT em nenhum servidor!`, ephemeral: true})


    const sentMessage = await interaction.editReply({ content:"", embeds:[], components, ephemeral:true });

    const filter = i => i.message.id === a.id;
    const collector = interaction.channel.createMessageComponentCollector({filter});
    collector.on('collect', async (interaction) => {
      
      if (interaction.customId === 'proximo') {
        page += 1;
        const { components } = await displayPage();
        await interaction.update({ components });
      } else if (interaction.customId === 'voltar_page') {
        page -= 1;
        const { components } = await displayPage();
        await interaction.update({ components });
      } else if(interaction.customId === "voltar_1") {
        collector.stop();
        await interaction.deferUpdate();
        editcomponent();
      } else if(interaction.customId === "guild_select") {
        await interaction.deferUpdate();
        collector.stop();
        const guild = interaction.values[0];
        if(def.servers[guild]) {
            guid(guild);
        } else {
            interaction.editReply({
                content:"",
                embeds: [
                    new EmbedBuilder()
                    .setTitle("🔴 | Servidor não registrado!")
                    .setDescription(`- Este servidor ainda não está registrado para atuar como um Auth\n- Mas para registrar esse servidor é bem simples, vamos configurar apenas 2 Coisas:\n\n1. **Webhook de LOGS** - Para você saber tudo o que está acontecendo;\n2. **Cargo de verificado** - O cargo que o BOT vai dar automaticamente quando alguém se verificar`)
                    .setColor("#2b2d31"),
                    new EmbedBuilder()
                    .setTitle("1. Webhook de LOGS")
                    .setDescription(`- Quando você já tiver a URL do webhook em mãos, basta inserir no botão \`Configurar Webhook\`\n\n** Essa é a configuração importantíssima, pois é com isso que você vai saber quem é que está se verificando, as possiveis ALTs, entre outras informações, tudo ao vivo!**`)
                    .setColor("2b2d31")
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("gerenciar_servers")
                        .setLabel("Voltar")
                        .setStyle(1)
                        .setEmoji("⬅️"),
                        new ButtonBuilder()
                        .setLabel("Configurar Webhook")
                        .setStyle(3)
                        .setCustomId(`${guild}_configwebhook`)
                    )
                ]
            });
        }
      }
      if (interaction.customId === "gopage") {

        const modal = new ModalBuilder()
        .setCustomId("gotopagerank")
        .setTitle("Go To Page")
      
        const num = new TextInputBuilder()
        .setCustomId("pagina")
        .setLabel("Qual vai ser a pagina?")
        .setStyle(1)
        .setMaxLength(2)
        .setRequired(true)
        .setPlaceholder("Escolha entre 1 a 99")
        modal.addComponents(new ActionRowBuilder().addComponents(num))
        await interaction.showModal(modal)
      }
      client.once('interactionCreate', async (interaction) => {
      if(interaction.isModalSubmit() && interaction.customId === "gotopagerank") {
        const text = interaction.fields.getTextInputValue('pagina')
      
        const newPage = parseInt(text)
        if (!isNaN(newPage) && newPage >= 1 && newPage <= Math.ceil(servers.length / pageSize)) {
          page = newPage - 1;
          const { embed, components } = displayPage();
      
          await interaction.update({ embeds: [embed], components });
        } else {
          interaction.reply({ content: "Número de página inválido. Certifique-se de inserir um número válido dentro do intervalo.", ephemeral: true });
        }
      
      } 
      })
      
    });
        }
        if(customId.endsWith("_actionguild")) {
            const guild = customId.split("_")[0];
            const values = interaction.values[0];
            if(values === "webhook") {
                const modal = new ModalBuilder()
                .setTitle(`Alterar Webhook de Logs`)
                .setCustomId(`${guild}_altwebhook123`);

                const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setLabel("Coloque o novo webhook:")
                .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            }
            if(values === "role") {
                const modal = new ModalBuilder()
                .setTitle(`Alterar Cargo de Verificado`)
                .setCustomId(`${guild}_altroleverify123`);

                const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setLabel("Coloque o ID do Cargo:")
                .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            }
            if(values === "send_message") {
                await interaction.deferUpdate();
                return interaction.followUp({
                    content:`- Escolha Qual forma você deseja Enviar \n - Configuravel da sua Forma abaixo`,
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId(`${guild}_sendmsgembed`)
                            .setLabel("Enviar mensagem em Embed")
                            .setStyle(1)
                            .setEmoji("<:1226008919407591507:1242279116145954856>"),
                            new ButtonBuilder()
                            .setCustomId(`${guild}_sendmsgcontent`)
                            .setLabel("Enviar mensagem em Texto")
                            .setStyle(1)
                            .setEmoji("<:1220490882239954965:1242270603772297296>") 
                        )
                    ],
                    ephemeral:true
                }).then(async(msg) => {
                    const ok = await interaction.fetchReply();
                    const ok1 = await ms.get(ok.id);
                    await ms.set(`${msg.id}`, {
                        botid: ok1.botid,
                        idapp: ok1.idapp
                    });
                })
                
            }
            if(values === "edit_server") {
                const modal = new ModalBuilder()
                .setCustomId(`${guild}_editserverkkk`)
                .setTitle("Modificar Informações Servidor");

                const text = new TextInputBuilder()
                .setCustomId("name")
                .setStyle(1)
                .setLabel("coloque o nome que ficará:")
                .setMaxLength(25)
                .setPlaceholder("(Caso não queira, Digite nada)")
                .setRequired(false);

                const text1 = new TextInputBuilder()
                .setCustomId("desc")
                .setStyle(1)
                .setLabel("coloque a descrição que ficará:")
                .setMaxLength(50)
                .setPlaceholder("(Caso não queira, Digite nada)")
                .setRequired(false);

                modal.addComponents(new ActionRowBuilder().addComponents(text));
                modal.addComponents(new ActionRowBuilder().addComponents(text1));

                return interaction.showModal(modal);
            }
        }
        if(customId.endsWith("_editserverkkk")) {
            const text = interaction.fields.getTextInputValue("name") || null;
            const text1 = interaction.fields.getTextInputValue("desc") || null;
            await interaction.deferUpdate();
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const guild = customId.split("_")[0];
            if(text) await db.set(`${f.idapp}.servers.${guild}.name`, text);
            if(text1) await db.set(`${f.idapp}.servers.${guild}.desc`, text1);
            
            interaction.followUp({content:`Para visualiza-los Clique no Botão "Voltar"`, ephemeral:true});
            guid(guild);
        }
        if(customId.endsWith("_sendmsgcontent")) {
            const guild = customId.split("_")[0];
            const modal = new ModalBuilder()
            .setTitle(`Enviar mensagem de verificação`)
            .setCustomId(`${guild}_sendmessagecontentmodal`);

            const text = new TextInputBuilder()
            .setLabel("Insira o texto da mensagem")
            .setStyle(2)
            .setMaxLength(3024)
            .setRequired(true)
            .setCustomId("text");

            const banner = new TextInputBuilder()
            .setLabel("insira o banner")
            .setStyle(1)
            .setRequired(false)
            .setCustomId("banner");

            const channel = new TextInputBuilder()
            .setCustomId("channel")
            .setLabel("insira o id do canal que será enviado")
            .setRequired(true)
            .setStyle(1);

            const button = new TextInputBuilder()
            .setCustomId("button")
            .setLabel("o que deve escrito no botão de verificação?")
            .setStyle(1)
            .setRequired(false)
            .setMaxLength(45);

            modal.addComponents(new ActionRowBuilder().addComponents(text));
            modal.addComponents(new ActionRowBuilder().addComponents(banner));
            modal.addComponents(new ActionRowBuilder().addComponents(channel));
            modal.addComponents(new ActionRowBuilder().addComponents(button));

            return interaction.showModal(modal);
        }
        if(customId.endsWith("_sendmessagecontentmodal")) {
            await interaction.deferUpdate();
            const guild = customId.split("_")[0];
            const text = interaction.fields.getTextInputValue("text");
            const button = interaction.fields.getTextInputValue("button") || "Verifique-se";
            const banner = interaction.fields.getTextInputValue("banner") || null;
            const channel = interaction.fields.getTextInputValue("channel");
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const grc = await db.get(`${f.idapp}`);
            const blz = await oauth2.generateAuthUrl({
                clientId: grc.idbot,
                clientSecret: grc.secret,
                scope: ['identify', 'gdm.join', "guilds.join", "email"],
                redirectUri: `${url}/api/callback`,
                state:`${f.idapp}+${guild}`
            });
            const {Client, GatewayIntentBits, Collection, Partials} = require("discord.js");
            const boti = new Client({
                intents: Object.keys(GatewayIntentBits),
                partials: Object.keys(Partials)
            });
            const files = [];
            if(banner) {
                const attach = new AttachmentBuilder(banner);
                files.push(attach);
            }
            await boti.login(grc.token).catch(() => {
                boti.destroy();
                return interaction.editReply({content:`❌ | Verifique se As Intents estão Ativadas e se o Token está Valido.`, ephemeral:true});
            });
            boti.on("ready", () => {
                const chan = boti.channels.cache.get(channel);
                if(!chan) {
                    interaction.editReply({content:`❌ | Verifique se você colocou o ID do canal Corretamente.`, ephemeral:true});
                    return boti.destroy();
                }
                chan.send({
                    content:`${text}`,
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setURL(`${blz}`)
                            .setStyle(5)
                            .setLabel(`${button}`)
                        )
                    ],
                    files
                }).then(() => {
                    interaction.editReply({content:`✔ | Mensagem enviada para o Canal: <#${channel}>`,components:[], ephemeral:true});
                    boti.destroy();
                }).catch((err) => {
                    
                    interaction.editReply({content:`❌ | O Bot está sem permissão de Enviar Mensagem Para este Canal.`, ephemeral:true});
                    boti.destroy();
                });
            })
        }
        if(customId.endsWith("_sendmsgembed")) {
            const guild = customId.split("_")[0];
            const modal = new ModalBuilder()
            .setTitle(`Enviar mensagem de verificação`)
            .setCustomId(`${guild}_sendmessagemodal`);

            const title = new TextInputBuilder()
            .setLabel("insira o título da embed")
            .setStyle(1)
            .setMaxLength(200)
            .setRequired(true)
            .setCustomId("title");

            const desc = new TextInputBuilder()
            .setCustomId("desc")
            .setLabel("Insira a descrição da embed")
            .setMaxLength(4000)
            .setRequired(false)
            .setStyle(2);

            const banner = new TextInputBuilder()
            .setLabel("insira o banner")
            .setStyle(1)
            .setRequired(false)
            .setCustomId("banner");

            const channel = new TextInputBuilder()
            .setCustomId("channel")
            .setLabel("insira o id do canal que será enviado")
            .setRequired(true)
            .setStyle(1);

            const button = new TextInputBuilder()
            .setCustomId("button")
            .setLabel("o que deve escrito no botão de verificação?")
            .setStyle(1)
            .setRequired(false)
            .setMaxLength(45);

            modal.addComponents(new ActionRowBuilder().addComponents(title));
            modal.addComponents(new ActionRowBuilder().addComponents(desc));
            modal.addComponents(new ActionRowBuilder().addComponents(banner));
            modal.addComponents(new ActionRowBuilder().addComponents(channel));
            modal.addComponents(new ActionRowBuilder().addComponents(button));

            return interaction.showModal(modal);
        }
        if(customId.endsWith("_sendmessagemodal")) {
            await interaction.deferUpdate();
            const guild = customId.split("_")[0];
            const title = interaction.fields.getTextInputValue("title");
            const button = interaction.fields.getTextInputValue("button") || "Verifique-se";
            const desc = interaction.fields.getTextInputValue("desc") || `**   Sistema de Verificaçao **\n** Tenha acesso tudo ao servidor se verificando.**\n** Assim teremos total segurança com todos.**\n** | Clique no ${button} para se verificar **`;
            const banner = interaction.fields.getTextInputValue("banner") || ("https://cdn.discordapp.com/attachments/1251231167479414887/1253913303420239903/1719025293619.png?ex=66783e04&is=6676ec84&hm=f21ea13eb50df9e37da4ddbdc8d9e64692052ee2872c08370d44ca9408497ebb&");
            const channel = interaction.fields.getTextInputValue("channel");
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const grc = await db.get(`${f.idapp}`);
            const blz = await oauth2.generateAuthUrl({
                clientId: grc.idbot,
                clientSecret: grc.secret,
                scope: ['identify', 'gdm.join', "guilds.join", "email"],
                redirectUri: `${url}/api/callback`,
                state:`${f.idapp}+${guild}`
            });
            const {Client , GatewayIntentBits,Collection, Partials, } = require("discord.js");
            const boti = new Client({
                intents: Object.keys(GatewayIntentBits),
                partials: Object.keys(Partials)
            });
            await boti.login(grc.token).catch(() => {
                boti.destroy();
                return interaction.editReply({content:`❌ | Verifique se As Intents estão Ativadas e se o Token está Valido.`, ephemeral:true});
            });
            boti.on("ready", () => {
                const chan = boti.channels.cache.get(channel);
                if(!chan) {
                    interaction.editReply({content:`❌ | Verifique se você colocou o ID do canal Corretamente.`, ephemeral:true});
                    return boti.destroy();
                }
                chan.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`${title}`)
                        .setDescription(`${desc}`)
                        .setImage(banner)
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setURL(`${blz}`)
                            .setStyle(5)
                            .setLabel(`${button}`)
                        )
                    ]
                }).then(() => {
                    interaction.editReply({content:`✔ | Mensagem enviada para o Canal: <#${channel}>`, ephemeral:true});
                    boti.destroy();
                }).catch((err) => {
                    console.log(err.message);
                    interaction.editReply({content:`❌ | O Bot está sem permissão de Enviar Mensagem Para este Canal.`, ephemeral:true});
                    boti.destroy();
                });
            })
        }
        if(customId.endsWith("_altroleverify123")) {
            const text = interaction.fields.getTextInputValue("text");
            await interaction.deferUpdate();
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const guild = customId.split("_")[0];
            const fd = await db.get(`${f.idapp}`);
            const tst = await isValidRole(guild, text, fd.token);
            if(!tst) return interaction.followUp({content:`❌ | Coloque um Cargo Valido.`, ephemeral:true});
            
            await db.set(`${f.idapp}.servers.${guild}.role`, text);
            guid(guild);
        }
        if(customId.endsWith("_altwebhook123")) {
            const text = interaction.fields.getTextInputValue("text");
            await interaction.deferUpdate();
            const guild = customId.split("_")[0];
            const test = await verifyWebhook(text);
            if(!test) return interaction.followUp({content: `❌ | Coloque um webhook valido.`, ephemeral:true});
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            await db.set(`${f.idapp}.servers.${guild}.webhook`, text);
            guid(guild);
        }
        if(customId.endsWith("_configwebhook")) {
          const guild = customId.split("_")[0];
          const modal = new ModalBuilder()
          .setCustomId(`${guild}_configwebhookmodal`)
          .setTitle(`Configurar Webhook`);
  
          const text = new TextInputBuilder()
          .setCustomId("text")
          .setStyle(1)
          .setRequired(true)
          .setLabel("Insira a url do webhook");
  
          modal.addComponents(new ActionRowBuilder().addComponents(text));
  
          return interaction.showModal(modal);
        }
        if(customId.endsWith("_configwebhookmodal")) {
          const text = interaction.fields.getTextInputValue("text");
          await interaction.deferUpdate();
          const guild = customId.split("_")[0];
          const test = await verifyWebhook(text);
          if(!test) return interaction.followUp({content: `❌ | Coloque um webhook valido.`, ephemeral:true});
          const e = await interaction.fetchReply();
          await ms.set(`${e.id}_${guild}`, text);
          interaction.editReply({
              content:"",
              embeds: [
                  new EmbedBuilder()
                  .setTitle("🔴 | Servidor não registrado!")
                  .setDescription(`- Este servidor ainda não está registrado para atuar como um Auth\n- Mas para registrar esse servidor é bem simples, vamos configurar apenas 2 Coisas: \n - E agora por ultimo voce ira configurar o cargo de verificado para o servidor. \n\n 1. **Webhook de LOGS** - Para você saber tudo o que está acontecendo; \n 2. **Cargo de verificado** - O cargo que o BOT vai dar automaticamente quando alguém se verificar`)
                  .setColor("#2b2d31"),
                  new EmbedBuilder()
                  .setTitle(" 2. Cargo de Verificado")
                  .setDescription(`😁 **Ótimo, o webhook foi configurado!** \n 🙋 Agora, vamos configurar o cargo de verificado. \n\n - Esse será o cargo que o bot vai dar automaticamente pros membros que se verificarem, geralmente esse cargo é necessário pra ter acesso ao servidor\n- Para configurar, basta inserir o ID do cargo abaixo.`)
                  .setColor("#2b2d31")
              ],
              components: [
                  new ActionRowBuilder()
                  .addComponents(
                      new ButtonBuilder()
                      .setCustomId("gerenciar_servers")
                      .setLabel("Voltar")
                      .setStyle(1)
                      .setEmoji("⬅️"),
                      new ButtonBuilder()
                      .setLabel("Configurar cargo de verificado")
                      .setStyle(3)
                      .setCustomId(`${guild}_configrole`)
                  )
              ]
          });
        }
        if(customId.endsWith("_configrole")) {
            const guild = customId.split("_")[0];
            const modal = new ModalBuilder()
            .setTitle("Configurar cargo de verificado")
            .setCustomId(`${guild}_configrolemodal`);

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setRequired(true)
            .setLabel("insira o id do cargo verificado");

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if(customId.endsWith("_configrolemodal")) {
            const text = interaction.fields.getTextInputValue("text");
            await interaction.deferUpdate();
            const guild = customId.split("_")[0];
            const e = await interaction.fetchReply();
            const wbh = await ms.get(`${e.id}_${guild}`);
            const f = await ms.get(e.id);
            const fd = await db.get(`${f.idapp}`);
            const tst = await isValidRole(guild, text, fd.token);
            if(!tst) return interaction.followUp({content:`❌ | Coloque um Cargo Valido.`, ephemeral:true});
            await db.set(`${f.idapp}.servers.${guild}`, {
                id: guild,
                role: text,
                webhook: wbh,
            });
            interaction.editReply({
                content:"",
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`✅ | Servidor registrado com sucesso!`)
                    .setColor("#2b2d31")
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("gerenciar_servers")
                        .setLabel("Ir para a seleção de servidores")
                        .setStyle(3)
                        .setEmoji("⬅️"),
                    )
                ]
            });
        }
        if(customId === "puxar_members") {
            const now = Date.now();
                
            if (cooldowns.has(interaction.user.id)) {
            const cooldownAmount = 2 * 60 * 60 * 1000;
                const expirationTime = cooldowns.get(interaction.user.id) + cooldownAmount;
                const timeLeft = expirationTime - now;

                if (timeLeft > 0) {
                    const timeLeftSeconds = Math.ceil(timeLeft / 1000);
                    const timeLeftFormatted = `<t:${Math.floor(timeLeftSeconds + (now / 1000))}:f> (<t:${Math.floor(timeLeftSeconds + (now / 1000))}:R>)`;
                    interaction.reply({content:`✋ | Você está no Cooldown, aguarde até que termine!\n⏰ | Tempo do Cooldown: ${timeLeftFormatted}`, ephemeral:true});
                    return;
                }
            }
            const modal = new ModalBuilder()
            .setTitle("Puxar membros")
            .setCustomId("puxarmembros_modal");

            const text = new TextInputBuilder()
            .setCustomId("idserver")
            .setLabel("insira o id do novo servidor")
            .setStyle(1)
            .setRequired(true);

            const text1 = new TextInputBuilder()
            .setCustomId("puxada")
            .setLabel(`Quantidade pra puxar ao servidor:`)
            .setRequired(true)
            .setStyle(1);

            modal.addComponents(new ActionRowBuilder().addComponents(text));
            modal.addComponents(new ActionRowBuilder().addComponents(text1));

            
            return interaction.showModal(modal);
        }
        if(customId === "puxarmembros_modal") {
            await interaction.deferUpdate();
            const now = Date.now();
            const cooldownAmount = 2 * 60 * 60 * 1000;
            const idserver = interaction.fields.getTextInputValue("idserver");
            const puxada = parseInt(interaction.fields.getTextInputValue("puxada"));
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const a = await db.get(`${f.idapp}`);
            if(!a.adicionais?.includes("cooldown") && interaction.user.id !== owner) cooldowns.set(interaction.user.id, now + cooldownAmount);
            const testguild = checkGuildJoin(a.token, idserver);
            if(!testguild) return interaction.followUp({content:`❌ | O BOT não está no Servidor fornecido.`, ephemeral:true});
            if(isNaN(puxada)) return interaction.followUp({content:`❌ | Coloque um numero valido.`, ephemeral:true});
            if(puxada > a.verify.length) return interaction.followUp({content:`❌ | Você só tem \`${a.verify.length} Membros\` Verificados.`, ephemeral:true});
            if(puxada <= 0) return interaction.followUp({content:`❌ | Coloque uma quantidade acima de \`0\``, ephemeral:true});
            interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`**⏰\`${puxada}\` Membros serão puxados nas proximas 24H!**`)
                    .setColor("Green")
                ],
                ephemeral:true
            });
            
            
            let nu = 0;
            const logs_channel = interaction.client.channels.cache.get(await data.get(`logs`));
            if(logs_channel) logs_channel.send({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`ogs Puxadas`)
                    .setColor("Green")
                    .addFields(
                        {
                            name:" Usuário",
                            value:`**${interaction.user} - \`${interaction.user.id}\`**`
                        },
                        {
                            name:" Puxadas Totais:",
                            value:`\`${puxada} Membros\``
                        },
                        {
                            name:" ID do Servidor: ",
                            value:`\`${idserver}\``,
                            inline: false
                        },
                        {
                            name:" Horário:",
                            value:`**<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/1000)}:R>)**`,
                            inline:false
                        },
                    )
                ]
            });
            while(nu <= puxada) {
                const users = await db.get(`${f.idapp}.verify`);
                const user = users[nu];
                nu++;
                if(user) {
                    const token = user.token;

                const renew = await renewToken(token.refresh_token, token.code, a.idbot, a.secret);
                await db.pull(`${f.idapp}.verify`, a => a.token.refresh_token !== token.refresh_token, true);
                
				const body = { access_token: renew?.access_token ?? token.access_token }
				const response2 = await axios.put(`https://discord.com/api/guilds/${idserver}/members/${user.id}`, JSON.stringify(body), {
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
        if(customId.endsWith("_removerserverauth")) {
            const modal = new ModalBuilder()
            .setTitle(`Remover Servidor da Auth`)
            .setCustomId(`${customId.split("_")[0]}_removerserverauthmodal`);

            const text = new TextInputBuilder()
            .setCustomId(`text`)
            .setStyle(1)
            .setRequired(true)
            .setLabel("você tem certeza?")
            .setPlaceholder("SIM")
            .setMaxLength(3)
            .setMinLength(3);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }
        if(customId.endsWith("_removerserverauthmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            await interaction.deferUpdate();
            if(text !== "SIM") return interaction.followUp({content:`❌ | Cancelado com sucesso.`, ephemeral:true});
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            await db.delete(`${f.idapp}.servers.${customId.split("_")[0]}`);
            interaction.editReply({
                content:`❌ | Servidor Deletado com sucesso!`,
                embeds: [],
                components: []
            });
        }
        if(customId.endsWith("_puxarmembersguild")) {
            const now = Date.now();
                
            if (cooldowns.has(interaction.user.id)) {
            const cooldownAmount = 2 * 60 * 60 * 1000;
                const expirationTime = cooldowns.get(interaction.user.id) + cooldownAmount;
                const timeLeft = expirationTime - now;

                if (timeLeft > 0) {
                    const timeLeftSeconds = Math.ceil(timeLeft / 1000);
                    const timeLeftFormatted = `<t:${Math.floor(timeLeftSeconds + (now / 1000))}:f> (<t:${Math.floor(timeLeftSeconds + (now / 1000))}:R>)`;
                    interaction.reply({content:`✋ | Você está no Cooldown, aguarde até que termine!\n⏰ | Tempo do Cooldown: ${timeLeftFormatted}`, ephemeral:true});
                    return;
                }
            }
            const modal = new ModalBuilder()
            .setCustomId(`${customId.split("_")[0]}_puxarmemberguildmodal`)
            .setTitle("Puxar Membros do Servidor");

            const text = new TextInputBuilder()
            .setCustomId("idserver")
            .setLabel("insira o id do novo servidor")
            .setStyle(1)
            .setValue(`${customId.split("_")[0]}`)
            .setRequired(true);

            const text1 = new TextInputBuilder()
            .setCustomId("puxada")
            .setLabel(`Quantidade pra puxar ao servidor:`)
            .setRequired(true)
            .setStyle(1);

            modal.addComponents(new ActionRowBuilder().addComponents(text));
            modal.addComponents(new ActionRowBuilder().addComponents(text1));

            
            return interaction.showModal(modal);
        }
        if(customId.endsWith("_puxarmemberguildmodal")) {
            await interaction.deferUpdate();
            const now = Date.now();
            const cooldownAmount = 2 * 60 * 60 * 1000;
            const guild = customId.split("_")[0];
            const idserver = interaction.fields.getTextInputValue("idserver");
            const puxada = parseInt(interaction.fields.getTextInputValue("puxada"));
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const a = await db.get(`${f.idapp}`);
            if(!a.adicionais?.includes("cooldown")) cooldowns.set(interaction.user.id, now + cooldownAmount);
            
            const testguild = checkGuildJoin(a.token, idserver);
            const users = a.verify.filter(a => a.state === guild);
            if(!testguild) return interaction.followUp({content:`❌ | O BOT não está no Servidor fornecido.`, ephemeral:true});
            if(isNaN(puxada)) return interaction.followUp({content:`❌ | Coloque um numero valido.`, ephemeral:true});
            if(puxada > a.length) return interaction.followUp({content:`❌ | Você só tem \`${users.length} Membros\` Verificados.`, ephemeral:true});
            if(puxada <= 0) return interaction.followUp({content:`❌ | Coloque uma quantidade acima de \`0\``, ephemeral:true});
            interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`**⏰\`${puxada}\` Membros serão puxados nas proximas 24H!**`)
                    .setColor("Green")
                ],
                ephemeral:true
            });
            

            const ok = [];
            let nu = 0;
            const logs_channel = interaction.client.channels.cache.get(await data.get(`logs`));
            if(logs_channel) logs_channel.send({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`Logs Puxadas`)
                    .setColor("Green")
                    .addFields(
                        {
                            name:" Usuário",
                            value:`**${interaction.user} - \`${interaction.user.id}\`**`
                        },
                        {
                            name:"Puxadas Totais:",
                            value:`\`${puxada} Membros\``
                        },
                        {
                            name:" ID do Servidor: ",
                            value:`\`${idserver}\``,
                            inline: false
                        },
                        {
                            name:"  Horário:",
                            value:`**<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/1000)}:R>)**`,
                            inline:false
                        },
                    )
                ]
            });
            while(nu <= puxada) {
                const users = await db.get(`${f.idapp}.verify`);
                const user = users[nu];
                nu++;
                if(user) {
                    const token = user.token;

                const renew = await renewToken(token.refresh_token, token.code, a.idbot, a.secret);
                await db.pull(`${f.idapp}.verify`, a => a.token.refresh_token !== token.refresh_token, true);
                
				const body = { access_token: renew?.access_token ?? token.access_token }
				const response2 = await axios.put(`https://discord.com/api/guilds/${idserver}/members/${user.id}`, JSON.stringify(body), {
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
        if(customId.endsWith("renovar_bot")) {
            await interaction.deferUpdate();
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const grc = await db.get(`${f.idapp}`);
            let time = 30;
            if(grc.plano == "semanal") {
                time = 7
            } else if(grc.plano === "quinzenal") {
                time = 15;
            }
            let preco = Number(await data.get(`bot.${grc.plano}`));
            let precoadicionais = 0.00
            grc.adicionais.map((add) => {
                precoadicionais += Number(data.get("adicionais." + add));
            });
            await ms.set(`${e.id}_renovar`, {
                plano: grc.plano,
                dias: time,
                precototal: Number(preco + precoadicionais).toFixed(2),
                quantidade: 1
            });
            const dataValidade = new Date(grc.validade);

            dataValidade.setDate(dataValidade.getDate() + time);

            const timestamp = Math.floor(dataValidade.getTime() / 1000);

            interaction.editReply({
                content:"",
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`- **Seu Plano:** \`${grc.plano}\`\n- **Quantidade selecionada:** \`1\`\n- **Dias para renovar:** \`${time}\``),
                    new EmbedBuilder()
                    .setDescription(`- **Resumo do seu carrinho de renovação**\n\n- \` R$ ${preco.toFixed(2)} \`・Valor do seu plano\n- \` R$ ${precoadicionais.toFixed(2)} \`・Valor dos adicionais (${grc.adicionais.length})\n\n- **Total: \`R$ ${Math.floor(preco + precoadicionais).toFixed(2)}\`**\n - Você terá seu bot garantido até <t:${timestamp}:d>\n - Após renovar, seu bot expirará somente <t:${timestamp}:R>`)
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`addrenovar`)
                        .setEmoji("<:mais_white:1219667468432314479>")
                        .setStyle(1),
                        new ButtonBuilder()
                        .setCustomId(`removerenovar`)
                        .setEmoji("<:menos_white:1219667508424867960>")
                        .setStyle(1),
                        new ButtonBuilder()
                        .setCustomId(`finalizar_renovar`)
                        .setEmoji("<:1225937077351219242:1242267722902016121>")
                        .setLabel("Finalizar pedido")
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId(`voltar`)
                        .setEmoji("⬅️")
                        .setLabel("Voltar")
                        .setStyle(2),
                    )
                ]
            });   
        }
        if(customId === "removerenovar") {
            await interaction.deferUpdate();
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const ren = await ms.get(`${e.id}_renovar`);
            if(ren.quantidade <= 1) return;
            await ms.sub(`${e.id}_renovar.quantidade`, 1);
            embedrenovar();
        }
        if(customId === "addrenovar") {
            await interaction.deferUpdate();
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const ren = await ms.get(`${e.id}_renovar`);
            await ms.add(`${e.id}_renovar.quantidade`, 1);
            embedrenovar();
        }
        if(customId === "finalizar_renovar") {
            await interaction.deferUpdate();
            const asd = interaction.channel.threads.cache.find(x => x.name === `🛒・${interaction.user.username}・${interaction.user.id}`);
            if(asd) return interaction.editReply({content: `**Você já tem um carrinho criado!**`,embeds: [], ephemeral: true,components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(5).setLabel('🛒・Ir para carrinho').setURL(`${asd.url}`))]});
            await interaction.editReply({content:"**Aguarde um momento, estou criando seu carrinho.**..", embeds:[], components:[], ephemeral:true});
            
            
            
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const ren = await ms.get(`${e.id}_renovar`);
            let time = ren.dias * ren.quantidade;
            const grc = await db.get(`${f.idapp}`);
            let preco = Number(await data.get(`bot.${ren.plano}`) * ren.quantidade);
            let precoadicionais = 0.00;
            grc.adicionais.map((add) => {
                precoadicionais += Number(data.get("adicionais." + add));
            });
            precoadicionais = Number(precoadicionais * ren.quantidade);
            
            const dataValidade = new Date(grc.validade);

            dataValidade.setDate(dataValidade.getDate() + time);

            const timestamp = Math.floor(dataValidade.getTime() / 1000);

            const min1 = moment1().tz("America/Argentina/Buenos_Aires").add(10, 'minutes').toISOString();
            const min2 = moment1().tz("America/Argentina/Buenos_Aires").add(10, 'minutes');
            let saldo = Number(preco * precoadicionais);
            if(saldo === 0) {
                saldo = Number(preco);
            }
            const generateRandomString = (length) => {
                const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
            }
            const acesstoken = await data.get(`acesstoken`);
            const ID = `PRANO${generateRandomString(35)}`
            mercadopago.configurations.setAccessToken(acesstoken);
            var payment_data = {
                transaction_amount: Number(saldo),
                description: `RENOVAÇÃO AUTH - ${interaction.user.username}`,
                payment_method_id: 'pix',
                payer: {
                    email: "jonatagabriel129@gmail.com",
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


            const thread = await interaction.channel.threads.create({
                name:`🛒・${interaction.user.username}・${interaction.user.id}`,
                autoArchiveDuration: 60,
                type: ChannelType.PrivateThread,
                reason: `Renovar AUTH`,
            });
            
            const min123 = moment().add(10, 'minutes');
            const time123 = Math.floor(min123.valueOf() / 1000);
            const msg = await thread.send({
                content:`${interaction.user}`,
                embeds:[
                    new EmbedBuilder()
                    .setTitle("Pague Via Pix")
                    .setDescription(`- **Resumo do seu carrinho de renovação**\n\n- \` R$ ${preco} \`・Valor do seu plano\n- \` R$ ${precoadicionais.toFixed(2)} \`・Valor dos adicionais (${grc.adicionais.length})\n\n- **Total: \`R$ ${Number(preco + precoadicionais).toFixed(2)}\`**\n - Você terá seu bot garantido até <t:${timestamp}:d>\n - Após renovar, seu bot expirará somente <t:${timestamp}:R>`),
                    new EmbedBuilder()
                    .setAuthor({name:`${interaction.user.username}`, iconURL:interaction.member.displayAvatarURL()})
                    .setDescription(`- **Pague via QR CODE ou código Pix** \n - O código expirará em 10 minutos`)
                    .setImage("attachment://payment.png")
                    .setFooter({text:`📅 - Pagamento expira em 10 minutos.`})
                    .setTimestamp()
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setLabel('Código Copia e Cola')
                            .setEmoji(`<:pix:1242558061760086137>`)
                            .setCustomId('pcpc')
                            .setDisabled(false)
                            .setStyle(2),
                            new ButtonBuilder()
                            .setLabel("Aprovar pedido")
                            .setEmoji("<a:c_sim:1242559854070206535>")
                            .setCustomId("aprovar_pdd")
                            .setStyle(2),
                            new ButtonBuilder()
                            .setCustomId(`cancelar123`)
                            .setLabel("Cancelar pedido")
                            .setEmoji("<a:c_nao:1242558302836232284>")
                            .setStyle(4),
                            )
                        ],
                        files:[qrCodeAttachment]
                    });
        interaction.editReply({
            content:"",
            embeds:[
                new EmbedBuilder()
                .setAuthor({name:`${interaction.client.user.username}`, iconURL: interaction.guild.iconURL()})
                .setDescription(`${interaction.user}, Seu carrinho foi aberto com sucesso em: ${thread.url}**`)
                .setColor("Green")
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel("・Ir para o Carrinho")
                    .setStyle(5)
                    .setURL(thread.url)
                    .setEmoji("<:carrinho_storm:1242273862369021953>")
                )
            ]
        });
        await ms.set(`${thread.id}.status`, false);
            

        const buceta = setTimeout(() => {
            
            thread.delete();
        }, 12 * 60 * 1000);

        const collectorFilter = (interaction) => interaction.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter: collectorFilter });
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
                        await ms.set(`${thread.id}.status`, true);
                    } else {
                        const sts = await ms.get(`${thread.id}.status`);
                        if(!sts){
                            return interaction.followUp({content:`❔ | Pagamento ainda não foi encontrado!`, ephemeral:true});
                        }
                    }
                  }).catch(err => {
                    interaction.followUp({content:`❌ | Ocorreu um erro ao verificar seu Pagamento.`, ephemeral:true});
                  });
                  const sts = await ms.get(`${thread.id}.status`);
            if(sts) {
                
                clearTimeout(buceta);
                await interaction.channel.bulkDelete(25);
                interaction.channel.edit({name:`✅・${interaction.user.username}・${interaction.user.id}`});
                setTimeout(() => {
                    interaction.channel.send({
                        content:`${interaction.user} | Sua compra foi aprovada com sucesso e já foi adicionado o Tempo ao seu Auth/BOT`
                    });
                }, 500);
                const chn_logs = interaction.client.channels.cache.get(await data.get("logs"));
    
                if(chn_logs) chn_logs.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Compra Aprovada`)
                        .setColor("Green")
                        .addFields(
                            {
                                name:"🙎‍♂️ Usuário",
                                value:`**${interaction.user} - \`${interaction.user.id}\`**`
                            },
                            {
                                name:"💰 Valor Total",
                                value:`**R$ ${Number(preco + precoadicionais).toFixed(2)}**`
                            },
                            {
                                name:"🛍️ Nova Data de Vencimento: ",
                                value:`<t:${timestamp}:f> (<t:${timestamp}:R>)`,
                                inline: false
                            },
                            {
                                name:"⏰  Horário:",
                                value:`**<t:${Math.floor(new Date() / 1000)}:f> (<t:${Math.floor(new Date()/1000)}:R>)**`,
                                inline:false
                            },
                        )
                        .setFooter({text:"Pagamento processado pela・https://discord.com/invite/5ERAuBxdK8", iconURL: interaction.client.user.avatarURL()})
                    ]
                });
				setTimeout(() => {
					interaction.channel.delete();
				}, 10000);
                await db.set(`${f.idapp}.validade`, `${dataValidade.toISOString().slice(0, 10)}T${dataValidade.toISOString().slice(11, -5)}+00:00`);
                await db.set(`${f.idapp}.ativo`, false);
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
        if(customId === "adicionais_bot") {
            await interaction.deferUpdate();
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const grc = await db.get(`${f.idapp}`);
            await ms.set(`${e.id}_adicionais`, []);
            const addc = grc.adicionais;
            if(addc.length >= 4) return interaction.followUp({content:`📦 | Você já tem todos os Adicionais.`, ephemeral:true});
            const precos = await data.get("adicionais");
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
            let be = null;
            const xd = Number(Math.floor(4 - addc.length ));
            const select = new StringSelectMenuBuilder().setCustomId(`adicionais_buy`).setPlaceholder("➕ Adquira um adicional").setMaxValues(xd);
            b.map((rs) => {
                if(!addc.includes(rs.id)) {
                    select.addOptions(
                        {
                            label: rs.label,
                            description:`💸 Valor: R$ ${rs.valor}`,
                            value:`${rs.id}`
                        }
                    )
                } else {
                    if(be) {
                        be += ` - \`R$ ${rs.valor}\` ${rs.label}\n`;
                    } else {
                        be = `\n- **Todas as suas Adicionais:**\n - \`R$ ${rs.valor}\` ${rs.label}\n`;
                    }

                }
            });
            interaction.editReply({
                content:"",
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`- **No momento, você tem \`${addc.length}\` adicionais no seu bot!** \n - Para adquirir qualquer adicional, basta seleciona-los abaixo \n- Para conhecer melhor nossos adicionais, clique em \`Listar adicionais\` \n`)
                    .setColor("#2b2d31"),
                    new EmbedBuilder()
                    .setDescription(`- **Você ainda não selecionou nenhum adicional para compra.**`)
                    .setColor("#2b2d31")
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(select),
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("voltar")
                        .setLabel("Voltar")
                        .setStyle(1)
                        .setEmoji("⬅️"),
                        new ButtonBuilder()
                        .setCustomId("listadd")
                        .setLabel("Listar adicionais")
                        .setStyle(2)
                        .setEmoji("<:lupa:1242270238746218531>"),
                        new ButtonBuilder()
                        .setCustomId("finalizar_adicionais")
                        .setLabel("Finalizar pedido")
                        .setDisabled(true)
                        .setStyle(3)
                        .setEmoji("✅")
                    )
                ]
            });
        }
        if(customId.endsWith("adicionais_buy")) {
            const value = interaction.values;
            await interaction.deferUpdate();
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const grc = await db.get(`${f.idapp}`);
            const addc = grc.adicionais;
            const precos = await data.get("adicionais");
            await ms.set(`${e.id}_adicionais`, value);
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
            const xd = Number(Math.floor(4 - addc.length ));
            const select = new StringSelectMenuBuilder().setCustomId(`adicionais_buy`).setPlaceholder("➕ Adquira um adicional").setMaxValues(xd);
            let kkk = "- **Todos os Adicionais Selecionados:**\n\n"; 
            const bl = await ms.get(`${e.id}_adicionais`);
            let be = null;
            b.map((rs) => {
                if(!addc.includes(rs.id)) {
                    select.addOptions(
                        {
                            label: rs.label,
                            description:`💸 Valor: R$ ${rs.valor}`,
                            value:`${rs.id}`
                        }
                    );
                } else {
                    if(be) {
                        be += ` - \`R$ ${rs.valor}\` ${rs.label}\n`;
                    } else {
                        be = `\n- **Todas as suas Adicionais:**\n - \`R$ ${rs.valor}\` ${rs.label}\n`;
                    }

                }
                if(bl.includes(rs.id)) {
                    kkk += `- \`R$ ${rs.valor}\` ${rs.label}\n`;
                    
                }
            });
            interaction.editReply({
                content:"",
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`- **No momento, você tem \`${addc.length}\` adicionais no seu bot!**\n- Para adquirir qualquer adicional, basta seleciona-los abaixo\n- Para conhecer melhor nossos adicionais, clique em \`Listar adicionais\`\n${be}`)
                    .setColor("#2b2d31"),
                    new EmbedBuilder()
                    .setDescription(`${kkk}`)
                    .setColor("#2b2d31")
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(select),
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("voltar")
                        .setLabel("Voltar")
                        .setStyle(1)
                        .setEmoji("⬅️"),
                        new ButtonBuilder()
                        .setCustomId("listadd")
                        .setLabel("Listar adicionais")
                        .setStyle(2)
                        .setEmoji("<:lupa:1242270238746218531>"),
                        new ButtonBuilder()
                        .setCustomId("finalizar_adicionais")
                        .setLabel("Finalizar pedido")
                        .setStyle(3)
                        .setEmoji("✅")
                    )
                ]
            });

        }
        if(customId === "finalizar_adicionais") {
            await interaction.deferUpdate();
            const asd = interaction.channel.threads.cache.find(x => x.name === `🛒・${interaction.user.username}・${interaction.user.id}`);
            if(asd) return interaction.editReply({content: `❌ Você já tem um carrinho criado!`,embeds: [], ephemeral: true,components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(5).setLabel('🛒・Ir para carrinho').setURL(`${asd.url}`))]});
            await interaction.editReply({content:" Aguarde um momento, estou criando seu carrinho...", embeds:[], components:[], ephemeral:true});
            
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const grc = await db.get(`${f.idapp}`);
            const addc = grc.adicionais;
            const precos = await data.get("adicionais");
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
            const xd = Number(Math.floor(addc.length + 8 / 2).toFixed(0));
            const select = new StringSelectMenuBuilder().setCustomId(`adicionais_buy`).setPlaceholder("➕ Adquira um adicional").setMaxValues(xd);
            let kkk = ""; 
            const bl = await ms.get(`${e.id}_adicionais`);
            let saldo = 0;
            b.map((rs) => {
                if(!addc.includes(rs.id)) {
                    select.addOptions(
                        {
                            label: rs.label,
                            description:`💸  Valor: R$ ${rs.valor}`,
                            value:`${rs.id}`
                        }
                    );
                }
                if(bl.includes(rs.id)) {
                    kkk += `- \`R$ ${rs.valor}\` ${rs.label}\n`;
                    saldo = Number(saldo + rs.valor);
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
            var payment_data = {
                transaction_amount: Number(saldo),
                description: `RENOVAÇÃO AUTH - ${interaction.user.username}`,
                payment_method_id: 'pix',
                payer: {
                    email: "jonatagabriel129@gmail.com",
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


            const thread = await interaction.channel.threads.create({
                name:`🛒・${interaction.user.username}・${interaction.user.id}`,
                autoArchiveDuration: 60,
                type: ChannelType.PrivateThread,
                reason: `Comprar Adicionais`,
            });
            
            const min123 = moment().add(10, 'minutes');
            const time123 = Math.floor(min123.valueOf() / 1000);
            const msg = await thread.send({
                content:`${interaction.user}`,
                embeds:[
                    new EmbedBuilder()
                    .setTitle("Pague Via Pix")
                    .setDescription(`- **Resumo do seu carrinho de Adicionais**\n\n${kkk}`),
                    new EmbedBuilder()
                    .setAuthor({name:`${interaction.user.username}`, iconURL:interaction.member.displayAvatarURL()})
                    .setDescription(`- **Pague via QR CODE ou código Pix** \n - O código expirará em 10 minutos`)
                    .setImage("attachment://payment.png")
                    .setFooter({text:`📅 - Pagamento expira em 10 minutos.`})
                    .setTimestamp()
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setLabel('Código Copia e Cola')
                            .setEmoji(`<:pix:1242558061760086137>`)
                            .setCustomId('pcpc')
                            .setDisabled(false)
                            .setStyle(2),
                            new ButtonBuilder()
                            .setLabel("Aprovar pedido")
                            .setEmoji("<a:c_sim:1242559854070206535>")
                            .setCustomId("aprovar_pdd")
                            .setStyle(2),
                            new ButtonBuilder()
                            .setCustomId(`cancelar123`)
                            .setLabel("Cancelar pedido")
                            .setEmoji("<a:c_nao:1242558302836232284>")
                            .setStyle(4),
                            )
                        ],
                        files:[qrCodeAttachment]
                    });
        interaction.editReply({
            content:"",
            embeds:[
                new EmbedBuilder()
                .setAuthor({name:`${interaction.client.user.username}`, iconURL: interaction.guild.iconURL()})
                .setDescription(`✅ **| ${interaction.user}, Seu carrinho foi aberto com sucesso em: ${thread.url}**`)
                .setColor("Green")
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel("Ir para o Carrinho")
                    .setStyle(5)
                    .setURL(thread.url)
                )
            ]
        });
        await ms.set(`${thread.id}.status`, false);
            

        const buceta = setTimeout(() => {
            
            thread.delete();
        }, 12 * 60 * 1000);

        const collectorFilter = (interaction) => interaction.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter: collectorFilter });
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
                        await ms.set(`${thread.id}.status`, true);
                    } else {
                        const sts = await ms.get(`${thread.id}.status`);
                        if(!sts){
                            return interaction.followUp({content:`❔ | Pagamento ainda não foi encontrado!`, ephemeral:true});
                        }
                    }
                  }).catch(err => {
                    interaction.followUp({content:`📦 | Ocorreu um erro ao verificar seu Pagamento.`, ephemeral:true});
                  });
                  const sts = await ms.get(`${thread.id}.status`);
            if(sts) {
                
                clearTimeout(buceta);
                await interaction.channel.bulkDelete(25);
                interaction.channel.edit({name:`✅・${interaction.user.username}・${interaction.user.id}`});
                setTimeout(() => {
                    interaction.channel.send({
                        content:`**✅ ${interaction.user} | Sua compra foi aprovada com sucesso e já foi adicionado o seus adicionais ao seu Auth/BOT**`
                    })
                }, 500);
				setTimeout(() => {
					interaction.channel.delete();
				}, 10000);
                const m = await ms.get(`${e.id}_adicionais`);
                m.map((a) => { db.push(`${f.idapp}.adicionais`, a); });
            }
            }
            if (interaction.customId === 'pcpc') {
                interaction.reply({ content: `${pay.body.point_of_interaction.transaction_data.qr_code}`, ephemeral: true });
            }
            if (interaction.customId === 'cancelar123') {
                clearTimeout(buceta);
                interaction.reply({content:`📦 | Este Carrinho Será fechado em breve`});
                setTimeout(() => {
                    interaction.channel.delete();
                }, 1000);
              }
            });


        }
        if(customId === "puxar_email") {
            await interaction.deferUpdate();
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const grc = await db.get(`${f.idapp}`);
            if(!grc.adicionais.includes("email") && interaction.user.id !== owner) return interaction.followUp({content:`❌ | Você não tem o Adicional \`Capturar e-mail dos usuários\``, ephemeral:true});

            let msg = "";
            grc.verify.map((a) => {
                msg += `- Username: ${a.username}\n- Identificador: ${a.id}\n- Email: ${a.email ?? "Não Encontrado"}\n\n`;
            });
            fs.writeFile(`${e.id}_email.txt`, msg, (err) => {
                if (err) throw err;
        
                interaction.followUp({
                    content:`✅ | Todos os Emails dos Usuários que se autenticaram:`,
                    files: [{
                        attachment: `${e.id}_email.txt`,
                        name: `e-mails_puxados.txt`
                    }],
                    ephemeral:true
                }).then(() => {
                    fs.unlink(`${e.id}_email.txt`, (err) => {
                        if (err) throw err;
                    });
                }).catch(err => {
                    console.error('Erro ao enviar o arquivo:', err);
                });
            });
        }
        if(customId.endsWith("listadd")) {
            const precos = await data.get("adicionais");
            const b = [
                {
                    "id":"div",
                    "valor": Number(precos.div).toFixed(2),
                    "label":"Remoção da divulgação",
                    "desc":" - Configure a bio do seu bot Auth como quiser!"
                },
                {
                    "id":"suporte",
                    "valor": Number(precos.suporte).toFixed(2),
                    "label":"Suporte prioritário 24/7",
                    "desc":" - Tenha suporte 24/7"
                },
                {
                    "id":"cooldown",
                    "valor": Number(precos.cooldown).toFixed(2),
                    "label":"Remover o cooldown",
                    "desc":" - Sem esse adicional você terá um cooldown de 2h pra puxar membros\n - Com o adicional, você pode puxar os membros a qualquer momento!"
                },
                {
                    "id":"email",
                    "valor": Number(precos.email).toFixed(2),
                    "label":"Capturar e-mail dos usuários",
                    "desc":" - Capture o e-mail de todos os usuários que logarem no seu Auth!"
                },
            ];
            const msg = b.map((a) => {
                return `- \`R$ ${a.valor}\`・**${a.label}**\n${a.desc}`;
            }).join("\n\n");
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Lista dos Adicionais⠀⠀⠀⠀⠀⠀`)
                    .setDescription(`${msg}`)
                    .setColor("#2b2d31")
                    .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                    .setTimestamp()
                ],
                ephemeral:true
            });
        }
        async function embedrenovar() {
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const ren = await ms.get(`${e.id}_renovar`);
            let time = ren.dias * ren.quantidade;
            const grc = await db.get(`${f.idapp}`);
            let preco = Number(await data.get(`bot.${ren.plano}`) * ren.quantidade);
            let precoadicionais = 0.00;
            grc.adicionais.map((add) => {
                precoadicionais += Number(data.get("adicionais." + add));
            });
            precoadicionais = Number(precoadicionais * ren.quantidade);
            
            const dataValidade = new Date(grc.validade);

            dataValidade.setDate(dataValidade.getDate() + time);

            const timestamp = Math.floor(dataValidade.getTime() / 1000);

            interaction.editReply({
                content:"",
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`- **Seu Plano:** \`${grc.plano}\`\n- **Quantidade selecionada:** \`${ren.quantidade}\`\n- **Dias para renovar:** \`${time}\``),
                    new EmbedBuilder()
                    .setDescription(`- **🛒 Resumo do seu carrinho de renovação**\n\n- \` R$ ${preco.toFixed(2)} \`・Valor do seu plano\n- \` R$ ${precoadicionais.toFixed(2)} \`・Valor dos adicionais (${grc.adicionais.length})\n\n- **Total: \`R$ ${Number(preco + precoadicionais).toFixed(2)}\`**\n - Você terá seu bot garantido até <t:${timestamp}:d>\n - Após renovar, seu bot expirará somente <t:${timestamp}:R>`)
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`addrenovar`)
                        .setEmoji("<:mais_white:1219667468432314479>")
                        .setStyle(1),
                        new ButtonBuilder()
                        .setCustomId(`removerenovar`)
                        .setEmoji("<:menos_white:1219667508424867960>")
                        .setStyle(1),
                        new ButtonBuilder()
                        .setCustomId(`finalizar_renovar`)
                        .setEmoji("<:1225937077351219242:1242267722902016121>")
                        .setLabel("Finalizar pedido")
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId(`voltar`)
                        .setEmoji("⬅️")
                        .setDisabled(f.command)
                        .setLabel("Voltar")
                        .setStyle(2),
                    )
                ]
            });
        }
        
        async function guid(guild) {
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const grc = await db.get(`${f.idapp}`);
            const bot = await checkToken(grc.token);
            const wbh = grc.servers[guild].webhook;
            const role = await isValidRole(guild, grc.servers[guild].role, grc.token);
            const response = await axios.get(`https://discord.com/api/v9/guilds/${guild}`, {
                headers: {
                    Authorization: `Bot ${grc.token}`
                }
            });
            const wb = await axios.get(`${wbh}`);
            const verify = grc.verify.filter(a => a.state === guild);

            interaction.editReply({
                content:"",
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`⠀⠀⠀⠀⠀⠀Gerenciamento do Servidor: "${response?.data?.name ?? "Não Encontrado"}"⠀⠀⠀⠀⠀⠀`)
                    .addFields(
						{
                            name:"Canal de webhooks:",
                            value:`<#${wb?.data?.channel_id}> - [URL Do Webhook](${wbh})`
                        },
                        {
                            name:"Cargos de Verificação atuais:",
                            value:`\`${role ? `#${role.name} (ID: ${role.id})` : "`Não Encontrado`"}\``
                        },
                        {
                            name:"Membros verificados nesse servidor",
                            value:`\`${verify.length} Membros\``
                        }
                    )
                    .setFooter({text:`Caso tenha dúvidas, entre em contato com o suporte.`})
                    .setColor("#2b2d31")
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                        .setCustomId(`${guild}_actionguild`)
                        .setPlaceholder("💡 Realize alguma ação")
                        .addOptions(
                            {
                                label:"Alterar o Webhook",
                                value:"webhook",
                                description:"logs de verificados webhook"
                            },
                            {
                                label:"Alterar o Cargo de verificado",
                                value:"role",
                                description:"Altere para o cargo que o membro irá ganhar após se verificar"
                            },
                            {
                                label:"Enviar mensagem de verificação",
                                value:"send_message",
                                description:"Envia a mensagem de verificação"
                            },
                            {
                                label:"Editar Servidor",
                                value:"edit_server",
                                description:"Edite como é o Servidor no gerenciar servidores"
                            },
                        )
                    ),
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("voltar")
                        .setStyle(2)
                        .setEmoji("⬅️")
                        .setLabel("Voltar"),
                        new ButtonBuilder()
                        .setCustomId(`${guild}_puxarmembersguild`)
                        .setStyle(2)
                        .setLabel("Puxar Membros"),
                        new ButtonBuilder()
                        .setCustomId(`${guild}_removerserverauth`)
                        .setStyle(4)
                        .setEmoji("<:lixeira_branca:1242573929999110195>")
                        .setLabel("Remover servidor do Auth"),
                    )
                ]
            });
        }
        async function confi() {
            const e = await interaction.fetchReply();
                const f = await ms.get(e.id);
                const a = await db.get(`${f.idapp}`);
                const conf = a.confia || [];
                let msg = "- **Todos os Usuarios de Confiança:**\n";
                if(conf.length <= 0) {
                    msg = "- No momento você ainda não tem nenhuma pessoa de confiança no seu Auth\n- Para adicionar basta selecionar um usuário abaixo";
                } else {
                    conf.map((user) => {
                        msg += `\n- <@${user}> - ${user}`;
                    });
                }
                interaction.editReply({
                    content:"",
                    embeds: [
                        new EmbedBuilder()
                        .setDescription(`**\n\n${msg}\n\n **- Esteja ciente de que a pessoa de confiança terá todas as permissões do seu Auth! Isso inclui puxar membros, alterar o token, registrar e excluir servidores do auth, entre outras ações!**`)
                        .setColor("Green")
                    ],
                    components: [
                        new ActionRowBuilder()
                        .addComponents(
                            new UserSelectMenuBuilder()
                            .setCustomId("confianca_user")
                            .setMaxValues(1)
                            .setPlaceholder("👥 Selecione um usuário")
                        ),
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId("voltar")
                            .setStyle(2)
                            .setLabel("Voltar")
                            .setEmoji("⬅️"),
                            new ButtonBuilder()
                            .setCustomId("selecionarid")
                            .setStyle(2)
                            .setLabel("Selecionar usuário por ID")
                            .setEmoji("<:1237422643544854549:1242278357450756147>"),
                            new ButtonBuilder()
                            .setCustomId("removerconfi")
                            .setStyle(3)
                            .setLabel("Remover Pessoa de Confiança")
                            .setEmoji("<:emojilixo:1187436306037493835>"),
                        )
                    ]
                });
        }
        async function editcomponent() {
            const e = await interaction.fetchReply();
            const f = await ms.get(e.id);
            const grc = await db.get(`${f.idapp}`);
            const b = await checkToken(grc.token);
            const c = await checkSecret(b.id, grc.secret);
        
            var timestamp = Math.floor(new Date(grc.validade).getTime() / 1000);
            interaction.editReply({
                content:"",
                embeds:[
                    new EmbedBuilder()
                    .setTitle("Configuração do seu BOT Auth")
                    .setImage("https://cdn.discordapp.com/attachments/1251231167479414887/1253913303420239903/1719025293619.png?ex=66783e04&is=6676ec84&hm=f21ea13eb50df9e37da4ddbdc8d9e64692052ee2872c08370d44ca9408497ebb&")
                    .setColor("#2b2d31")
                    .setDescription(`> - **Nome do seu BOT:** \`${b ? b.username : `Nome Desconhecido.`}\`\n> - **Plano Atual:** \`${grc.plano}\`\n> - **Expira em:** <t:${timestamp}:D> - <t:${timestamp}:R>\n> - **Token Configurado?** \`${b ? "✅" : "❌"}\`\n> - **Client Secret Configurado?** \`${c ? "✅" : "❌"}\`\n> - **Usuários verificados:** \`${grc.verify.length} Usuários\`\n> - **Seus Adicionais (\`${grc.adicionais.length}\`)**`)
                    .setFooter({text:`${interaction.guild.name}`, iconURL:interaction.guild.iconURL()})
                    .setTimestamp()
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                        .setCustomId("edit_bot")
                        .setMaxValues(1)
                        .setPlaceholder("✍ Edite o seu bot")
                        .addOptions(
                            {
                                label:"Alterar o nome",
                                value:"name",
                                emoji:"<:estrela:1220490920412053588>"
                            },
                            {
                                label:"Alterar o Avatar",
                                value:"avatar",
                                emoji:"<:1220490903697752227:1242270731874861137>"
                            },
                            {
                                label:"Alterar a Biografia",
                                value:"bio",
                                emoji:"<:1220490882239954965:1242270603772297296>"
                            },
                            {
                                label:"Alterar o token",
                                value:"token",
                                emoji:"<:1220490856742653983:1242270480879058984>"
                            },
                            {
                                label:"Alterar o Client Secret",
                                value:"secret",
                                emoji:"<:1234288240043888690:1242267011359309855>"
                            },
                            {
                                label:"Alterar a pessoa de confiança",
                                value:"pessoa",
                                emoji:"<:1206494011003506730:1242266617354915840>"
                            }
                        )
                    ),
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`puxar_email`)
                        .setLabel("Puxar E-mails")
                        .setStyle(2)
                        .setEmoji("<:lupa:1242270238746218531>"),
                        new ButtonBuilder()
                        .setCustomId(`puxar_members`)
                        .setLabel("Puxar Membros")
                        .setStyle(2)
                        .setEmoji("<:1206494011003506730:1242266617354915840>"),
                        new ButtonBuilder()
                        .setCustomId(`gerenciar_servers`)
                        .setLabel("Gerenciar Servidores")
                        .setStyle(2)
                        .setEmoji("<:1220490795342237817:1242270030733905992>"),
                    ),
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("renovar_bot")
                        .setLabel("Renovar BOT")
                        .setStyle(2)
                        .setEmoji("<:1220490813969268817:1242269881584582798>"),
                        new ButtonBuilder()
                        .setCustomId("adicionais_bot")
                        .setLabel("Adicionais do BOT")
                        .setStyle(2)
                        .setEmoji("<:1220490832033874010:1242269719965339756>"),
                        new ButtonBuilder()
                        .setStyle(5)
                        .setLabel("Convidar pro Servidor")
                        .setURL(`https://discord.com/oauth2/authorize?client_id=${b.id}&permissions=17594870401040&scope=bot`)
                    )
                ]
            });
        }
    }
}
async function isValidRole(guildId, roleId, botToken) {
    try {
      const response = await axios.get(`https://discord.com/api/v9/guilds/${guildId}/roles`, {
        headers: {
          Authorization: `Bot ${botToken}`
        }
      });
  
      const roles = response.data;
  
      
      const isValid = roles.find(role => role.id === roleId);
      
      return isValid;
    } catch (error) {
      console.error("Erro ao verificar o cargo:", error.message);
      return false;
    }
  }

async function verifyWebhook(webhookURL) {
    try {
      const response = await axios.head(webhookURL);
  
      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
        return false;
    }
  }
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
async function downloadImage(imageUrl, imagePath) {
    const writer = fs.createWriteStream(imagePath);

    return new Promise((resolve, reject) => {
        https.get(imageUrl, (response) => {
            response.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    });
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
        return false;
    }
}


async function checkGuildJoin(botToken, guildId) {
    const headers = {
        Authorization: `Bot ${botToken}`
    };
  try {
    
    const response = await axios.get(`https://discord.com/api/v9/guilds/${guildId}/members/@me`, { headers });
    if (response.status === 200) {
        return true;
    } else {
        return false;
    }
  } catch (error) {
    return false;
  }
}