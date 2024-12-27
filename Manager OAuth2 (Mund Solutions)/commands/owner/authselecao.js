const fs = require("fs");
const { ApplicationCommandType } = require("discord.js");
const { data, db, ms } = require("../../database/index");
const { owner } = require("../../config.json");

module.exports = {
    name: "authselecao",
    description: "Veja todos os Auth's.",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        if (owner !== interaction.user.id) return interaction.reply({ content: `❌ | Você não tem permissão para usar este comando.`, ephemeral: true });
        await interaction.reply({ content: `Aguarde um momento...`, ephemeral: true });
        const e = (await db.all()).filter(a => a.data.token);
        if (e.length <= 0) return interaction.editReply({ content: `❌ | Não foi criado nenhum Auth`, ephemeral: true });
        let msg = "";
        e.forEach((a) => {
            msg += ` - ID: ${a.ID}\n - Link de Convite: [Clique Aqui](https://discord.com/oauth2/authorize?client_id=${a.data.idbot}&permissions=17594870401040&scope=bot)\n - Verificados: \`${a.data.verify.length} Membros\`\n\n`;
        });
        const filePath = `authselecao.txt`;
        fs.writeFile(filePath, msg, (err) => {
            if (err) {
                console.error("Erro ao escrever arquivo:", err);
                return interaction.editReply({ content: "Ocorreu um erro ao criar o arquivo.", ephemeral: true });
            }
            
            interaction.editReply({ content: "Aqui está o arquivo com a lista de autenticações:", files: [filePath] });
        });
    }
}
