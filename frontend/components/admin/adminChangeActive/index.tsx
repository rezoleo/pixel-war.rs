import Button from "components/Button";

interface AdminChangeActiveProps {
  active: boolean;
  setActive: (active: boolean) => void;
}

const AdminChangeActive: React.FC<AdminChangeActiveProps> = ({
  active,
  setActive,
}) => {
  const handleToggleActive = async () => {
    try {
      const res = await fetch("/api/admin/active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !active }),
      });

      if (res.ok) {
        alert(`Status changed to ${active ? "inactive" : "active"}`);
        setActive(!active);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Failed to change status:", error);
      alert("Failed to change status. Please try again later.");
    }
  };

  return (
    <div className="mt-8 flex flex-col justify-center items-center w-full border-t-2 border-neutral-300 pt-4">
      <Button onClick={handleToggleActive}>
        {active ? "Deactivate" : "Activate"}
      </Button>
    </div>
  );
};

export default AdminChangeActive;
