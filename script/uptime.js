const os = require('os');
const pidusage = require('pidusage');

module.exports.config = {
    name: "uptime",
    version: "1.0.3",
    role: 0,
    credits: "Jr Busaco",
    description: "uptime",
    hasPrefix: false,
    cooldowns: 5,
    aliases: ["up"]
};

function byte2mb(bytes) {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let l = 0, n = parseInt(bytes, 10) || 0;
    while (n >= 1024 && ++l) n = n / 1024;
    return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
}

function getUptime(uptime) {
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return { days, hours, mins, seconds };
}

module.exports.run = async ({ api, event }) => {
    const time = process.uptime();
    const { days, hours, mins, seconds } = getUptime(time);

    const usage = await pidusage(process.pid);

    const osInfo = {
        platform: os.platform(),
        architecture: os.arch()
    };
    
    const returnResult = `BOT has been working for ${days} day(s) ${hours} hour(s) ${mins} minute(s) ${seconds} second(s).\n\n❖ Cpu usage: ${usage.cpu.toFixed(1)}%\n❖ RAM usage: ${byte2mb(usage.memory)}\n❖ Cores: ${os.cpus().length}\n❖ Operating System Platform: ${osInfo.platform}\n❖ System CPU Architecture: ${osInfo.architecture}`;

    try {
        api.sendMessage(global.font(returnResult), event.threadID);
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage(global.font("An error occurred while processing your request."), event.threadID);
    }
};