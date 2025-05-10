export type ClassType = "Physical" | "Magical" | "Hybrid";
export type SkillType = "Passive" | "Active" | "Reactive";
export type SkillCost = "Low" | "Medium" | "High" | "None";
export type Range = "Adjacent" | "Short" | "Medium" | "Long";

export interface Skill {
  name: string;
  type: SkillType;
  cost: SkillCost;
  description: string;
  range?: Range;
}

export interface Class {
  name: string;
  type: ClassType;
  skills: Skill[];
}

export const CLASSES: Class[] = [
  {
    name: "Monk",
    type: "Physical",
    skills: [
      {
        name: "Panda Style",
        type: "Reactive",
        cost: "Low",
        description:
          "If you don’t move during your turn, you assume this Style. The next time you take damage to your Vitality, you reflect half that damage back to the attacker.",
      },
      {
        name: "Tiger Style",
        type: "Reactive",
        cost: "Low",
        description:
          "If you don’t move during your turn, you assume this Style. You gain the 'Attacker' troop trait on your next attack and deal +1 damage on any roll of 6.",
      },
      {
        name: "Dragon Style",
        type: "Reactive",
        cost: "Medium",
        description:
          "If you don’t move during your turn, you assume this Style. Your next attack uses both Combat and Accuracy attributes.",
      },
    ],
  },
  {
    name: "Barbarian",
    type: "Physical",
    skills: [
      {
        name: "Savage Rage",
        type: "Passive",
        cost: "None",
        description:
          "All damage you take is reduced by 1 and your attacks always hit at least twice. These values double if you have no Protection.",
      },
      {
        name: "Reckless Assault",
        type: "Passive",
        cost: "None",
        description:
          "While you have no Protection, you may attack twice when using the Attack Action.",
      },
      {
        name: "Total Destruction",
        type: "Active",
        cost: "Low",
        range: "Adjacent",
        description:
          "Choose an adjacent Unit and select a damage value from 1 to your Combat. You automatically deal that much Physical damage to the target and take the same amount yourself.",
      },
    ],
  },
  {
    name: "Warrior",
    type: "Physical",
    skills: [
      {
        name: "Extra Attack",
        type: "Passive",
        cost: "None",
        description:
          "When you use the Attack Action, you can make one additional attack.",
      },
      {
        name: "Natural Strategist",
        type: "Reactive",
        cost: "Low",
        description:
          "If you fail a Contested Test you initiated, you may instantly succeed instead.",
      },
      {
        name: "Action Surge",
        type: "Active",
        cost: "Medium",
        description:
          "You gain one additional action on your turn. Using this skill does not consume an action.",
      },
    ],
  },
];
