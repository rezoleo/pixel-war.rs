import Button from "components/Button";
import Input from "components/Input";
import { useState } from "react";

const AdminDelay = () => {
  const [delay, setDelay] = useState<number | null>(0);

  const handleUpload = async () => {
    if (
      delay === null ||
      delay <= 0 ||
      isNaN(delay) ||
      !Number.isInteger(delay)
    ) {
      alert("Please enter valid delay.");
      return;
    }

    try {
      const res = await fetch("/api/admin/delay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ delay }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Delay updated successfully!");
        setDelay(null);
      } else {
        alert(`Error: ${data.error || "Failed to update canvas size."}`);
      }
    } catch (error) {
      console.error("Error updating canvas size:", error);
      alert("An error occurred while updating the canvas size.");
    }
  };

  return (
    <div className="mt-8 flex flex-col justify-center items-center w-full border-t-2 border-neutral-300 pt-4">
      <Input
        className="mb-4"
        type="number"
        name="number"
        placeholder="Enter new delay"
        value={delay?.toString() || ""}
        onChange={(e) =>
          setDelay(e.target.value === "" ? null : Number(e.target.value))
        }
      />
      <Button onClick={handleUpload}>Update Delay</Button>
    </div>
  );
};

export default AdminDelay;
