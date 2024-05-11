async function main() {
  const { Telegraf, Markup } = require("telegraf");
  const { getDetails } = require("./api");
  const { sendFile } = require("./utils");
  const express = require("express");

  const bot = new Telegraf(process.env.BOT_TOKEN);

  // Define the force subscription channel(s) ID(s)
  const FORCE_SUB_CHANNELS = [-1001913863954];

  // Middleware to check if the user is a member of the force subscription channel(s)
  bot.use(async (ctx, next) => {
    const userId = ctx.from.id;
    const isMember = await Promise.all(
      FORCE_SUB_CHANNELS.map(async (channelId) => {
        try {
          const member = await ctx.telegram.getChatMember(channelId, userId);
          return member && member.status !== "left";
        } catch (error) {
          console.error(`Error checking membership for user ${userId} in channel ${channelId}:`, error);
          return false;
        }
      })
    );

    // If the user is not a member of any force subscription channel, prompt them to join
    if (!isMember.includes(true)) {
      await ctx.reply("You must join the force subscription channel(s) to use this bot.", Markup.inlineKeyboard([
        Markup.button.url("Join Force Sub Channel", `https://t.me/MehulBots`)
      ]));
      return;
    }

    // If the user is a member, continue with the next middleware
    return next();
  });

  bot.start(async (ctx) => {
    try {
      ctx.reply(
        `Hi ${ctx.message.from.first_name},\n\nI can Download Files from Terabox.\n\nMade with ❤️ \n\nSend any terabox link to get download link.`,
        Markup.inlineKeyboard([
          Markup.button.url(" Channel", "https://t.me/mehulbots"),
          Markup.button.url("Report bug", "https://t.me/Patil_Mehul"),
        ]),
      );
    } catch (e) {
      console.error(e);
    }
  });

  bot.on("message", async (ctx) => {
    // Handle message logic here
    // ...
  });

  const app = express();
  // Set the bot API endpoint
  app.use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL }));

  app.listen(process.env.PORT || 3000, () => console.log("Server Started"));
}

main();
