import { useState, useRef, useEffect } from "react";
import { CLASSES } from "../../../data/classes";
import type { RegentUnit } from "../../../contexts/UnitContext";
import { BASE_ATTRIBUTES } from "../../../data/attributes";
import { useResources } from "../../../contexts/ResourceContext";
import { useFeedback } from "../../../contexts/AlertContext";
import { useRemainingPoints } from "../../../hooks/useRemainingPoints";
import { useUnit } from "../../../contexts/UnitContext";
import { xpToLevelUp } from "../../../utils/xp";
import SkillSelection from "./SkillSelection";

interface RegentDetailsProps {
  regent: RegentUnit;
}

export default function RegentDetails({ regent }: RegentDetailsProps) {
  const {
    setSelectedUnit,
    addXp,
    attributesFinalized,
    tempAttributes,
    setTempAttributes,
    finalizeAttributes,
  } = useUnit();

  const { spendResource } = useResources();
  const { setFeedback } = useFeedback();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pendingFeatureLevels, setPendingFeatureLevels] = useState<number[]>(
    []
  );

  useEffect(() => {
    const alreadyLearnedLevels = regent.features.map((f) => f.level);
    const newLevels: number[] = [];
    for (let lvl = 3; lvl <= regent.level; lvl += 3) {
      if (!alreadyLearnedLevels.includes(lvl)) {
        newLevels.push(lvl);
      }
    }
    setPendingFeatureLevels(newLevels);
  }, [regent.level]);

  const attributes = tempAttributes ?? regent.attributes;
  const remainingPoints = useRemainingPoints(
    regent.level,
    attributes,
    attributesFinalized
  );
  const canLearnNewSkill = pendingFeatureLevels.length > 0;
  const xpBlocked =
    canLearnNewSkill || remainingPoints > 0 || !attributesFinalized;

  function updateAttribute(attr: keyof typeof BASE_ATTRIBUTES, delta: number) {
    setTempAttributes((prev) => {
      const current = prev ?? regent.attributes;
      const newVal = current[attr] + delta;
      if (newVal < 1 || remainingPoints - delta < 0) return current;
      return {
        ...current,
        [attr]: newVal,
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
    <div className="bg-card text-text rounded shadow-md w-full p-4 space-y-4">
      <h2 className="text-xl font-semibold">Regent: {regent.name}</h2>
      <p className="italic">Classes: {regent.classes.join(", ")}</p>
      <p>{regent.description}</p>
      {regent.image && (
        <img
          src={regent.image}
          alt="Regent"
          className="w-40 h-40 object-cover rounded"
        />
      )}

      <div>
        <p className="font-semibold">Level: {regent.level}</p>
        {remainingPoints > 0 && (
          <p className="font-semibold text-[var(--resource-positive)]">
            Attribute Points Remaining: {remainingPoints}
          </p>
        )}

        <p className="font-semibold">Attributes:</p>
        <ul className="ml-4 list-disc">
          {Object.entries(attributes).map(([k, v]) => (
            <li key={k} className="flex items-center gap-2">
              <span className="capitalize">{k}</span>: {v}
              {!attributesFinalized &&
              (remainingPoints > 0 ||
                v >
                  regent.baseAttributes[k as keyof typeof BASE_ATTRIBUTES]) ? (
                <>
                  <button
                    className="ml-2 px-2 bg-[var(--button-secondary)] text-[var(--button-secondary-text)] rounded"
                    onClick={() =>
                      updateAttribute(k as keyof typeof BASE_ATTRIBUTES, -1)
                    }
                  >
                    -
                  </button>
                  <button
                    className="px-2 bg-[var(--button-secondary)] text-[var(--button-secondary-text)] rounded"
                    onClick={() =>
                      updateAttribute(k as keyof typeof BASE_ATTRIBUTES, 1)
                    }
                  >
                    +
                  </button>
                </>
              ) : null}
            </li>
          ))}
        </ul>

        {!attributesFinalized &&
          remainingPoints === 0 &&
          (() => {
            const total = 10 + regent.level * 6;
            const used = Object.values(attributes).reduce((a, b) => a + b, 0);
            return used === total ? (
              <button
                className="mt-4 bg-[var(--button-primary)] text-[var(--button-primary-text)] px-4 py-2 rounded hover:bg-[var(--button-primary-hover)]"
                onClick={finalizeAttributes}
              >
                Finalize Attributes
              </button>
            ) : null;
          })()}
      </div>

      {regent.features.length > 0 && (
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
                  className="border border-[var(--input-border)] p-3 rounded bg-[var(--input-bg-soft)] text-text shadow-sm"
                >
                  <p className="font-bold text-lg">{feature.name}</p>
                  <p className="text-sm italic text-[var(--subtle-text)] mb-1">
                    {feature.type} | Cost: {feature.cost}
                  </p>
                  <p className="text-sm">{feature.description}</p>
                  <p className="text-xs mt-2 text-[var(--muted-text)]">
                    Desbloqueada no nível {f.level}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-4">
        <p className="font-semibold">
          XP: {regent.xp} / {xpToLevelUp(regent.level)}
        </p>
        <div className="w-full bg-[var(--xp-bar-bg)] h-4 rounded overflow-hidden">
          <div
            className="h-full bg-[var(--xp-bar-fill)]"
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
        className={`mt-2 px-3 py-1 rounded text-[var(--button-xp-text)] ${
          xpBlocked
            ? "bg-[var(--button-xp-disabled)] cursor-not-allowed"
            : "bg-[var(--button-xp)] hover:bg-[var(--button-xp-hover)]"
        }`}
      >
        Spend Experience
      </button>

      {canLearnNewSkill && (
        <SkillSelection
          currentLevel={pendingFeatureLevels[0] ?? regent.level}
          allLearnedNames={regent.features.map((f) => f.name)}
          onLearn={(skill, className) => {
            setSelectedUnit((prev) => {
              if (!prev || prev.type !== "regent") return prev;
              const updatedClasses = prev.classes.includes(className)
                ? prev.classes
                : [...prev.classes, className];
              return {
                ...prev,
                classes: updatedClasses,
                features: [
                  ...prev.features,
                  {
                    name: skill.name,
                    level: pendingFeatureLevels[0] ?? regent.level,
                  },
                ],
              };
            });
            setPendingFeatureLevels((prev) =>
              prev.filter(
                (lvl) => lvl !== (pendingFeatureLevels[0] ?? regent.level)
              )
            );
          }}
        />
      )}
    </div>
  );
}
