const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder, UserSelectMenuBuilder, WebhookClient, ChannelType, AttachmentBuilder } = require("discord.js");
const { db, data, ms} = require("../../database/index");
const {owner, url} = require("../../config.json");
const axios = require('axios');
const qs = require('qs');
const https = require('https');
const fs = require('fs');




module.exports = {
    name:"ready",
    run:async(client) => {

        setInterval(async() => {
            const dataAtual = new Date();
        (await db.all()).filter(a => a.data.token).forEach(async (item) => {
            const data = await db.get(item.ID);
            if (!data || !data.validade) return;
            const validade = new Date(data.validade);
            const diferencaEmDias = Math.ceil((validade - dataAtual) / (1000 * 60 * 60 * 24));
            const user = client.users.cache.get(`${data.owner}`);
            var timestamp = Math.floor(new Date(data.validade).getTime() / 1000);   
    
    
            
            switch(diferencaEmDias) {
                case 4:{
                    if(!data.notify4) {
                        await db.set(`${item.ID}.notify4`, true);
                        if(user) {
                            user.send({
                                embeds: [
                                    new EmbedBuilder().setColor("Red")
                                    .setAuthor({name:`${user.username} - ${user.id}`, iconURL: user.avatarURL()})
                                    .setTitle(`Sistema de Cobrança - ID: ${item.ID}`)
                                    .addFields(
                                        {
                                            name:"<:megafone_vex:1242310085062168606> | Atenção!",
                                            value:`<@${owner}> **Você poderá perder seu Auth dentro de \`4 Dias\`**`
                                        },
                                        {
                                            name:"<:tome:1242310942293758002> | Informação",
                                            value:`**Use o Comando **\`/renovar\`** e escolha seu Auth para Renovar**`
                                        },
                                        {
                                            name:"<:entrega:1242289308941942867> | Tempo para expirar:",
                                            value:`<t:${timestamp}:f> (<t:${timestamp}:R>)`
                                        }
                                    )
                                ]
                            }).catch(() => {});
                        }
                    }
                }
                    break;
                
                case 3:{
                    if(!data.notify3) {
                        await db.set(`${item.ID}.notify3`, true);
                        if(user) {
                            user.send({
                                embeds: [
                                    new EmbedBuilder().setColor("Red")
                                    .setAuthor({name:`${user.username} - ${user.id}`, iconURL: user.avatarURL()})
                                    .setTitle(`Sistema de Cobrança - ID: ${item.ID}`)
                                    .addFields(
                                        {
                                            name:"<:megafone_vex:1242310085062168606> | Atenção!",
                                            value:`<@${owner}> **Você poderá perder seu Auth dentro de \`3 Dias\`**`
                                        },
                                        {
                                            name:"<:tome:1242310942293758002> | Informação",
                                            value:`**Use o Comando **\`/renovar\`** e escolha seu Auth para Renovar**`
                                        },
                                        {
                                            name:"<:entrega:1242289308941942867> | Tempo para expirar:",
                                            value:`<t:${timestamp}:f> (<t:${timestamp}:R>)`
                                        }
                                    )
                                ]
                            }).catch(() => {});
                        }
                    }
                }
                    break;
                
                case 2:{
                    if(!data.notify2) {
                        await db.set(`${item.ID}.notify2`, true);
                        if(user) {
                            user.send({
                                embeds: [
                                    new EmbedBuilder().setColor("Red")
                                    .setAuthor({name:`${user.username} - ${user.id}`, iconURL: user.avatarURL()})
                                    .setTitle(`Sistema de Cobrança - ID: ${item.ID}`)
                                    .addFields(
                                        {
                                            name:"<:megafone_vex:1242310085062168606> | Atenção!",
                                            value:`<@${owner}> **Você poderá perder seu Auth dentro de \`2 Dias\`**`
                                        },
                                        {
                                            name:"<:tome:1242310942293758002> | Informação",
                                            value:`**Use o Comando **\`/renovar\`** e escolha seu Auth para Renovar**`
                                        },
                                        {
                                            name:"<:entrega:1242289308941942867> | Tempo para expirar:",
                                            value:`<t:${timestamp}:f> (<t:${timestamp}:R>)`
                                        }
                                    )
                                ]
                            }).catch(() => {});
                        }
                    }
                }
                    break;
                
                case 1:{
                    if(!data.notify1) {
                        await db.set(`${item.ID}.notify1`, true);
                        if(user) {
                            user.send({
                                embeds: [
                                    new EmbedBuilder().setColor("Red")
                                    .setAuthor({name:`${user.username} - ${user.id}`, iconURL: user.avatarURL()})
                                    .setTitle(`Sistema de Cobrança - ID: ${item.ID}`)
                                    .addFields(
                                        {
                                            name:"<:megafone_vex:1242310085062168606> | Atenção!",
                                            value:`<@${owner}> **Você poderá perder seu Auth dentro de \`1 Dias\`**`
                                        },
                                        {
                                            name:"<:tome:1242310942293758002> | Informação",
                                            value:`**Use o Comando **\`/renovar\`** e escolha seu Auth para Renovar**`
                                        },
                                        {
                                            name:"<:entrega:1242289308941942867> | Tempo para expirar:",
                                            value:`<t:${timestamp}:f> (<t:${timestamp}:R>)`
                                        }
                                    )
                                ]
                            }).catch(() => {});
                        }
                    }
                }
                break;
                
                case 0:{
                    if(!data.notify0) {
                        await db.set(`${item.ID}.notify0`, true);
                        if(user) {
                            user.send({
                                embeds: [
                                    new EmbedBuilder().setColor("Red")
                                    .setAuthor({name:`${user.username} - ${user.id}`, iconURL: user.avatarURL()})
                                    .setTitle(`Sistema de Cobrança - ID: ${item.ID}`)
                                    .addFields(
                                        {
                                            name:"<:megafone_vex:1242310085062168606>> | Atenção!",
                                            value:`<@${owner}> **Você tem até amanhã para Pagar, Se não Perderá seu Auth's**`
                                        },
                                        {
                                            name:"<:tome:1242310942293758002> | Informação",
                                            value:`**Use o Comando **\`/renovar\`** e escolha seu Auth para Renovar**`
                                        },
                                        {
                                            name:"<:entrega:1242289308941942867> | Tempo para expirar:",
                                            value:`<t:${timestamp}:f> (<t:${timestamp}:R>)`
                                        }
                                    )
                                ]
                            }).catch(() => {});
                        }
                    }
                }
                break;
                
                case -1:{
                    if(!data.notify) {
                        await db.set(`${item.ID}.notify`, true);
                        if(user) {
                            user.send({
                                embeds: [
                                    new EmbedBuilder().setColor("Red")
                                    .setAuthor({name:`${user.username} - ${user.id}`, iconURL: user.avatarURL()})
                                    .setTitle(`Sistema de Cobrança - ID: ${item.ID}`)
                                    .addFields(
                                        {
                                            name:"<:megafone_vex:1242310085062168606> | Atenção!",
                                            value:`<@${owner}> **Você acabou perdendo seu Auth pois o tempo acabou expirando.. Use \`/renovar-deletada\` para ter acesso novamente.**`
                                        },
                                    )
                                ]
                            }).catch(() => {});
                        }
                        await db.set(`${item.ID}.ativo`, true);
                    }
                }
                break;
            default:
                break;
            }
        });
        }, 60 * 1000);

    }
}