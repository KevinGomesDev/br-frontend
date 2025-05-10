import { useState, useMemo } from "react";
import { CLASSES, type Class, type Skill } from "../data/classes";
import { useRegent } from "../contexts/RegentContext";
import { BASE_ATTRIBUTES } from "../data/attributes";
import { useResources } from "../contexts/ResourceContext";
import { useFeedback } from "../contexts/AlertContext";

const baseAttributes = {
  combat: 1,
  accuracy: 1,
  focus: 1,
  armor: 1,
  vitality: 1,
};

export default function RegentView() {
  const {
    regent,
    setRegent,
    addXp,
    attributesFinalized,
    setAttributesFinalized,
  } = useRegent();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const { spendResource } = useResources();
  const { feedback, setFeedback } = useFeedback();

  function handleSpendXp() {
    if (spendResource("experiência", 1)) {
      addXp(1);
    } else {
      setFeedback({
        message: "Você não tem experiência suficiente!",
        type: "error",
      });
    }
  }

  const [form, setForm] = useState({
    name: "",
    class: "",
    description: "",
    level: 1,
    image: "",
    attributes: { ...BASE_ATTRIBUTES },
  });

  const { remainingPoints } = useMemo(() => {
    const target = regent ?? form;

    const total = 10 + target.level * 6;
    const used = Object.values(target.attributes).reduce((a, b) => a + b, 0);
    const remaining =
      regent && attributesFinalized ? Math.max(0, total - used) : total - used;

    return {
      totalPoints: total,
      usedPoints: used,
      remainingPoints: remaining,
    };
  }, [regent, form, attributesFinalized]);

  function xpToLevelUp(level: number) {
    return 10 + (level - 1) * 10;
  }

  const canChooseFeature = useMemo(() => {
    const level = Number(form.level);
    return level === 1 || level % 3 === 0;
  }, [form.level]);

  function updateAttribute(attr: keyof typeof baseAttributes, delta: number) {
    setForm((prev) => {
      const newVal = prev.attributes[attr] + delta;
      if (newVal < 1 || remainingPoints - delta < 0) return prev;
      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attr]: newVal,
        },
      };
    });
  }

  function createRegent() {
    setRegent({
      ...form,
      features: selectedSkill
        ? [{ name: selectedSkill.name, level: form.level }]
        : [],
      xp: 0,
      baseAttributes: { ...form.attributes },
    });
    setFormOpen(false);
    if (remainingPoints === 0) {
      setAttributesFinalized(true);
    }
  }

  if (!regent && !formOpen) {
    return (
      <div className="p-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setFormOpen(true)}
        >
          Create Regent
        </button>
      </div>
    );
  }

  if (formOpen) {
    return (
      <div className="bg-white rounded shadow-md w-full h-[calc(100vh-14rem)] overflow-hidden relative touch-none">
        <h2 className="text-xl font-semibold">Create Regent</h2>

        <input
          type="text"
          placeholder="Name"
          className="border p-2 w-full"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          onChange={(e) => {
            const clsName = e.target.value;
            const cls = CLASSES.find(
              (c) => c.name.toLowerCase() === clsName.toLowerCase()
            );
            setSelectedClass(cls ?? null);
            setSelectedSkill(null);
            setForm({ ...form, class: e.target.value });
          }}
          value={selectedClass?.name || ""}
        >
          <option value="">Select a Class</option>
          {CLASSES.map((cls) => (
            <option key={cls.name} value={cls.name}>
              {cls.name}
            </option>
          ))}
        </select>

        {selectedClass && canChooseFeature && (
          <div className="space-y-2">
            <p className="font-semibold">Choose a Feature:</p>
            {selectedClass.skills.map((skill: Skill) => (
              <label
                key={skill.name}
                className="flex items-center gap-2 border p-2 rounded cursor-pointer"
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
                  <p className="text-sm italic text-gray-600">
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
          className="border p-2 w-full"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          type="text"
          placeholder="Image URL"
          className="border p-2 w-full"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        <p className="font-medium">Level: 1</p>

        <div>
          <p className="font-semibold mb-2">
            Attributes (Remaining: {remainingPoints})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(form.attributes).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <label className="capitalize w-24">{key}</label>
                <button
                  className="bg-gray-300 px-2 rounded"
                  onClick={() =>
                    updateAttribute(key as keyof typeof baseAttributes, -1)
                  }
                >
                  -
                </button>
                <span>{val}</span>
                <button
                  className="bg-gray-300 px-2 rounded"
                  onClick={() =>
                    updateAttribute(key as keyof typeof baseAttributes, 1)
                  }
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={createRegent}
        >
          Confirm
        </button>
      </div>
    );
  }

  function updateAttributePostCreation(
    attr: keyof typeof baseAttributes,
    delta: number
  ) {
    setRegent((prev) => {
      if (!prev) return prev;

      const current = prev.attributes[attr];
      const base = prev.baseAttributes[attr];
      const newVal = current + delta;

      if (delta > 0 && remainingPoints <= 0) return prev;
      if (delta < 0 && newVal < base) return prev;

      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attr]: newVal,
        },
      };
    });
  }

  return (
    <div className="bg-white rounded shadow-md w-full h-[calc(100vh-14rem)]  relative touch-none p-4 space-y-4">
      <h2 className="text-xl font-semibold">Regent: {regent?.name}</h2>
      <p className="italic">Class: {regent?.class}</p>
      <p>{regent?.description}</p>
      {regent?.image && (
        <img
          src={regent.image}
          alt="Regent"
          className="w-40 h-40 object-cover rounded"
        />
      )}

      <div>
        <p className="font-semibold">Level: {regent?.level}</p>
        {remainingPoints > 0 && (
          <p className="font-semibold text-green-700">
            Attribute Points Remaining: {remainingPoints}
          </p>
        )}

        <p className="font-semibold">Attributes:</p>
        <ul className="ml-4 list-disc">
          {regent &&
            Object.entries(regent.attributes).map(([k, v]) => (
              <li key={k} className="flex items-center gap-2">
                <span className="capitalize">{k}</span>: {v}
                {!attributesFinalized &&
                (remainingPoints > 0 ||
                  v >
                    regent.baseAttributes[k as keyof typeof baseAttributes]) ? (
                  <>
                    <button
                      className="ml-2 px-2 bg-gray-300 rounded"
                      onClick={() =>
                        updateAttributePostCreation(
                          k as keyof typeof baseAttributes,
                          -1
                        )
                      }
                    >
                      -
                    </button>
                    <button
                      className="px-2 bg-gray-300 rounded"
                      onClick={() =>
                        updateAttributePostCreation(
                          k as keyof typeof baseAttributes,
                          1
                        )
                      }
                    >
                      +
                    </button>
                  </>
                ) : null}
              </li>
            ))}
        </ul>
        {regent && !attributesFinalized && remainingPoints > 0 && (
          <p className="text-green-700 font-medium">
            Você ainda tem pontos para distribuir.
          </p>
        )}

        {regent &&
          !attributesFinalized &&
          remainingPoints === 0 &&
          (() => {
            const total = 10 + regent.level * 6;
            const used = Object.values(regent.attributes).reduce(
              (a, b) => a + b,
              0
            );

            return used === total ? (
              <button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  setRegent({
                    ...regent,
                    baseAttributes: { ...regent.attributes },
                  });
                  setAttributesFinalized(true);
                }}
              >
                Finalize Attributes
              </button>
            ) : null;
          })()}

        {regent && regent.features.length > 0 && (
          <>
            <p className="font-semibold mt-4">Features:</p>
            <ul className="ml-4 list-disc">
              {regent.features.map((f) => (
                <li key={f.name}>
                  {f.name} (Level {f.level})
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <p className="font-semibold">
                XP: {regent.xp} / {xpToLevelUp(regent.level)}
              </p>
              <div className="w-full bg-gray-200 h-4 rounded overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{
                    width: `${(regent.xp / xpToLevelUp(regent.level)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <button
              className="mt-2 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
              onClick={handleSpendXp}
            >
              Spend Experience (+1 XP)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
