const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const {data,db, ms} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require("axios");
const qs = require('qs');

module.exports = {
    name:"renovar",
    description:"Renove um dos seus Bots AUTH'S.",
    type: ApplicationCommandType.ChatInput,   
    run: async(client, interaction) => {
        const bot = interaction.options.getString("bot");
        await interaction.reply({content:`Aguarde um momento...`, ephemeral:true});
		
        const pageSize = 20;
        let page = 0;
        const auths = (await db.all()).filter(a => {
			if(a.data.owner !== interaction.user.id && !a.data.confia.includes(interaction.user.id)) return false;
			if(a.data.ativo) return false;
			return true;
		});
        if(auths.length <= 0) return interaction.editReply({content:`❌ | Você não tem nenhum Auth Ativo.`});
		
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
            .setEmoji('<:volta:1226011532031430736>')
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
            .setEmoji('<:vai:1226011604361941092>')
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
        const bot = interaction.values[0];
        const grc = await db.get(`${bot}`);
		  let time = 30;
            if(grc.plano == "semanal") {
                time = 7
            } else if(grc.plano === "quinzenal") {
                time = 15;
            }
            const e = await interaction.fetchReply();
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
            await ms.set(`${e.id}`, {
                botid: grc.id,
                idapp: bot,
                command: true
            });
            const dataValidade = new Date(grc.validade);

            dataValidade.setDate(dataValidade.getDate() + time);

            const timestamp = Math.floor(dataValidade.getTime() / 1000);

            interaction.editReply({
                content:"",
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`- **Seu Plano:** \`${grc.plano}\`\n- **Quantidade selecionada:** \`1\`\n- **Dias para renovar:** \`${time}\``)
                    .setColor("#26ff00"),
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
                        .setEmoji("<:confirmar_awe:1225930450145640515>")
                        .setLabel("Finalizar pedido")
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId(`voltar`)
                        .setEmoji("<:volta:1226011532031430736>")
                        .setLabel("Voltar")
                        .setDisabled(true)
                        .setStyle(2),
                    )
                ]
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