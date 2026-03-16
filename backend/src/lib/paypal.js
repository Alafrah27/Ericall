import paypal from "@paypal/checkout-server-sdk";

const Enviroment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_SECRET_KEY,
);

const Client = new paypal.core.PayPalHttpClient(Enviroment);

export default Client;
