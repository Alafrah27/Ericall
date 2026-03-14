import Transation from "../modal/transations.modal";

export const getTransations = async (req, res) => {
  try {
    const userId = req.user.id;
    const transations = await Transation.find({ userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ transations });
  } catch (error) {
    console.error("PayPal Create Error:", error);
    return res.status(500).json({ message: "Failed to create PayPal order" });
  }
};

export const deleteManyTransations = async (req, res) => {
  try {
    const userId = req.user.id;
    const transations = await Transation.deleteMany({ userId });
    return res.status(200).json({ transations });
  } catch (error) {
    console.error("PayPal Create Error:", error);
    return res.status(500).json({ message: "Failed to create PayPal order" });
  }
};
