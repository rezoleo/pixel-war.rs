"use client";

import { useEffect, useState } from "react";

function HomeContent() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h1>Message from Backend:</h1>
      <h1>{message || "Loading..."}</h1>
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}
