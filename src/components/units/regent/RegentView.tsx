import { useState } from "react";
import RegentCreateForm from "./RegentCreateForm";
import RegentDetails from "./RegentDetails";
import { useUnit } from "../../../contexts/UnitContext";

export default function RegentView() {
  const { selectedUnit } = useUnit();
  const [formOpen, setFormOpen] = useState(false);

  if (!selectedUnit && !formOpen) {
    return (
      <div className="p-4">
        <button
          className="bg-[var(--button-primary)] text-[var(--button-primary-text)] px-4 py-2 rounded hover:bg-[var(--button-primary-hover)]"
          onClick={() => setFormOpen(true)}
        >
          Create Regent
        </button>
      </div>
    );
  }

  if (formOpen) {
    return <RegentCreateForm onClose={() => setFormOpen(false)} />;
  }

  if (selectedUnit?.type !== "regent") return null;

  return <RegentDetails regent={selectedUnit} />;
}
