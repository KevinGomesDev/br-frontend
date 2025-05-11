import { useState, useMemo, useEffect, useRef } from "react";
import { CLASSES, type Class, type Skill } from "../data/classes";
import { useRegent } from "../contexts/RegentContext";
import { BASE_ATTRIBUTES } from "../data/attributes";
import { useResources } from "../contexts/ResourceContext";
import { useFeedback } from "../contexts/AlertContext";
import { useRemainingPoints } from "../hooks/useRemainingPoints";
import { xpToLevelUp } from "../utils/xp";

export default function RegentView() {
  const {
    regent,
    setRegent,
    addXp,
    attributesFinalized,
    setAttributesFinalized,
  } = useRegent();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const { spendResource } = useResources();
  const { setFeedback } = useFeedback();
  const [pendingFeatureLevels, setPendingFeatureLevels] = useState<number[]>(
    []
  );

  const [form, setForm] = useState({
    name: "",
    class: "",
    description: "",
    level: 1,
    image: "",
    attributes: { ...BASE_ATTRIBUTES },
  });
  const selectedClass = CLASSES.find((c) => c.name === form.class);

  const targetLevel = pendingFeatureLevels[0] ?? (regent?.level || 1);
  const allLearnedNames = regent?.features.map((f) => f.name) ?? [];
  const canLearnNewSkill = pendingFeatureLevels.length > 0;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const remainingPoints = useRemainingPoints(
    regent?.level || form.level,
    regent?.attributes || form.attributes,
    attributesFinalized
  );

  const xpBlocked =
    canLearnNewSkill || remainingPoints > 0 || !attributesFinalized;

  const availableClasses = useMemo(() => {
    const remainingSkillsByClass = CLASSES.filter((c) =>
      regent?.classes.includes(c.name)
    ).map((cls) => ({
      cls,
      remaining: cls.skills.filter((s) => !allLearnedNames.includes(s.name)),
    }));

    if (remainingSkillsByClass.some((r) => r.remaining.length > 0)) {
      return remainingSkillsByClass
        .filter((r) => r.remaining.length > 0)
        .map((r) => r.cls);
    }

    return CLASSES.filter((c) => !regent?.classes.includes(c.name));
  }, [regent?.classes, allLearnedNames]);

  useEffect(() => {
    if (!regent) return;
    const alreadyLearnedLevels = regent.features.map((f) => f.level);
    const newLevels: number[] = [];

    for (let lvl = 3; lvl <= regent.level; lvl += 3) {
      if (!alreadyLearnedLevels.includes(lvl)) {
        newLevels.push(lvl);
      }
    }

    setPendingFeatureLevels(newLevels);
  }, [regent?.level]);

  useEffect(() => {
    if (!regent || !canLearnNewSkill || !targetLevel) return;

    const allKnownClasses = CLASSES.filter((cls) =>
      regent.classes.includes(cls.name)
    );

    const availableSkills = allKnownClasses
      .flatMap((cls) => cls.skills.map((s) => ({ ...s, className: cls.name })))
      .filter((skill) => !allLearnedNames.includes(skill.name));

    if (availableSkills.length === 1) {
      const skill = availableSkills[0];
      setRegent((prev) =>
        prev
          ? {
              ...prev,
              classes: prev.classes.includes(skill.className)
                ? prev.classes
                : [...prev.classes, skill.className],
              features: [
                ...prev.features,
                { name: skill.name, level: targetLevel },
              ],
            }
          : prev
      );
      setPendingFeatureLevels((prev) =>
        prev.filter((lvl) => lvl !== targetLevel)
      );
      return;
    }
  }, [canLearnNewSkill, regent, targetLevel, allLearnedNames]);

  function updateAttribute(attr: keyof typeof BASE_ATTRIBUTES, delta: number) {
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

  function handleSpendXp() {
    if (xpBlocked) return;
    if (spendResource("experiência", 1)) {
      addXp(1);
    } else {
      setFeedback({
        message: "Você não tem experiência suficiente!",
        type: "error",
      });
    }
  }

  function createRegent() {
    setRegent({
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
      <div className="bg-white rounded shadow-md w-full relative touch-none p-4 space-y-4">
        <h2 className="text-xl font-semibold">Create Regent</h2>

        <input
          type="text"
          placeholder="Name"
          className="border p-2 w-full"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          className="border p-2 cursor-pointer"
          onChange={(e) => {
            const clsName = e.target.value;
            const cls = CLASSES.find(
              (c) => c.name.toLowerCase() === clsName.toLowerCase()
            );
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
                    updateAttribute(key as keyof typeof BASE_ATTRIBUTES, -1)
                  }
                >
                  -
                </button>
                <span>{val}</span>
                <button
                  className="bg-gray-300 px-2 rounded"
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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={createRegent}
        >
          Confirm
        </button>
      </div>
    );
  }

  function updateAttributePostCreation(
    attr: keyof typeof BASE_ATTRIBUTES,
    delta: number
  ) {
    setRegent((prev) => {
      if (!prev) return prev;

      const current = prev.attributes[attr];
      const base = prev.baseAttributes[attr];
      const newVal = current + delta;

      if ((delta > 0 && remainingPoints <= 0) || (delta < 0 && newVal < base))
        return prev;

      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attr]: newVal,
        },
      };
    });
  }

  function startHoldingXp() {
    if (xpBlocked) return;
    if (intervalRef.current !== null) return;

    let speed = 100;
    let pressCount = 0;

    const tick = () => {
      if (canLearnNewSkill || remainingPoints > 0) {
        stopHoldingXp();
        return;
      }

      pressCount++;
      if (spendResource("experiência", 1)) {
        addXp(1);
      } else {
        setFeedback({
          message: "Você não tem experiência suficiente!",
          type: "error",
        });
        stopHoldingXp();
      }

      if (pressCount % 5 === 0 && speed > 100) {
        speed = Math.max(100, speed - 100);
        clearInterval(intervalRef.current!);
        intervalRef.current = window.setInterval(tick, speed);
      }
    };

    intervalRef.current = window.setInterval(tick, speed);
  }

  function stopHoldingXp() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  return (
    <div className="bg-white rounded shadow-md w-full relative touch-none p-4 space-y-4">
      <h2 className="text-xl font-semibold">Regent: {regent?.name}</h2>
      <p className="italic">Classes: {regent?.classes.join(", ")}</p>
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
                    regent.baseAttributes[
                      k as keyof typeof BASE_ATTRIBUTES
                    ]) ? (
                  <>
                    <button
                      className="ml-2 px-2 bg-gray-300 rounded"
                      onClick={() =>
                        updateAttributePostCreation(
                          k as keyof typeof BASE_ATTRIBUTES,
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
                          k as keyof typeof BASE_ATTRIBUTES,
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
            <div className="space-y-2">
              {regent.features.map((f) => {
                const allKnownSkills = CLASSES.filter((c) =>
                  regent.classes.includes(c.name)
                ).flatMap((c) => c.skills);

                const feature = allKnownSkills.find((s) => s.name === f.name);

                if (!feature) return null;

                return (
                  <div
                    key={feature.name}
                    className="border p-3 rounded bg-gray-50 shadow-sm"
                  >
                    <p className="font-bold text-lg">{feature.name}</p>
                    <p className="text-sm italic text-gray-600 mb-1">
                      {feature.type} | Cost: {feature.cost}
                    </p>
                    <p className="text-sm">{feature.description}</p>
                    <p className="text-xs mt-2 text-gray-500">
                      Desbloqueada no nível {f.level}
                    </p>
                  </div>
                );
              })}
            </div>

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
              disabled={xpBlocked}
              onMouseDown={startHoldingXp}
              onMouseUp={stopHoldingXp}
              onMouseLeave={stopHoldingXp}
              onTouchStart={startHoldingXp}
              onTouchEnd={stopHoldingXp}
              onClick={handleSpendXp}
              className={`mt-2 px-3 py-1 rounded text-white ${
                xpBlocked
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              Spend Experience
            </button>
          </>
        )}
        {canLearnNewSkill && (
          <div className="mt-6 space-y-2">
            <p className="font-semibold text-lg">
              Escolha uma nova habilidade:
            </p>

            {availableClasses.map((cls) => (
              <div key={cls.name}>
                <p className="font-bold text-blue-600">{cls.name}</p>
                <div className="space-y-2">
                  {cls.skills
                    .filter((skill) => !allLearnedNames.includes(skill.name))
                    .map((skill) => (
                      <div
                        key={skill.name}
                        className="border p-3 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setRegent((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  classes: prev.classes.includes(cls.name)
                                    ? prev.classes
                                    : [...prev.classes, cls.name],
                                  features: [
                                    ...prev.features,
                                    { name: skill.name, level: targetLevel! },
                                  ],
                                }
                              : prev
                          );

                          setPendingFeatureLevels((prev) =>
                            prev.filter((lvl) => lvl !== targetLevel)
                          );
                        }}
                      >
                        <p className="font-bold">{skill.name}</p>
                        <p className="text-sm italic text-gray-600">
                          {skill.type} | Cost: {skill.cost}
                        </p>
                        <p className="text-sm">{skill.description}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
