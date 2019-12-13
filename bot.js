const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const config = require("./config.json");

const commands = new Map([
    ["help", "Help"],
    ["list", "Lists all creatures currently in database"],
    ["tame", "Displays information on how to tame the dino. For example `!tame archelon`"]
]);

client.on('ready', () => console.log("Connected as " + client.user.tag));

client.on('message', (receivedMessage) => {
    // Prevent bot from responding to its own messages
    if (receivedMessage.author === client.user) {
        return
    }

    if (receivedMessage.content.startsWith("!")) {
        processCommand(receivedMessage)
    }
});

client.login(config.token);

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1); // Remove the leading exclamation mark
    let splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
    let primaryCommand = splitCommand[0]; // The first word directly after the exclamation is the command
    let arguments = splitCommand.slice(1); // All other words are arguments/parameters/options for the command

    console.log("Command received: " + primaryCommand);
    console.log("Arguments: " + arguments); // There may not be any arguments

    if (primaryCommand === "help") {
        helpCommand(arguments, receivedMessage)
    } else if (primaryCommand === "list") {
        listCommand(receivedMessage)
    } else if (primaryCommand === "tame") {
        dataCommand(primaryCommand, arguments, receivedMessage)
    } else {
        receivedMessage.channel.send("I don't understand the command. Try `!help`")
    }
}

function helpCommand(arguments, receivedMessage) {

    let genericHelp = "Available commands:\n\n";

    for (const key of commands.keys()) {
        genericHelp += "`!" + key + "` - " + commands.get(key) + "\n";
    }

    if (arguments.length === 0) {
        receivedMessage.channel.send(genericHelp)
    } else if(commands.has(arguments[0])) {
        receivedMessage.channel.send( commands.get(arguments[0]) + "\nType `!" + arguments[0] + "` followed by dino name, for example `!" + arguments[0] + " acathina`")
    } else {
        receivedMessage.channel.send(genericHelp)
    }
}

function listCommand(receivedMessage) {

    listFiles('data/tame/', function(filenames) {

        let dinos = "\n";

        filenames.forEach(function(filename) {
            if(filename.length > 4) {
                dinos += filename.slice(0, -4) + "\n"
            }
        });
        sendMessage(dinos, receivedMessage);

    }, function(err) {
        error(err, receivedMessage)
    });
}

function dataCommand(primaryCommand, arguments, receivedMessage) {

    let isValid = commands.has(primaryCommand) && arguments.length > 0;

    if (!isValid) {
        helpCommand([primaryCommand], receivedMessage);
        return
    }
    findFile("data/" + primaryCommand + "/", arguments, receivedMessage)
}

function findFile(path, arguments, receivedMessage) {

    let dino = arguments.join(" ").toLowerCase();

    readFiles(path, dino, function(filename, content) {

        content = filename.slice(0, -4).toUpperCase() + "\n\n" + content;
        sendMessage(content, receivedMessage);

    }, function(err) {
        error(err, receivedMessage)
    });
}

function readFiles(dirname, key, onFileContent, onError) {
    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            onError(err);
            return;
        }

        let found = false;

        filenames.forEach(function(filename) {

            if(!found && filename.toLowerCase().startsWith(key)) {
                fs.readFile(dirname + filename, 'utf-8', function (err, content) {
                    if (err) {
                        onError(err);
                        return;
                    }
                    onFileContent(filename, content);
                });
                found = true;
            }
        });
        if(!found) {
            onFileContent(key + ".txt", key + " was not found in database. \nCheck the in-game taming journal. \nUse `!list` to list all creatures currently in database");
        }
    });
}

function listFiles(dirname, onSuccess, onError) {
    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        onSuccess(filenames)
    });
}

function chunkSubstr(str, size) {
    const numChunks = Math.ceil(str.length / size);
    const chunks = new Array(numChunks);

    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
        chunks[i] = str.substr(o, size)
    }
    return chunks
}

function sendMessage(message, receivedMessage) {
    let chunks = chunkSubstr(message, 1900);

    for (let i = 0; i < chunks.length; i++) {
        receivedMessage.channel.send(chunks[i]);
    }
}

function error(err, receivedMessage) {
    console.log(err);
    receivedMessage.channel.send("Critical Error!");
}
