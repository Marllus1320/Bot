const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder, UserSelectMenuBuilder, WebhookClient, ChannelType, AttachmentBuilder, Embed } = require("discord.js");
const { db, data, ms, fat, serv} = require("../../database/index");
const {owner, url} = require("../../config.json");



module.exports = {
    name:"interactionCreate", 
    run: async( interaction, client) => {
        const customId = interaction.customId;
        if(!customId) return;
        if(customId === "comandos_owner") {
            if(interaction.user.id !== owner) return;
            const commands = await interaction.guild.commands.fetch();

            const vendas_gerenciar = commands.find(command => command.name === "vendas_gerenciar");
            const authselecao = commands.find(command => command.name === "authselecao");
            const config = commands.find(command => command.name === "config");
            const criar = commands.find(command => command.name === "criar");
            const enviarmensagem = commands.find(command => command.name === "enviarmensagem");
            const gerenciar_adm = commands.find(command => command.name === "gerenciar_adm");
            const infoauth = commands.find(command => command.name === "infoauth");
            const puxartodos = commands.find(command => command.name === "puxartodos");
            const remover_auth = commands.find(command => command.name === "remover_auth");

            interaction.update({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} | Comandos Dono`)
                    .setColor("#5d00ff")
                    .setDescription(`Olá ${interaction.user} Seja Bem Vindo ao painel de Ajuda\n\n - Todos os Seus Comandos:\n - </${vendas_gerenciar.name}:${vendas_gerenciar.id}> - Gerencie o Sistema de Vendas de Membros\n - </${authselecao.name}:${authselecao.id}> - Veja Todos os Auth's Registrados.\n - </${config.name}:${config.id}> - Configure o Sistema do BOT\n - </criar:${criar.id}> - Crie um Auth para Alguem\n -  </enviarmensagem:${enviarmensagem.id}> - Envie a Mensagem de Vendas de Membros/Auth\n - </infoauth:${infoauth.id}> - Veja a URL do Auth\n - </puxartodos:${puxartodos.id}> - Puxe Todos os Usuários que estão Registrados nos BOTS\n - </remover_auth:${remover_auth.id}> - Deletar algum Auth.`)
                ],
                components: [],
            })
        }
        if(customId === "sacarbutton") {
            await interaction.update({
                content:`Aguarde estamos processando o saque...`,
                embeds:[],
                components:[]
            });
            const channel_saque = interaction.client.channels.cache.get(`${await data.get("saque")}`);
            const gui = await serv.get(`${interaction.guild.id}`);
            if(!gui.chave_pix) return interaction.editReply({content:`Configure sua chave pix primeiramente!`});
            const saldo = Number(gui.saldo).toFixed(2);
            if(channel_saque) await channel_saque.send({
                content:`Usuário: ${interaction.user} (\`@${interaction.user.username} ${interaction.user.id}\`)\n- Saque Total: \`R$ ${saldo}\`\n- Horário: <t:${Math.floor(new Date()/ 1000)}:f> (<t:${Math.floor(new Date() / 1000)}:R>)\n- Chave Pix: ${gui.chave_pix ? gui.chave_pix : "N/A"}`
            });
            await serv.set(`${interaction.guild.id}.saldo`, 0.00);
            interaction.editReply({
                content:`Saque solicitado com sucesso!\n O processo pode demorar até 48h utéis.`
            });
        }
        if(customId === "enviarrevendaanuncioembedmodal") {
            const content = interaction.fields.getTextInputValue("texto");
            const title = interaction.fields.getTextInputValue("title") || null;
            const desc = interaction.fields.getTextInputValue("desc");
            const banner = interaction.fields.getTextInputValue("banner") || null;
            const cor = interaction.fields.getTextInputValue("cor") || null;
            let embed = [];
            if(!title && !desc && !banner && !cor && !content) {
                return interaction.reply({content:`Coloque Alguma coisa!`, ephemeral:true});
            } else if(!title && !desc && !banner && !cor) {} else {
                const embeds = new EmbedBuilder().setColor("Blue");
                if(title) embeds.setTitle(title);
                if(desc) embeds.setDescription(desc);
                if(cor) embeds.setColor(cor);
                embed = [embeds];
            }

            await interaction.reply({
                content:`## Previa:\n${content}`,
                embeds: embed,
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("enviaranunciorevendabutton")
                        .setEmoji("<:membersv3:1230656719873507358>")
                        .setLabel("Enviar Anuncio ao Revendedores")
                        .setStyle(1)
                    )
                ],
                ephemeral: true
            });
            const msg = await interaction.fetchReply();
            await ms.set(`${msg.id}`, {
                content,
                title,
                desc,
                banner,
                cor
            });
        }

        if(customId === "enviaranunciorevendabutton") {
            await interaction.deferUpdate();
            const msg = await interaction.fetchReply();
            const ok = await ms.get(`${msg.id}`);
            const {content, title, desc, banner, cor} = ok;
            interaction.editReply({
                content:`Enviando Anuncio...`,
                embeds: [],
                components:[]
            });
            const all = await serv.all().filter(a => a.data.channels && a.data.channels?.importante);
            for(const sv of all) {
                const channel = interaction.client.channels.cache.get(sv.data.channels?.importante);
                let embed = [];
                if(!title && !desc && !banner && !cor) {} else {
                    embed = [
                        new EmbedBuilder()
                        .setTitle(title)
                        .setDescription(desc)
                        .setColor(cor ?? "Blue")
                    ]
                }
    
                if(channel) {
                    try {
                        await channel.send({
                            content:`${content}`,
                            embeds: embed,
                            ephemeral: true
                        }).catch(() => {});
                    } catch {}
                }
            }
            interaction.editReply({content:`Todas as mensagem foram enviadas com sucesso!`});
        }
    
    }} 