// still in blue stuff ---------------------------------
const Sib = require("sib-api-v3-sdk");

require("dotenv").config();

const client = Sib.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.API_KEY;

//
// api Goal 2: Pull JWT secret and database URL into env vars
//
// 1. Create two new env vars: JWT_SECRET and MONGODB_URL
// 2. Setup values for each in the development env files
// 3. Swap out three hardcoded values
// 4. Test your work. Create a new user and get their profile
//

const tranEmailApi = new Sib.TransactionalEmailsApi();

const sender = {
  email: "dwhites49@s.tooeletech.edu",
};

const receivers = [
  {
    email: "dtobyw@gmail.com",
  },
];

const sendWelcomeEmail = (email, name) =>
  tranEmailApi
    .sendTransacEmail({
      sender,
      to: receivers,
      subject: "Thanks for joining in!",
      textContent: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
      // htmlContent: "",
    })
    .then(console.log)
    .catch(console.log);

//
// api Goal 1: Send email to user on cancelation
//
// 1. Setup a new function for sending an email on cancelation
//    - email and name as args
// 2. Include their name in the email and ask why they canceled
// 3. Call it just after the account is removed
// 4. Run the request and check your inbox!
//

const sendCancelationEmail = (email, name) =>
  tranEmailApi
    .sendTransacEmail({
      sender,
      to: receivers,
      subject: "Sorry to see you go!",
      textContent: `GoodBye, ${name}. I hope to see you back sometime soon.`,
      // htmlContent: "",
    })
    .then(console.log)
    .catch(console.log);

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};

// CODE FOR "SEND IN BLUE" -----------------------------------------------------------
// const sendWelcomeEmail = (email, name) =>
//   tranEmailApi.sendTransacEmail({
//     sender,
//     to: receivers,
//     subject: "Thanks for joining in!",
//     textContent: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
//     // htmlContent: "",
//   });

// GET DATA FOR YOUR API AKA. YOUR CALL AMOUT LEFT -----------------------------------
var api = new Sib.AccountApi();
api.getAccount().then(
  function (data) {
    console.log("API called successfully. Returned data:");
    console.log("Credits left: " + data.plan[0].credits);
  },
  function (error) {
    console.error(error);
  }
);
