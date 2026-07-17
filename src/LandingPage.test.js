import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LandingPage from "./LandingPage";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("LandingPage Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test("renders landing page content successfully", () => {
    render(<LandingPage />);
    expect(screen.getByText("MedQRate")).toBeInTheDocument();
    expect(screen.getByText(/Smart Healthcare Through/i)).toBeInTheDocument();
    expect(screen.getByText("Get Started Free")).toBeInTheDocument();
  });

  test("navigates to login page when Login button in navbar is clicked", () => {
    render(<LandingPage />);
    const loginButtons = screen.getAllByRole("button", { name: /login/i });
    fireEvent.click(loginButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("navigates to register page when Register button is clicked", () => {
    render(<LandingPage />);
    const registerButton = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerButton);
    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });

  test("navigates to register page with DOCTOR role when Doctor button is clicked", () => {
    render(<LandingPage />);
    const doctorButton = screen.getByRole("button", { name: /i'm a doctor/i });
    fireEvent.click(doctorButton);
    expect(mockNavigate).toHaveBeenCalledWith("/register", { state: { role: "DOCTOR" } });
  });

  test("navigates to register page with PATIENT role when Patient button is clicked", () => {
    render(<LandingPage />);
    const patientButton = screen.getByRole("button", { name: /i'm a patient/i });
    fireEvent.click(patientButton);
    expect(mockNavigate).toHaveBeenCalledWith("/register", { state: { role: "PATIENT" } });
  });
});
