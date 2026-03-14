import paypal from "@paypal/checkout-server-sdk";

const Enviroment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET,
);

const client = new paypal.core.PayPalHttpClient(Enviroment);

export default client;
