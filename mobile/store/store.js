import { create } from "zustand";
import instance from "../utils/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useStore = create((set) => ({
  phone: null,
  token: null,
  user: null,
  isVerified: false,
  isLoggedIn: false,

  setAuthData: (phone, token) => set({ phone, token, isLoggedIn: true }),

  RegisterWithTwilio: async (phone) => {
    try {
      const res = await instance.post("/auth/register", { phone });
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error('Registration Error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
  },

  VerifyOtp: async (phone, code) => {
    try {
      const res = await instance.post("/auth/verify", { phone, code });
      const { token, user, message } = res.data;
      await AsyncStorage.setItem("phone", phone);
      await AsyncStorage.setItem("token", token);
      set({ phone, isLoggedIn: true, token, isVerified: true, user });
      return { success: true, message: message || "Successfully verified" };
    } catch (error) {
      console.error('Verification Error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Invalid OTP" };
    }
  },

  CreatePaypalPayment: async (amount) => {
    try {
      const res = await instance.post("/paypal/create-payment", { amount });
      return { success: true, id: res.data.id, approveUrl: res.data.approveUrl };
    } catch (error) {
      console.error('Create PayPal Error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Could not initialize payment" };
    }
  },

  CapturePaypalPayment: async (orderId) => {
    try {
      const res = await instance.post("/paypal/capture-payment", { orderId });
      // Update local balance state immediately
      set((state) => ({ 
        user: { ...state.user, balance: res.data.newBalance } 
      }));
      return { success: true, newBalance: res.data.newBalance };
    } catch (error) {
      console.error('Capture PayPal Error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Could not capture payment" };
    }
  },

  GetTransations: async () => {
    try {
      const res = await instance.get("/transation/");
      return { success: true, transations: res.data.transations };
    } catch (error) {
      console.error('Get Transactions Error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Could not fetch transactions" };
    }
  },

  Logout: async () => {
    try {
      await AsyncStorage.removeItem('phone');
      await AsyncStorage.removeItem('token');
      set({ phone: null, token: null, user: null, isVerified: false, isLoggedIn: false });
      return { success: true };
    } catch (error) {
      console.error('Logout Error:', error);
      return { success: false };
    }
  },
}));
