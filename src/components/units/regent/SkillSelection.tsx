import { CLASSES, type Skill, type Class } from "../../../data/classes";
import { useUnit } from "../../../contexts/UnitContext";
import { useMemo } from "react";

interface SkillSelectionProps {
  currentLevel: number;
  allLearnedNames: string[];
  onLearn: (skill: Skill, className: string) => void;
}

export default function SkillSelection({
  allLearnedNames,
  onLearn,
}: SkillSelectionProps) {
  const { selectedUnit } = useUnit();
  if (!selectedUnit || selectedUnit.type !== "regent") return null;

  const regent = selectedUnit;

  const availableClasses = useMemo(() => {
    const remainingSkillsByClass = CLASSES.filter((cls) =>
      regent.classes.includes(cls.name)
    ).map((cls) => ({
      cls,
      remaining: cls.skills.filter((s) => !allLearnedNames.includes(s.name)),
    }));

    const hasRemaining = remainingSkillsByClass.some(
      (r) => r.remaining.length > 0
    );

    if (hasRemaining) {
      return remainingSkillsByClass
        .filter((r) => r.remaining.length > 0)
        .map((r) => r.cls);
    }

    return CLASSES.filter((cls) => !regent.classes.includes(cls.name));
  }, [regent.classes, allLearnedNames]);

  return (
    <div className="mt-6 space-y-2">
      <p className="font-semibold text-lg">Escolha uma nova habilidade:</p>

      {availableClasses.map((cls: Class) => (
        <div key={cls.name}>
          <p className="font-bold text-[var(--text-highlight)]">{cls.name}</p>
          <div className="space-y-2">
            {cls.skills
              .filter((skill) => !allLearnedNames.includes(skill.name))
              .map((skill) => (
                <div
                  key={skill.name}
                  className="border border-[var(--input-border)] p-3 rounded bg-[var(--input-bg-soft)] hover:bg-[var(--input-bg-hover)] text-text cursor-pointer"
                  onClick={() => onLearn(skill, cls.name)}
                >
                  <p className="font-bold">{skill.name}</p>
                  <p className="text-sm italic text-[var(--subtle-text)]">
                    {skill.type} | Cost: {skill.cost}
                  </p>
                  <p className="text-sm">{skill.description}</p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
