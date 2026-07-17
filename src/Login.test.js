import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";
import axios from "axios";

// Mock axios
jest.mock("axios");

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Login Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders login form correctly", () => {
    render(<Login />);
    expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  test("updates email and password state when user types", () => {
    render(<Login />);
    const emailInput = screen.getByPlaceholderText("Email Address");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  test("submits form and navigates to patient home on patient login success", async () => {
    const mockUser = { email: "patient@test.com", role: "PATIENT", token: "token-abc" };
    axios.post.mockResolvedValueOnce({ data: mockUser });

    render(<Login />);
    const emailInput = screen.getByPlaceholderText("Email Address");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    fireEvent.change(emailInput, { target: { value: "patient@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/auth/login"), {
        email: "patient@test.com",
        password: "password123",
      });
      expect(localStorage.getItem("user")).toEqual(JSON.stringify(mockUser));
      expect(mockNavigate).toHaveBeenCalledWith("/patient-home");
    });
  });

  test("submits form and navigates to doctor home on doctor login success", async () => {
    const mockUser = { email: "doctor@test.com", role: "DOCTOR", token: "token-xyz" };
    axios.post.mockResolvedValueOnce({ data: mockUser });

    render(<Login />);
    const emailInput = screen.getByPlaceholderText("Email Address");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    fireEvent.change(emailInput, { target: { value: "doctor@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/auth/login"), {
        email: "doctor@test.com",
        password: "password123",
      });
      expect(localStorage.getItem("user")).toEqual(JSON.stringify(mockUser));
      expect(mockNavigate).toHaveBeenCalledWith("/doctor-home");
    });
  });

  test("displays error message on login failure", async () => {
    axios.post.mockRejectedValueOnce(new Error("Unauthorized"));

    render(<Login />);
    const emailInput = screen.getByPlaceholderText("Email Address");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    fireEvent.change(emailInput, { target: { value: "wrong@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });
});
