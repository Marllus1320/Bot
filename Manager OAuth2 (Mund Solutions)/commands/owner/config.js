const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } = require("discord.js");
const {data, db, ms} = require("../../database/index");
const {owner} = require("../../config.json");


module.exports = {
    name:"config",
    description:"Configurar o Sistema de Auth.",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(owner !== interaction.user.id) return interaction.reply({content:`❌ | Você não tem permissão para usar este comando.`, ephemeral:true});
        const role = interaction.guild.roles.cache.get(await data.get("cliente")) || "`Não Configurado`";
        const logs = interaction.guild.channels.cache.get(await data.get("logs")) || "`Não Configurado`";
        const saque = interaction.guild.channels.cache.get(await data.get("saque")) || "`Não Configurado`";

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`Painel De Gerenciamento`)
                .setColor("#ff1900")
                .setDescription(`Porcentagem Revenda de Membros: ${await data.get(`porcentagem`)}%\nCanal de Saques: ${saque}\nCanal de Logs: ${logs}\n Cargo de Cliente: ${role}\n**Acess-token:** ||${await data.get(`acesstoken`)}||\n**Biografia Padrão:** ${await data.get("bio")}\n\n**Preço dos Adicionais:**\n - Remoção de Divulgação: \`R$ ${await data.get("adicionais.div")}\`\n - Suporte Prioritario: \`R$ ${await data.get("adicionais.suporte")}\`\n - Cooldown dê Puxada: \`R$ ${await data.get("adicionais.cooldown")}\`\n - Capturar E-mails \`R$ ${await data.get("adicionais.email")}\`\n\n**Preço Dos Planos**: \n - Mensal: \`R$ ${await data.get("bot.mensal")}\`\n - Quinzenal: \`R$ ${await data.get("bot.quinzenal")}\`\n - Semanal: \`R$ ${await data.get("bot.semanal")}\`\n\n**Membros:**\n - Valor(Unidade): R$${Number(await data.get("membros.valor")).toFixed(2)}\n - Quantidade Minima: \`${await data.get("membros.minimo")} Membros\`\n - Reposição: ${Number(await data.get("membros.reposicao")).toFixed(2)}`)
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
}