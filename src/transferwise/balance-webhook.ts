import * as functions from "firebase-functions";

const twBalanceWebhook = functions
  .region("europe-west1")
  .https.onRequest((request, response) => {
    console.log(request.body);
    console.log(request.query);
    response.send("Hello from Firebase!\n\n");
  });

export default twBalanceWebhook;
