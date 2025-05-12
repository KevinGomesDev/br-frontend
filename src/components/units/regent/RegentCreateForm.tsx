import { useState } from "react";
import { CLASSES, type Skill } from "../../../data/classes";
import { BASE_ATTRIBUTES } from "../../../data/attributes";
import { useUnit } from "../../../contexts/UnitContext";
import { useArmy } from "../../../contexts/ArmyContext";
import type { RegentUnit } from "../../../contexts/UnitContext";
import { useRemainingPoints } from "../../../hooks/useRemainingPoints";

type Props = {
  onClose: () => void;
};

export default function RegentCreateForm({ onClose }: Props) {
  const { setSelectedUnit, setAttributesFinalized } = useUnit();
  const { addUnit } = useArmy();

  const [form, setForm] = useState({
    name: "",
    class: "",
    description: "",
    image: "",
    level: 1,
    attributes: { ...BASE_ATTRIBUTES },
  });
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const remainingPoints = useRemainingPoints(
    form.level,
    form.attributes,
    false
  );

  const selectedClass = CLASSES.find((c) => c.name === form.class);

  function updateAttribute(attr: keyof typeof BASE_ATTRIBUTES, delta: number) {
    const newVal = form.attributes[attr] + delta;
    if (newVal < 1 || remainingPoints - delta < 0) return;
    setForm((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attr]: newVal,
      },
    }));
  }

  function createRegent() {
    const newRegent: RegentUnit = {
      id: crypto.randomUUID(),
      type: "regent",
      name: form.name,
      classes: form.class ? [form.class] : [],
      description: form.description,
      image: form.image,
      level: form.level,
      attributes: { ...form.attributes },
      baseAttributes: { ...form.attributes },
      xp: 0,
      features: selectedSkill
        ? [{ name: selectedSkill.name, level: form.level }]
        : [],
      conditions: [],
      spells: [],
      actionMarks: 0,
    };

    setSelectedUnit(newRegent);
    addUnit(newRegent);
    setAttributesFinalized(true);
    onClose();
  }

  return (
    <div className="bg-card text-text rounded shadow-md w-full p-4 space-y-4">
      <h2 className="text-xl font-semibold">Create Regent</h2>

      <input
        type="text"
        placeholder="Name"
        className="border border-[var(--input-border)] bg-[var(--input-bg)] text-text p-2 w-full"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <select
        className="border border-[var(--input-border)] bg-[var(--input-bg)] text-text p-2 w-full cursor-pointer"
        onChange={(e) => {
          setSelectedSkill(null);
          setForm({ ...form, class: e.target.value });
        }}
        value={form.class}
      >
        <option value="">Select a Class</option>
        {CLASSES.map((cls) => (
          <option key={cls.name} value={cls.name}>
            {cls.name}
          </option>
        ))}
      </select>

      {selectedClass && (
        <div className="space-y-2">
          <p className="font-semibold">Choose a Feature:</p>
          {selectedClass.skills.map((skill) => (
            <label
              key={skill.name}
              className="flex items-center gap-2 border border-[var(--input-border)] bg-[var(--input-bg)] text-text p-2 rounded cursor-pointer"
            >
              <input
                type="radio"
                name="feature"
                value={skill.name}
                checked={selectedSkill?.name === skill.name}
                onChange={() => setSelectedSkill(skill)}
              />
              <div>
                <p className="font-bold">{skill.name}</p>
                <p className="text-sm italic text-[var(--subtle-text)]">
                  {skill.type} | Cost: {skill.cost}
                </p>
                <p className="text-sm">{skill.description}</p>
              </div>
            </label>
          ))}
        </div>
      )}

      <textarea
        placeholder="Description"
        className="border border-[var(--input-border)] bg-[var(--input-bg)] text-text p-2 w-full"
        rows={3}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <input
        type="text"
        placeholder="Image URL"
        className="border border-[var(--input-border)] bg-[var(--input-bg)] text-text p-2 w-full"
        value={form.image}
        onChange={(e) => setForm({ ...form, image: e.target.value })}
      />

      <p className="font-medium">Level: {form.level}</p>

      <div>
        <p className="font-semibold mb-2">
          Attributes (Remaining: {remainingPoints})
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(form.attributes).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <label className="capitalize w-24">{key}</label>
              <button
                className="bg-[var(--button-secondary)] text-[var(--button-secondary-text)] px-2 rounded"
                onClick={() =>
                  updateAttribute(key as keyof typeof BASE_ATTRIBUTES, -1)
                }
              >
                -
              </button>
              <span>{val}</span>
              <button
                className="bg-[var(--button-secondary)] text-[var(--button-secondary-text)] px-2 rounded"
                onClick={() =>
                  updateAttribute(key as keyof typeof BASE_ATTRIBUTES, 1)
                }
              >
                +
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        className="bg-[var(--button-confirm)] text-[var(--button-confirm-text)] px-4 py-2 rounded hover:bg-[var(--button-confirm-hover)]"
        onClick={createRegent}
      >
        Confirm
      </button>
    </div>
  );
}
