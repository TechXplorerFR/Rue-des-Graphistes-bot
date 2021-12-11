const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const { Player } = require('discord-player');
const Enmap =  require('enmap');
const db = require('quick.db');
const fs = require('fs');
const chalk = require('chalk');
const { loadCommands } = require("./handler/loadCommands");
const { loadEvents } = require("./handler/loadEvents");
const { loadSlashCommands } = require("./handler/loadSlashCommands");
const { loadPlayerEvents } = require("./handler/loadPlayerEvents");
const { loadTwitterEvents } = require('./handler/loadTwitterEvents');
const { loadGiveawayEvents } = require('./handler/loadGiveawayEvents')
const { checkValid } = require('./functions/validation/checkValid');
const Logger = require("./functions/Logger/Logger");
const twit = require('node-tweet-stream');
const { GiveawaysManager } = require('discord-giveaways');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_PRESENCES
    ],
    allowedMentions: { parse: ["users", "roles"] },
    partials: ['GUILD_MEMBER', 'MESSAGE', 'USER', 'REACTION', "CHANNEL"]
});
const config = require('./config.json')

client.commands = new Collection();
client.config = require('./config.json')
client.slash = new Collection();
client.aliases = new Collection();
client.categories = fs.readdirSync("./commands/");
client.setMaxListeners(0);
//const Cookie = void;
client.logger = Logger;
//client.utils = void;
//client.say = void;
client.mod = require('./databases/moderation.json')
client.player = new Player(client, {
  leaveOnEnd: false,
  leaveOnStop: false,
  leaveOnEmpty: false,
  leaveOnEmptyCooldown: 60000,
  autoSelfDeaf: true,
  initialVolume: 130,
  ytdlDownloadOptions: {
    requestOptions: {
      headers: {
        //cookie: Cookie,
      }
    }
  },
});

const manager = new GiveawaysManager(client, {
    storage: "./databases/giveaways.json",
    default:{
      botsCanWin:false,
      embedColor: "#4787ed",
      embedColorEnd: "RED",
      reaction: "🎉"
    }
})

client.giveaway = manager

manager.on('giveawayEnded', (g, member, yo) => {
  const logembed = new MessageEmbed()
  .setTitle('UN GIVEAWAY EST TERMINÉ')
  .setDescription(`Winner(s): <@${g.winnerIds}> \n[Aller au message](https://discord.com/channels/${g.message.guild.id}/${g.message.channelId}/${g.message.id} \n\n Lot(s): ${g.prize}`)
  .setFooter('RDG - Giveaway Logs')
  .setTimestamp()
})

client.player.use("YOUTUBE_DL", require("@discord-player/downloader").Downloader);
client.db = new Enmap({ name: "musicdb" });

client.twitterclient = new twit({
  consumer_key: config.infos.TwitterConsumerKey,
  consumer_secret: config.infos.TwitterConsumerSecret,
  token: config.infos.TwitterAccessTokenKey,
  token_secret: config.infos.TwitterAccessTokenSecret
})

//client.settings = new Enmap({ name: "settings",dataDir: "./databases/settings.json"});

loadCommands(client);
loadEvents(client);
loadPlayerEvents(client);
loadSlashCommands(client);
loadTwitterEvents(client);
loadGiveawayEvents(client);
checkValid();

// Error Handling

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception: " + err);

  const exceptionembed = new MessageEmbed()
  .setTitle("Uncaught Exception")
  .setDescription(`${err}`)
  .setColor("RED")
  const channel = client.channels.cache.get("865534495591235604")
  channel.send({ embeds: [exceptionembed] })
});

process.on("unhandledRejection", (reason, promise) => {
  console.log(
    "[FATAL] Possibly Unhandled Rejection at: Promise ",
    promise,
    " reason: ",
    reason.message,
    reason.code
  );

/*  const rejectionembed = new MessageEmbed()
  .setTitle("Unhandled Promise Rejection")
  .addField("Promise", `${promise}`)
  .addField("Reason", `${reason.message}`)
  .addField('Explanation: ', `${reason.title}`)
  .setColor("RED")
  client.channels.cache.get("742478350303363212").send({ embeds: [rejectionembed] })*/
});

client.login(config.login.token).then(() => {
  console.log(
    chalk.bgBlueBright.black(
      ` Successfully logged in as: ${client.user.username}#${client.user.discriminator} `
    )
  );
});