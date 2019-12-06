const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const config = require("./config.json");

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
    } else if (primaryCommand === "tame") {
        tameCommand(arguments, receivedMessage)
    } else {
        receivedMessage.channel.send("I don't understand the command. Try `!help`")
    }
}

function helpCommand(arguments, receivedMessage) {

    let genericHelp = "Available commands: `!tame dinoname`, for example `!tame archelon`";

    if (arguments.length === 0) {
        receivedMessage.channel.send(genericHelp)
    } else if(arguments[0] === "tame") {
        receivedMessage.channel.send("Type `!tame` followed by dino name, for example `!tame acathina`")
    } else {
        receivedMessage.channel.send(genericHelp)
    }
}

function tameCommand(arguments, receivedMessage) {

    if (arguments.length === 0) {
        helpCommand(["tame"], receivedMessage);
        return
    }

    let dino = arguments[0].toLowerCase();
    let found = false;

    readFiles('data/taming/', dino, function(filename, content) {
        if(!found) {
            receivedMessage.channel.send(filename.slice(0, -4) + "\n\n" + content);
            found = true;
        }
    }, function(err) {
        console.log(err);
        receivedMessage.channel.send("Critical Error!");
        found = true
    });

    if(!found) {
        receivedMessage.channel.send("The creature " + dino + " was not found in database");
    }
}

function readFiles(dirname, key, onFileContent, onError) {
    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function(filename) {

            if(filename.toLowerCase().startsWith(key)) {
                fs.readFile(dirname + filename, 'utf-8', function (err, content) {
                    if (err) {
                        onError(err);
                        return;
                    }
                    onFileContent(filename, content);
                });
            }
        });
    });
}
