import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import * as readline from "readline";

function question(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

const apiId = 1; // get from - https://my.telegram.org/auth > API development tools
const apiHash = "your-api-hash"; // get from - https://my.telegram.org/auth > API development tools
const stringSession = new StringSession(""); // fill this later with the value from session.save()
const botUserId = 1; // your bot id get from addEventHandler > peer.userId.value
const botUsername = "your-bot-username"; // get it from your telegram
// const botToken = "1"; // currently not using

const handleInitializeTelegramClient = async () => {
  console.info("Please make sure apiId and apiHash is filled in...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  // client.start({ botAuthToken: botToken }); // currently not using
  await client.start({
    phoneNumber: async () => await question("Number? "),
    password: async () => await question("Password? "),
    phoneCode: async () => await question("Code? "),
    onError: (err) => console.log(err),
  });

  console.log("You should now be connected.");
  console.log("Your string session: ", client.session.save()); // Save this string to avoid logging in again

  // ***** now testing with bot ***** //
  await client.sendMessage(botUsername, { message: "/start" });
  console.log("Done sending message");

  // get message update
  client.addEventHandler(async (update) => {
    const { message } = update;

    console.log(update);
    // Check if the message has inline keyboard buttons
    if (message.replyMarkup) {
      if (update.message?.peerId?.userId?.value == botUserId) {
        let firstButton = update.message.replyMarkup.rows[0].buttons;
        let firstButtonBytes = firstButton[0].data;

        // handle the click event
        const result: Api.messages.BotCallbackAnswer = await client.invoke(
          new Api.messages.GetBotCallbackAnswer({
            peer: message.peerId,
            msgId: message.id,
            data: firstButtonBytes,
          })
        );

        console.log(result);
      }
    }
  });
};

handleInitializeTelegramClient();
