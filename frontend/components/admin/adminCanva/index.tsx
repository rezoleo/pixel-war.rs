import axios from "axios";
import Button from "components/Button";
import CanvaPixelWar from "components/CanvaPixelWar";
import { useState } from "react";

interface AdminCanvaPartProps {
  fetchPixelData: () => Promise<void>;
  scale: number | null;
  pixelsData: string | null;
  canvasSize: { width: number; height: number } | null;
}

const AdminCanvaPart: React.FC<AdminCanvaPartProps> = ({
  fetchPixelData,
  scale,
  pixelsData,
  canvasSize,
}) => {
  const [pixelStart, setPixelStart] = useState<{
    x: number | null;
    y: number | null;
  }>({ x: null, y: null });
  const [pixelEnd, setPixelEnd] = useState<{
    x: number | null;
    y: number | null;
  }>({ x: null, y: null });

  const handlePixelStart = (x: number, y: number) => {
    setPixelStart({ x: x, y: y });
  };

  const handlePixelEnd = (x: number, y: number) => {
    setPixelEnd({ x: x, y: y });
  };

  const handleReset = () => {
    setPixelStart({ x: null, y: null });
    setPixelEnd({ x: null, y: null });
  };

  const onClick = async () => {
    if (
      pixelStart.x === null ||
      pixelStart.y === null ||
      pixelEnd.x === null ||
      pixelEnd.y === null
    ) {
      const message = "Start or end pixel not set.";
      console.error(message);
      alert(message);
      return;
    }

    try {
      await axios.post("/api/admin/pixels", {
        start: pixelStart,
        end: pixelEnd,
      });

      setPixelStart({ x: null, y: null });
      setPixelEnd({ x: null, y: null });
      await fetchPixelData(); // Refresh pixel data after update
      alert("Whitening area uploaded successfully.");
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 401) {
          alert("You are not authorized to perform this action.");
        } else if (status === 500 && data?.error) {
          alert(`Server error: ${data.error}`);
        } else if (data?.error) {
          alert(`Error: ${data.error}`);
        } else {
          alert("An unknown error occurred.");
        }

        console.error("Backend error:", data);
      } else {
        alert("Network error or server not reachable.");
        console.error("Network error:", err);
      }
    }
  };

  return (
    <div className="flex flex-row items-center justify-center w-full">
      <CanvaPixelWar
        width={canvasSize?.width || 0}
        height={canvasSize?.height || 0}
        scale={scale}
        currentColor="#FFFFFF"
        setPixelClicked={() => {}}
        admin={true}
        pixelsData={pixelsData}
        setPixelEnd={handlePixelEnd}
        setPixelStart={handlePixelStart}
        pixelStart={pixelStart}
      />
      <div className="flex flex-col items-center ml-4 justify-center">
        <Button className="mb-4" onClick={onClick}>
          Upload whitening
        </Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>
    </div>
  );
};

export default AdminCanvaPart;
