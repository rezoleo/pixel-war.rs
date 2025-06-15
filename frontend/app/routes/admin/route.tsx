"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "components/Button";
import Input from "components/Input";

export default function Home() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // prevent default form submission

    try {
      const response = await axios.post(
        "/api/admin-login",
        new URLSearchParams({ password }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.status === 200) {
        navigate("/admin-control");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error || "Login failed. Please try again.";
      setError(msg);
    }
  };

  return (
    <div className="flex items-center justify-center h-100">
      <form onSubmit={handleSubmit} className="items-center space-y-4 pt-70">
        {error && (
          <div className="flex justify-center">
            <p className="text-red-500 font-bold text-lg text-center">
              {error}
            </p>
          </div>
        )}
        <Input
          type="password"
          name="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={true}
        />
        <div className="flex items-center justify-center">
          <Button
            className="sm:px-4 sm:py-2 text-sm sm:text-base"
            onClick={() => {}}
          >
            Login
          </Button>
        </div>
      </form>
    </div>
  );
}
