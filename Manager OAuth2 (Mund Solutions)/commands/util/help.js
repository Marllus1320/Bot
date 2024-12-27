const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");




module.exports = {
    name:"help",
    description:"Saiba para que serve todos os Comandos!",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        const commands = await interaction.guild.commands.fetch();

        const renovar = commands.find(command => command.name === "renovar");
        const gerenciar_auth = commands.find(command => command.name === "gerenciar_auth");
        const help = commands.find(command => command.name === "help");
        const ping = commands.find(command => command.name === "ping");
        const refil = commands.find(command => command.name === "refil");

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Comandos Gerais`)
                .setColor("#5d00ff")
                .setDescription(`**Olá ${interaction.user} Seja Bem Vindo ao painel de Ajuda**\n\n - Todos os Comandos Gerais:\n - </${help.name}:${help.id}> - Ver Todos Os Comandos\n - </${ping.name}:${ping.id}> - Veja o PING do Bot\n\n - Área de Clientes:\n - </${gerenciar_auth.name}:${gerenciar_auth.id}> - Gerencie Todos os seus Auth's\n - </${renovar.name}:${renovar.id}> - Renove algum dos seus Auth's\n - </refil:${refil.id}> - Puxe a mesma quantidade de membros ao mesmo servidor`)
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`comandos_owner`)
                    .setLabel("Comandos do Dono")
                    .setEmoji("<a:coroa:1226010081506627605>")
                    .setStyle(1)
                )
            ],
            ephemeral:true
        })
    } 
}