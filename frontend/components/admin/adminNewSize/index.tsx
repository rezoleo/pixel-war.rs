import Button from "components/Button";
import type { CanvasSize } from "components/CanvaPixelWar";
import Input from "components/Input";
import { useState } from "react";

interface AdminNewSizeProps {
  canvasSize: CanvasSize | null;
}

const AdminNewSize: React.FC<AdminNewSizeProps> = ({ canvasSize }) => {
  const [newSize, setNewSize] = useState<{
    width: number | null;
    height: number | null;
  }>({ width: null, height: null });

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Allow clearing input
    if (input === "") {
      setNewSize((prev) => ({ ...prev, width: null }));
      return;
    }

    const parsed = parseInt(input, 10);
    if (!isNaN(parsed) && parsed > (canvasSize?.width ?? 0)) {
      setNewSize((prev) => ({ ...prev, width: parsed }));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    if (input === "") {
      setNewSize((prev) => ({ ...prev, height: null }));
      return;
    }

    const parsed = parseInt(input, 10);
    if (!isNaN(parsed) && parsed > (canvasSize?.height ?? 0)) {
      setNewSize((prev) => ({ ...prev, height: parsed }));
    }
  };

  const handleUpload = async () => {
    if (newSize.width === null || newSize.height === null) {
      alert("Please enter valid width and height.");
      return;
    }

    try {
      const res = await fetch("/api/admin/size", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSize),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Canvas size updated successfully.");
      } else if (res.status === 401) {
        alert(data.error || "Unauthorized: Admin access required.");
      } else {
        alert(data.error || "Failed to update canvas size.");
      }
    } catch (error) {
      console.error("Network or unexpected error:", error);
      alert("Unexpected error while updating canvas size.");
    }
  };

  return (
    <div className="mt-8 flex flex-col justify-center items-center w-full border-t-2 border-neutral-300 pt-4">
      <div className="flew flex-row items-center mb-4">
        <Input
          type="number"
          name="width"
          min={(canvasSize?.width ?? 0) + 1}
          onChange={handleWidthChange}
          value={newSize.width ?? ""}
          placeholder="Enter new width"
          className="mr-4"
        />
        <Input
          type="number"
          name="height"
          min={(canvasSize?.height ?? 0) + 1}
          onChange={handleHeightChange}
          value={newSize.height ?? ""}
          placeholder="Enter new height"
        />
      </div>
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );
};

export default AdminNewSize;
