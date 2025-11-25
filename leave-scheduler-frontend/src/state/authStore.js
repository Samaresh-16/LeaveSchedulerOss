// src/state/authStore.js
import { create } from "zustand";
import {
	login,
	logout,
	register,
	setToken,
	setUser,
} from "../services/authService";

export const useAuthStore = create((set) => ({
	user: JSON.parse(localStorage.getItem("user") ?? "null"),
	token: localStorage.getItem("authToken") || null,
	isAuthenticated: !!localStorage.getItem("authToken"),
	login: async (credentials) => {
		try {
			const data = await login(credentials);
			setToken(data.token);
			let user = data.user;
			// If user is not present in login response, construct from JwtResponse DTO
			if (!user && data.token && data.id && data.username) {
				user = {
					id: data.id,
					username: data.username,
					fullName:data.fullName? data.fullName : data.username, 
					email: data.email,
					roles: data.roles,
				};
			}
			setUser(user);
			set({ user: user, token: data.token, isAuthenticated: true });
			return { ...data, user };
		} catch (error) {
			console.error("Login Error:", error);
			throw error;
		}
	},
	register: async (userData) => {
		try {
			const data = await register(userData);
			return data;
		} catch (error) {
			console.error("Registration Error:", error);
			throw error;
		}
	},
	logout: () => {
		logout();
		set({ user: null, token: null, isAuthenticated: false });
	},
}));