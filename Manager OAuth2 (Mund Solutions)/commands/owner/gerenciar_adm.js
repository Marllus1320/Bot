const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const {data,db, ms} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require("axios");
const qs = require('qs');


module.exports = {
    name:"gerenciar_admin",
    description:"Gerencie os Bots AUTH'S.",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(interaction.user.id !== owner) return interaction.reply({content:`**❌ | Você não tem permissão de usar este comando.**`, ephemeral:true})
        await interaction.reply({content:` Aguarde um momento...`, ephemeral:true});
        const pageSize = 20;
        let page = 0;
        const auths = (await db.all()).filter(a => a.data.token);
        if(auths.length <= 0) return interaction.editReply({content:`❌ | Não foi criado nenhum BOT`});

    const displayPage = async() => {
        const pageStart = page * pageSize;
        const pageEnd = pageStart + pageSize;
        const pageItems = auths.slice(pageStart, pageEnd);

        const selec = new StringSelectMenuBuilder()
        .setCustomId("auth_selectkkk")
        .setPlaceholder("Selecione um Auth")
        .setMaxValues(1);
        pageItems.map((a) => {
            selec.addOptions({
                label:`${a.data.name}`,
                description:`👥 Total Verificados: ${a.data.verify.length}`,
                value:`${a.ID}`
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
          .setLabel(`Página ${page + 1}/${Math.ceil(auths.length / pageSize)}`)
          .setDisabled(true)
          .setStyle(2),
        )
        .addComponents(
          new ButtonBuilder()
            .setCustomId('proximo')
            .setEmoji('➡️')
            .setDisabled(page === Math.ceil(auths.length / pageSize) - 1)
            .setStyle(1),
        );
      
      return { components: [row2, row] };
    };
    
    const { components } = await displayPage();
    const sentMessage = await interaction.editReply({ content:"", embeds:[], components, ephemeral:true });
    const msg = await interaction.fetchReply();

    const filter = i => i.message.id === msg.id;
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
      } else if(interaction.customId === "auth_selectkkk") {
		  await interaction.deferUpdate();
          collector.stop();
        const bot = interaction.values[0];
        const grc = await db.get(`${bot}`);
        
        const b = await checkToken(grc.token);
        const c = await checkSecret(b.id, grc.secret);
    
        var timestamp = Math.floor(new Date(grc.validade).getTime() / 1000)
        interaction.editReply({
            content:"",
            embeds:[
                new EmbedBuilder()
                .setTitle("Painel De Gerenciamento")
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
                            emoji:"<:1220490920412053588:1242271064243965962>"
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
        await ms.set(`${msg.id}`, {
            botid: b.id,
            idapp: bot
        });
      }
      
    });

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