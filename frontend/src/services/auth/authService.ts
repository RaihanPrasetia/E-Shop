import { AxiosResponse } from "axios";
import api from "../axios";

interface LoginResponse {
  token: string;
  message: string;
  user: {
    name: string;
    avatar: string;
    role: string;
  };
}

const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response: AxiosResponse<LoginResponse> = await api.post("/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error("Login gagal");
  }
};

const logoutUser = async (): Promise<void> => {
  try {
    const token = localStorage.getItem("authToken");
    if (token) {
      await api.post(
        "/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
    localStorage.removeItem("authToken");
  } catch (error) {
    console.error("Logout error:", error);
    localStorage.removeItem("authToken");
  }
};

const authService = {
  loginUser,
  logoutUser,
};

export default authService;
