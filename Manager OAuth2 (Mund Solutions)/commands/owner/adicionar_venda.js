const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, ButtonBuilder } = require("discord.js");
const {data, db, ms} = require("../../database/index");
const {owner} = require("../../config.json");


module.exports = {
    name:"vendas_gerenciar",
    description:"Gerencie o Sistema de Venda de Membros.",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(owner !== interaction.user.id) return interaction.reply({content:`❌ | Você não tem permissão para usar este comando.`, ephemeral:true});
        await interaction.reply({
            content:`Aguarde um momento...`,
            ephemeral:true
        });
        const all = await data.get("vendas");
        let msg = "";
        if(all.length <= 0) {
            msg = "`Não Foi Adicionado nenhuma Venda`";
        } else {
            msg = "**Todas as Suas Vendas:**\n\n"
            const m = all.map(async(a) => {
                const d = await db.get(`${a}`);
                if(d && d.verify) {
                    msg += `- BotID: ${a}\n - Total de Verificados: ${d.verify.length}\n - Dono: <@${d.owner}> \`${d.owner}\`\n`;
                }
            });
            await Promise.all(m);
        }
        interaction.editReply({
            content:"",
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Gerenciar vendas`)
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
                    .setEmoji("<a:loading:1225944483917725736>")
                    .setStyle(1)
                )
            ]
        });
        
    }
}