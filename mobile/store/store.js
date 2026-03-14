import { create } from "zustand";

export const useStore = create((set) => ({
  phone: null,
  token: null,
  isLoggedIn: false,
  
}));
