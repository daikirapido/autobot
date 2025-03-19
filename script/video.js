const path = require("path");
const axios = require("axios");
const fs = require("fs");

module.exports.config = {
  name: "video",
  version: "1.0",
  credits: "Salsalerong Mark",
  description: "Play video.",
  commandCategory: "media",
  hasPermssion: 0,
  cooldowns: 5,
  usages: "[video [search]",
  role: 0,
  hasPrefix: false,
};

module.exports.run = async function ({ api, args, event }) {
  try {
    const searchQuery = args.join(" ");
    if (!searchQuery) {
      api.sendMessage("Usage: video [search]", event.threadID, (err, info) => {
        setTimeout(() => {
          api.unsendMessage(info.messageID);
        }, 10000);
      });
      return;
    }

    const loadingMessage = await new Promise(resolve => {
      api.sendMessage(`Searching for '${searchQuery}'...`, event.threadID, (err, info) => {
        resolve(info);
      });
    });

    const videoSearchUrl = `https://kaiz-apis.gleeze.com/api/ytsearch?q=${encodeURIComponent(searchQuery)}`;
    const videoResponse = await axios.get(videoSearchUrl);
    const firstVideo = videoResponse.data.items[0];

    if (!firstVideo || !firstVideo.url) {
      throw new Error("No video found");
    }

    const downloadUrl = `https://kaiz-apis.gleeze.com/api/ytdl?url=${encodeURIComponent(firstVideo.url)}`;
    const downloadResponse = await axios.get(downloadUrl);

    if (!downloadResponse.data || !downloadResponse.data.download_url) {
      throw new Error("Could not get download URL");
    }

    const videoPath = path.join(__dirname, "cache", "video.mp4");
    const videoContent = await axios.get(downloadResponse.data.download_url, { responseType: "arraybuffer" });
    fs.writeFileSync(videoPath, Buffer.from(videoContent.data));

    api.unsendMessage(loadingMessage.messageID);

    await api.sendMessage({
      body: `Here's your video from keyword "${searchQuery}"`,
      attachment: fs.createReadStream(videoPath)
    }, event.threadID, event.messageID);

    fs.unlinkSync(videoPath);

  } catch (error) {
    api.sendMessage(error.message, event.threadID, (err, info) => {
      setTimeout(() => {
        api.unsendMessage(info.messageID);
      }, 10000);
    });
  }
};