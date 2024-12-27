const { Router } = require("express");
const router = Router();
const requestIp = require('request-ip');
const geoip = require('geoip-lite');
const { db, data, ms} = require("../database/index");
const axios = require("axios");
const {url} = require("../config.json");
const { client } = require('../index.js');


router.get('/api/callback', async(req, res) => {
    try {
        const ip = requestIp.getClientIp(req);
    
    
    const location = geoip.lookup(ip);
    let locationInfo = "Localização não disponível";
    if (location) {
        locationInfo = `${location.city}, ${location.region}, ${location.country}`;
    }
    
    
    const userAgent = req.headers['user-agent'];
    const deviceInfo = parseUserAgent(userAgent);
    const {state, code} = req.query;
    const idapp = state.split("+")[0];
    const guild = state.split("+")[1];
    const b = await db.get(`${idapp}`);
    
    if(!state) return res.status(400).json({message:"Está Faltando Parametro.", status: 400});
    if(!code) return res.status(400).json({message:"Está Faltando Parametro.", status: 400});
    if(b.ativo) return res.status(404).json({message:"Não foi identificado essa Auth.", status: 404});
    
    const responseToken = await axios.post(
        'https://discord.com/api/oauth2/token',
        `client_id=${idapp}&client_secret=${b.secret}&code=${code}&grant_type=authorization_code&redirect_uri=${url}/api/callback&scope=identify+email`,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );
    
    const token = responseToken.data;
    
    
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${token.token_type} ${token.access_token}`,
        },
    }).catch(() => {});
    
    const user = userResponse.data;
	const id = user.id; 
	
const timestamp = ((BigInt(id) >> 22n) + 1420070400000n) / 1000n; 

const creationDate = new Date(Number(timestamp) * 1000); 

const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
const corHexadecimal = "#2b2d31";
const corDecimal = parseInt(corHexadecimal.replace(/^#/, ''), 16);
const corHexadecimal2 = "#2b2d31";
const corDecimal2 = parseInt(corHexadecimal.replace(/^#/, ''), 16);
const ver = (await db.get(`${idapp}.verify`)).filter(a => a.id === user.id && a.state === guild);
if(ver.length <= 0) {
    await db.push(`${idapp}.verify`, {
        id: user.id,
        username: user.username,
        token: {
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            code: code
        },
        state: guild,
        ip,
        email: user.email
    });
}
const ver2 = (await db.get(`${idapp}.verify`)).filter(a => a.ip === ip);
let msg = ``;
if(ver2.length > 1) {
    msg = `O usuário a seguir tentou se verificar com ${ver2.length - 1} outras contas!\nIremos listar as contas com o mesmo IP do usuário a seguir:\n\n`;
    ver2.map((a, index) => {
        const timestamp = ((BigInt(a.id) >> 22n) + 1420070400000n) / 1000n; 
        
        const creationDate = new Date(Number(timestamp) * 1000); 
        msg += `- Possível alt n° ${index + 1}:\n - **Menção:** <@${a.id}>\n - **Username:** ${a.username}\n - **Identificação:** ${a.id}\n - **Alt criada: <t:${Math.floor(creationDate / 1000)}:R>**\n\n`;
    });
    msg += `Apesar de ser uma ALT permiti que o usuário se autenticasse!`;
} else {
    msg = null;
}
const payload = {
  content: `<@${user.id}>`,
  embeds: [
    {
      title: ver2.length > 2 ? "Possível ALT identificada por IP!" : "Verificado Com Sucesso!",
      description: msg,
      author: {
        name: `${user.global_name} - @${user.username}`,
        icon_url: avatarUrl
      },
      fields: [
        {
          name: '<:1206494011003506730:1242266617354915840> Usuário',
          value: `<@${user.id}>`,
          inline: true,
        },
        {
          name: '<:antena_StorM:1242271427973877791> IP do usuário',
          value: `||${ip}||`,
          inline: true,
        },
        {
            name:"<:1141491365621022740:1242267477061406801> Conta Criada:",
            value:`<t:${Math.floor(creationDate / 1000)}:R>`,
            inline:true
        },
        {
          name: '<:estrela_StorM:1242581346594062437> Informações adicionais',
          value: `- <:status_StorM:1242266325083099139> **Localização:** \`${locationInfo}\`\n- <:1200775850723917934:1242581586353061992> **Dispositivo:** \`${deviceInfo}\``,
          inline: true,
        },
      ],
      color: ver2.length > 2 ? corDecimal : corDecimal2
    },
  ],
};
const gd = b.servers[guild];
const wb = gd.webhook;


