const axios = require("axios");

module.exports.config = {
    name: "ai",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "lol",
    hasPrefix: false,
    description: "AI",
    commandCategory: "ai",
    usages: "[ask]",
    cooldowns: 2,
    dependencies: {
        "axios": "1.4.0"
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    const query = args.join(" ").trim();

    if (!query) {
        return api.sendMessage(global.font("Please provide a question."), threadID, messageID);
    }

    const processingMessage = global.font(`Searching for "${query}"....`);
    api.sendMessage(processingMessage, threadID, async (err, info) => {
        if (err) return console.error(err);

        try {
            api.setMessageReaction("⌛", messageID, () => {}, true);

            const response = await axios.get(`https://rapido.zetsu.xyz/api/aria?prompt=${encodeURIComponent(query)}`);
            const reply = response.data.response || global.font("Sorry, I couldn't understand that.");

            api.sendMessage(global.font(reply), threadID, messageID);
            api.setMessageReaction("✅", messageID, () => {}, true);
        } catch (error) {
            console.error("Error fetching data from API:", error);
            api.sendMessage(global.font("An error occurred while fetching data. Please try again later."), threadID, messageID);
        }
    });
};
