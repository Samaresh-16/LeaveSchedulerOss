// src/services/authService.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const login = async (credentials) => {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/api/auth/login`,
			credentials
		);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : new Error("Network error");
	}
};

export const register = async (userData) => {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/api/auth/register`,
			userData
		);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : new Error("Network error");
	}
};

export const logout = () => {
	localStorage.removeItem("authToken");
};

export const setUser = async (user) => {
	localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
	return JSON.parse(localStorage.getItem("user") ?? "null");
};

export const setToken = (token) => {
	localStorage.setItem("authToken", token);
};

export const getToken = () => {
	return localStorage.getItem("authToken");
};

export const isAuthenticated = () => {
	return !!getToken();
};