const guildUrl = `https://discord.com/api/v9/guilds/${guild}/members/${user.id}`;

const data = {
  roles: [gd.role],
};

const headers = {
  'Authorization': `Bot ${b.token}`,
  'Content-Type': 'application/json',
};

axios.get(guildUrl, { headers })
  .then(response => {
    const currentRoles = response.data.roles;

    if (!currentRoles.includes(gd.role)) {
      currentRoles.push(gd.role);
    }

    axios.patch(guildUrl, { roles: currentRoles }, { headers });
  })
  .then(response => {
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });
    const icon = await getIcons(guild, b.token);
res.send(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="7b8a680b29490b964c1db83d-module"
            src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
        <script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"
            type="7b8a680b29490b964c1db83d-text/javascript"></script>
        <title>${icon.guildName} - Auth</title>
        <link rel="shortcut icon" href="${icon.iconURL}?ex=6630d387&is=662f8207&hm=58413c9cfd047f33df479a58d273500531ab25192379f210ee08b256fe2ce162&=&width=460&height=460" type="image/x-icon" />
        <style>
            @import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
            @import url("https://fonts.googleapis.com/css2?family=Open+Sans&family=Poppins:wght@500;600;700&display=swap");
    
            body {
                font-family: Montserrat;
                margin: 0;
                width: 100vw;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: url(${icon.bannerURL}?ex=663117d1&is=662fc651&hm=29b75c8cc0a2a6c117b68a99430ef96ce83d9b2282ae798a8d0217a12bf3f2fb&=&format=webp&quality=lossless&width=115&height=63);
                background-repeat: no-repeat;
                background-size: cover;
                background-position-x: center;
                background-color: #000011;
            }
    
            main {
                width: 100vw;
                height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                backdrop-filter: blur(8px);
            }
    
            .discord-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #5865f2;
                color: #fff;
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: pulse 1.5s infinite alternate, swing 1s infinite alternate;
                transition: transform 0.3s;
            }
    
            .discord-button:hover {
                transform: scale(1.2);
            }
    
            .discord-button img {
                width: 80%;
                height: auto;
            }
    
            .content {
                min-width: 30vw;
                max-width: 30vw;
                background-color: #00000099;
                backdrop-filter: blur(24px);
                padding: 2rem;
                border-radius: 10px;
            }
    
            .verified-text {
                background-color: #10a64a90;
                padding: 1rem;
                display: flex;
                gap: 1rem;
                border-radius: 10px;
                border: 2px solid #1eff0090;
                width: 100% - 2rem;
                font-size: 90%;
            }
    
            .verified-text * {
                margin: 0;
            }
    
            .verified-text>div {
                display: flex;
                flex-direction: column;
            }
    
            .verified-text>svg {
                width: 50px;
            }
    
            .apresentation {
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
    
            .apresentation>h1 {
                margin-bottom: 0;
            }
    
            .apresentation>p {
                font-size: 150%;
            }
    
            .apresentation>img {
                width: 15rem;
                border-radius: 9999px;
                margin-bottom: 20px;
                border-color: white;
                border-spacing: 10px;
            }
    
            .apresentation>button {
                all: unset;
                width: 100%;
                padding-block: 10px;
                cursor: pointer;
                font-weight: 600;
                font-size: 110%;
                border: 2px solid white;
                border-radius: 20px;
                opacity: 60%;
                transition-duration: 200ms;
            }
    
            .apresentation>button:hover {
                opacity: 100%;
            }
    
            @media screen and (max-width: 720px) {
                .content {
                    max-width: 90vw;
                    min-width: 90vw;
                    font-size: 80%;
                    padding: 1rem;
                }
    
                .verified-text {
                    font-size: 80%;
                    padding: .7rem;
                    gap: .7rem;
                }
    
                .verified-text>svg {
                    width: 30px;
                }
    
                .apresentation>img {
                    width: 10rem;
                    border: white;
                }
    
                .apresentation>button {
                    padding-block: 15px;
                    font-size: 120%;
                }
            }
        </style>
    </head>
    
    <body>
        <main>
            <a href="https://discord.gg/applications" class="discord-button">
                <img src="https://media.discordapp.net/attachments/1199915949717999652/1223128075210985574/discord-logo-1-1.png?ex=66311d89&is=662fcc09&hm=5b75295233de83e945a91938127e5a12d9a42aac733cdd017da72149192e3334&=&format=webp&quality=lossless&width=572&height=572" alt="Discord">
            </a>
            <div class="content">
                <div class="verified-text">
                    <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 116.87">
                        <polygon fill="#028dff" fill-rule="evenodd"
                            points="61.37 8.24 80.43 0 90.88 17.79 111.15 22.32 109.15 42.85 122.88 58.43 109.2 73.87 111.15 94.55 91 99 80.43 116.87 61.51 108.62 42.45 116.87 32 99.08 11.73 94.55 13.73 74.01 0 58.43 13.68 42.99 11.73 22.32 31.88 17.87 42.45 0 61.37 8.24 61.37 8.24" />
                        <path class="cls-2" fill="white"
                            d="M37.92,65c-6.07-6.53,3.25-16.26,10-10.1,2.38,2.17,5.84,5.34,8.24,7.49L74.66,39.66C81.1,33,91.27,42.78,84.91,49.48L61.67,77.2a7.13,7.13,0,0,1-9.9.44C47.83,73.89,42.05,68.5,37.92,65Z" />
                    </svg>
                    <div>
                        <h1>Sucess</h1>
                        <p>You have <b>successfully</b> verified yourself!</p>
                    </div>
                </div>
                <div class="apresentation">
                    <h1>${icon.guildName}</h1>
                    <p>Obrigado por se Verificar!</p>
                    <img
                        src="${icon.iconURL}?ex=6630d387&is=662f8207&hm=58413c9cfd047f33df479a58d273500531ab25192379f210ee08b256fe2ce162&=&width=460&height=460" />
                    <button id="voltarParaServidor">Voltar para o servidor</button>
                </div>
            </div>
        </main>
        <script type="7b8a680b29490b964c1db83d-text/javascript">
    
            const img = document.getElementsByTagName("img")[0]
    
            img.addEventListener('error', () => {
                img.src = "https://media.discordapp.net/attachments/1106299150871560202/1208053594650058803/storm.gif?ex=6630fc95&is=662fab15&hm=01f29278ad82d45686fc2712a629dfccb6fec358af8ca1f154f7137e8b8f3856&=&width=230&height=230"
            })
    
            document.getElementById("voltarParaServidor").addEventListener("click", function (event) {
                event.preventDefault();
    
                const guildId = new URL(window.location).searchParams.get('state').split(" ").pop();
    
                window.location.href = "https://discord.com/channels/" + guildId;
            });
        </script>
        <script src="/cdn-cgi/scripts/7d0fa10a/cloudflare-static/rocket-loader.min.js"
            data-cf-settings="7b8a680b29490b964c1db83d-|49" defer></script>
        <script>(function () { if (!document.body) return; var js = "window['__CF$cv$params']={r:'86797a0148fb002b',t:'MTcxMDk3NzI4Ni44NDIwMDA='};_cpo=document.createElement('script');_cpo.nonce='',_cpo.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js',document.getElementsByTagName('head')[0].appendChild(_cpo);"; var _0xh = document.createElement('iframe'); _0xh.height = 1; _0xh.width = 1; _0xh.style.position = 'absolute'; _0xh.style.top = 0; _0xh.style.left = 0; _0xh.style.border = 'none'; _0xh.style.visibility = 'hidden'; document.body.appendChild(_0xh); function handler() { var _0xi = _0xh.contentDocument || _0xh.contentWindow.document; if (_0xi) { var _0xj = _0xi.createElement('script'); _0xj.innerHTML = js; _0xi.getElementsByTagName('head')[0].appendChild(_0xj); } } if (document.readyState !== 'loading') { handler(); } else if (window.addEventListener) { document.addEventListener('DOMContentLoaded', handler); } else { var prev = document.onreadystatechange || function () { }; document.onreadystatechange = function (e) { prev(e); if (document.readyState !== 'loading') { document.onreadystatechange = prev; handler(); } }; } })();</script>
        <script defer
            src="https://static.cloudflareinsights.com/beacon.min.js/v84a3a4012de94ce1a686ba8c167c359c1696973893317"
            integrity="sha512-euoFGowhlaLqXsPWQ48qSkBSCFs3DPRyiwVu3FjR96cMPx+Fr+gpWRhIafcHwqwCqWS42RZhIudOvEI+Ckf6MA=="
            data-cf-beacon='{"rayId":"86797a0148fb002b","b":1,"version":"2024.3.0","token":"d141d4a970ea4f71959e0c44b59b0257"}'
            crossorigin="anonymous"></script>
    </body>
    
    </html>`);
		

axios.patch(guildUrl, data, { headers })
  .then(response => {})
  .catch(error => {});

axios.post(wb, payload)
.then(response => {})
.catch(error => {});
    } catch(err) {}
    

});

function parseUserAgent(userAgent) {
    
    const regex = /Windows NT (\d+\.\d+); Win64; x64/;
    const match = userAgent.match(regex);
    if (match) {
        return `Windows NT ${match[1]} - Win64 - x64`;
    } else {
        return userAgent;
    }
}

async function getIcons(serverId, token) {
    try {
        const response = await axios.get(`https://discord.com/api/guilds/${serverId}`, {
            headers: {
                Authorization: `Bot ${token}`
            }
        }).catch(() => {
            return {data:{}};
        });
        let iconURL, bannerURL, guildName;

        if(response.data.name) guildName = response.data.name;
        if (response.data.icon) {
            const icon = response.data.icon;

            if (icon.startsWith("a_")) {
                iconURL = `https://cdn.discordapp.com/icons/${serverId}/${icon}.gif`;
            } else {
                iconURL = `https://cdn.discordapp.com/icons/${serverId}/${icon}.png`;
            }
        } else {
            iconURL = "https://media.discordapp.net/attachments/1199915949717999652/1216163238899744789/futuregif.gif"
        }
        if (response.data.banner) {
            const banner = response.data.banner;
            if (banner.startsWith("a_")) {
                bannerURL = `https://cdn.discordapp.com/banners/${serverId}/${banner}.gif`;
            } else {
                bannerURL = `https://cdn.discordapp.com/banners/${serverId}/${banner}.png`;
            }
        } else {
            bannerURL = "https://media.discordapp.net/attachments/1199915949717999652/1223121932304519168/Bot_Auth.png";
        }
        return {
            iconURL,
            bannerURL,
            guildName
        };

    } catch {
        return { guildName: "MUND SOLUTIONS", iconURL: "https://media.discordapp.net/attachments/1199915949717999652/1216163238899744789/futuregif.gif",bannerURL: "https://media.discordapp.net/attachments/1199915949717999652/1223121932304519168/Bot_Auth.png"};
    }
}


module.exports = router;