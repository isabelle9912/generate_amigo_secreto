// const twilio = require("twilio");
// require("dotenv");

// // Substitua pelas credenciais da sua conta Twilio
// const accountSid = "SEU_ACCOUNT_SID";
// const authToken = "SEU_AUTH_TOKEN";
// const fromNumber = "whatsapp:+SEU_NUMERO_VERIFICADO";

// const client = twilio(accountSid, authToken);

// async function sendMessage(to, message) {
//   try {
//     const result = await client.messages.create({
//       from: fromNumber,
//       to: `whatsapp:${to}`,
//       body: message,
//     });
//     console.log(`Mensagem enviada para ${to}`);
//     console.log(message);
//   } catch (error) {
//     console.error(`Erro ao enviar mensagem para ${to}:`, error);
//   }
// }

// module.exports = { sendMessage };
