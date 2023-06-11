require('dotenv').config()
const { Telegraf, Markup } = require('telegraf')
const arrangeFormats = require('./utils/arrangeFormats')
const bot = new Telegraf(process.env.BOT_TOKEN)
const ytdl = require('ytdl-core')
const filterAndGroupFormats = require('./utils/filterFromWeb')
const converSecondsToReadbleString = require('./utils/converSecondsToReadbleString')
const formatNumber = require('./utils/formatNumber')

bot.telegram.setWebhook('https://freevee-telegram-bot.vercel.app/index')

// Start listening to updates
bot.startWebhook('/index', null, process.env.PORT || 3000)

bot.start(async (ctx) => {
  try {
    const keyboardMarkup = Markup.keyboard([
      Markup.button.webApp('Freevee', 'https://freevee.vercel.app'),
    ]).resize()
    await ctx.replyWithHTML(
      'Welcome to Ram Farid freevee bot \n After you start the bot as now \n 1️⃣ Just <b>Send the video link</b> \n 2️⃣ Wait until formats loading \n 3️⃣ Choose the formats you need \n 4️⃣ Wait until it loading... \n 💣 Get the video! \n If anything went wrong you could use <a href="https://freevee.vercel.app">Freevee website</a> instead',
      keyboardMarkup
    )
  } catch (error) {
    console.error(error)
  }
})

// bot.command('leave', async (ctx) => {
//   if (ctx.chat.type !== 'private') await ctx.leaveChat()
// })

bot.on('message', async (ctx) => {
  try {
    const message = ctx.message.text
    if (
      ctx.message.photo ||
      ctx.message.document ||
      ctx.message.audio ||
      ctx.message.video ||
      ctx.message.voice ||
      ctx.message.sticker
    ) {
      // Reply with a message indicating that attachments are not allowed
      await ctx.reply(
        'Attachments are not allowed. Please send only the link URL of the video you want tto download.'
      )
      await ctx.deleteMessage(ctx.message.message_id)
      return
    }
    const youtubeLinkRegex =
      /^https:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/(.{11})$/

    const isYoutubeLink = youtubeLinkRegex.test(message)

    if (isYoutubeLink) {
      const loader = await ctx.reply('Wait a bit \n Loading formats...')
      await ctx.sendChatAction('typing')
      const videoInfo = await ytdl.getInfo(message)
      const data = {
        title: videoInfo.videoDetails.title,
        author: videoInfo.videoDetails.author,
        lengthSeconds: videoInfo.videoDetails.lengthSeconds,
        viewCount: videoInfo.videoDetails.viewCount,
        thumbnailUrl: videoInfo.videoDetails.thumbnails[0].url,
        description: videoInfo.videoDetails.description,
        formats: videoInfo.formats,
      }
      const videoMetaData = structuredClone(data)
      videoMetaData.formats = arrangeFormats(data.formats)
      const keyBoardFormats = filterAndGroupFormats(
        videoMetaData.formats,
        message
      )
      await ctx.reply('Please choose a format to download:', {
        reply_markup: {
          inline_keyboard: keyBoardFormats,
        },
      })
      await ctx.deleteMessage(loader.message_id)
    } else {
      // The message doesn't contain a YouTube link
      await ctx.reply(`
      The link doesn't correct, try again and consider the followings:
      - Must be from youtu.be domain or youtube.com
      - The ID of the video after the / symbol must be 11 characters
      `)
    }
  } catch (error) {
    console.error(error)
    return ctx.reply('Somthing happened while get video info: ' + error.message)
  }
})

bot.on('callback_query', async (ctx) => {
  try {
    ctx.deleteMessage()
    const { videoLink, itag } = JSON.parse(ctx.callbackQuery.data)
    const loader = await ctx.reply('Downloading...')
    await ctx.sendChatAction('upload_video')
    const videoInfo = await ytdl.getInfo(videoLink)
    const userFormat = videoInfo.formats.find(
      (format) => format.itag === Number(itag)
    )
    await ctx.deleteMessage(loader.message_id)
    await ctx.replyWithPhoto(
      { url: videoInfo.videoDetails.thumbnails[0].url },
      {
        caption: `Title: ${
          videoInfo.videoDetails.title
        } \n Views: ${formatNumber(
          videoInfo.videoDetails.viewCount
        )} \n Time: ${converSecondsToReadbleString(
          videoInfo.videoDetails.lengthSeconds
        )} \n Likes: ${
          videoInfo.videoDetails.likes
            ? formatNumber(videoInfo.videoDetails.likes)
            : 'Unknown'
        }`,
        reply_markup: {
          inline_keyboard: [
            [Markup.button.webApp('Download from here', userFormat.url)],
          ],
        },
      }
    )
  } catch (error) {
    console.error(error)
    return ctx.reply('Somthing happened while get video info: ' + error.message)
  }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
