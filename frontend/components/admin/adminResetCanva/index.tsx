import Button from "components/Button";
import Input from "components/Input";
import { useState } from "react";

const AdminResetCanva = () => {
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  const handleUpload = async () => {
    if (
      width === null ||
      height === null ||
      width <= 0 ||
      height <= 0 ||
      isNaN(width) ||
      isNaN(height) ||
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width % 2 !== 0 ||
      height % 2 !== 0
    ) {
      alert("Please enter valid width and height.");
      return;
    }

    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ width: Number(width), height: Number(height) }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Canvas size updated successfully!");
        setWidth(null);
        setHeight(null);
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
      <div className="flex flex-row items-center mb-4">
        <Input
          className="mr-4"
          type="number"
          name="number"
          placeholder="Enter new width"
          value={width?.toString() || ""}
          onChange={(e) =>
            setWidth(e.target.value === "" ? null : Number(e.target.value))
          }
        />
        <Input
          type="number"
          name="number"
          placeholder="Enter new height"
          value={height?.toString() || ""}
          onChange={(e) =>
            setHeight(e.target.value === "" ? null : Number(e.target.value))
          }
        />
      </div>
      <Button onClick={handleUpload}>RESET</Button>
    </div>
  );
};

export default AdminResetCanva;
