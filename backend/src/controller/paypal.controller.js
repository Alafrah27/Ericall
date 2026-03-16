import paypal from "@paypal/checkout-server-sdk";
import User from "../modal/user.modal.js";
import Client from "../lib/paypal.js";
import Transation from "../modal/transations.modal.js";

export const createPaymentWithPaypal = async (req, res) => {
  try {
    const { amount } = req.body;

    // Ensure amount is a positive number
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount provided" });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD", // Explicitly set currency
            value: parseFloat(amount).toFixed(2), // Ensure format is "0.00" string
          },
        },
      ],
      application_context: {
        return_url: `${process.env.DOMAIN_URL || 'http://localhost:4000'}/api/v1/paypal/success`,
        cancel_url: `${process.env.DOMAIN_URL || 'http://localhost:4000'}/api/v1/paypal/cancel`,
        brand_name: "Ericall App",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    });

    const order = await Client.execute(request);
    
    // Extract the approve URL to return to the frontend
    const approveLink = order.result.links.find(link => link.rel === "approve");
    const approveUrl = approveLink ? approveLink.href : null;

    if (!approveUrl) {
      throw new Error("No approve URL returned from PayPal.");
    }
    
    return res.status(200).json({ id: order.result.id, approveUrl });
  } catch (error) {
    console.error("PayPal Create Error:", error);
    return res.status(500).json({ message: "Failed to create PayPal order" });
  }
};

export const capturePaymentWithPaypal = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    if (!orderId || !userId) {
      return res.status(400).json({ message: "Missing orderId or userId" });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.prefer("return=representation");

    const capture = await Client.execute(request);

    if (capture.result.status === "COMPLETED") {
      // SECURITY FIX: Get the amount directly from PayPal result, not from the user's request
      const capturedAmount = parseFloat(
        capture.result.purchase_units[0].payments.captures[0].amount.value,
      );

      // ATOMIC UPDATE: Use $inc to prevent balance overwriting errors
      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: capturedAmount } },
        { new: true },
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Save Transaction
      const transaction = new Transation({
        userId,
        amount: capturedAmount,
        type: "credit",
        reference: "topup",
        paypalOrderId: orderId, // Good for auditing
      });
      await transaction.save();

      return res.status(200).json({
        success: true,
        message: "Payment captured successfully",
        newBalance: user.balance,
      });
    } else {
      return res.status(400).json({ message: "Payment not completed" });
    }
  } catch (error) {
    console.error("PayPal Capture Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const paypalCancel = async (req, res) => {
  try {
    return res.redirect("ericall://paypal-cancel");
  } catch (error) {
    console.error("PayPal Cancel Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const paypalSuccess = async (req, res) => {
  try {
    const { token } = req.query;
    return res.redirect(`ericall://paypal-success${token ? `?token=${token}` : ''}`);
  } catch (error) {
    console.error("PayPal Success Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
