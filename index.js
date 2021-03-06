const http = require("http"),
    log = require("./common/log"),
    { query } = require("./common/db"),
    osuToken = require("./objects/player");

let app = http.createServer();
global.players = [];
global.channels = [];
global.banchoConfig = undefined;

app.on("request", (req, res) => {
    // On request, get headers and method
    const { headers, method } = req;
    req.on("data", (data) => {
        if (method == "POST") {
            let osuToken = headers["osu-token"];
            if (!osuToken) {
                require("./events/loginEvent")(req, res, data, headers);
            } else {
                require("./handlers/mainHandler")(res, data, osuToken);
            }
        }
    })
    if (method != "POST") {
        require("./handlers/banchoPage")(req, res);
    }
})

app.listen(require("./config.json").server.port, async () => {
    log.info("Bancho has started successfully");
    log.info("Logging in bot");
    let botData = await query("SELECT * FROM users WHERE id = 999");
    let bot = new osuToken(botData, 0, require("./utils/countryUtils").getCountryID("A2"), 0, 0);
    bot.status.status = 8;
    bot.status.statusText = "new features";
    global.players.push(bot);
    log.info("Bot added");
    log.info("Adding all channels");
    await require("./objects/channel").createChannels()
    log.info("Channels have been added")
    log.info("Setting up bancho config");
    await require("./utils/banchoCfgUtil").createConfig()
    log.info("Bancho config created")
})