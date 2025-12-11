// Echo Stats Data - Stat ranges and labels

export const combatStats = {
  label: {
    None: 'None',
    ATK: 'ATK',
    'ATK%': 'ATK%',
    HP: 'HP',
    'HP%': 'HP%',
    DEF: 'DEF',
    'DEF%': 'DEF%',
    CritRate: 'Crit. Rate',
    CritDMG: 'Crit. DMG',
    EnergyRegen: 'Energy Regen',
    BasicAttackDMGBonus: 'Basic Attack',
    HeavyAttackDMGBonus: 'Heavy Attack',
    ResonanceSkillDMGBonus: 'Resonance Skill',
    ResonanceLiberationDMGBonus: 'Resonance Liberation',
  },
  icon: {
    None: 'none',
    HP: 'hp',
    ATK: 'atk',
    DEF: 'def',
    'ATK%': 'atk',
    'HP%': 'hp',
    'DEF%': 'def',
    CritRate: 'crit_r',
    CritDMG: 'crit_d',
    EnergyRegen: 'energy',
    BasicAttackDMGBonus: 'dmg_basic',
    HeavyAttackDMGBonus: 'dmg_heavy',
    ResonanceSkillDMGBonus: 'dmg_res',
    ResonanceLiberationDMGBonus: 'dmg_lib',
  },
};

// Sub-stat ranges for tier calculation
export const statRanges: Record<string, Record<number, number>> = {
  None: {
    1: 0,
    8: 0,
  },
  ATK: {
    1: 30,
    3: 40,
    6: 50,
    8: 60,
  },
  'ATK%': {
    1: 6.4,
    2: 7.1,
    3: 7.9,
    4: 8.6,
    5: 9.4,
    6: 10.1,
    7: 10.9,
    8: 11.6,
  },
  HP: {
    1: 320,
    2: 360,
    3: 390,
    4: 430,
    5: 470,
    6: 510,
    7: 540,
    8: 580,
  },
  'HP%': {
    1: 6.4,
    2: 7.1,
    3: 7.9,
    4: 8.6,
    5: 9.4,
    6: 10.1,
    7: 10.9,
    8: 11.6,
  },
  DEF: {
    1: 40,
    3: 50,
    6: 60,
    8: 70,
  },
  'DEF%': {
    1: 8.1,
    2: 9,
    3: 10,
    4: 10.9,
    5: 11.9,
    6: 12.8,
    7: 13.8,
    8: 14.7,
  },
  CritRate: {
    1: 6.3,
    2: 6.9,
    3: 7.5,
    4: 8.1,
    5: 8.7,
    6: 9.3,
    7: 9.9,
    8: 10.5,
  },
  CritDMG: {
    1: 12.6,
    2: 13.8,
    3: 15,
    4: 16.2,
    5: 17.4,
    6: 18.6,
    7: 19.8,
    8: 21,
  },
  EnergyRegen: {
    1: 6.8,
    2: 7.6,
    3: 8.4,
    4: 9.2,
    5: 10,
    6: 10.8,
    7: 11.6,
    8: 12.4,
  },
  BasicAttackDMGBonus: {
    1: 6.4,
    2: 7.1,
    3: 7.9,
    4: 8.6,
    5: 9.4,
    6: 10.1,
    7: 10.9,
    8: 11.6,
  },
  HeavyAttackDMGBonus: {
    1: 6.4,
    2: 7.1,
    3: 7.9,
    4: 8.6,
    5: 9.4,
    6: 10.1,
    7: 10.9,
    8: 11.6,
  },
  ResonanceSkillDMGBonus: {
    1: 6.4,
    2: 7.1,
    3: 7.9,
    4: 8.6,
    5: 9.4,
    6: 10.1,
    7: 10.9,
    8: 11.6,
  },
  ResonanceLiberationDMGBonus: {
    1: 6.4,
    2: 7.1,
    3: 7.9,
    4: 8.6,
    5: 9.4,
    6: 10.1,
    7: 10.9,
    8: 11.6,
  },
};

// Helper function to determine tier based on value
export function getTier(statName: string, value: number): number {
  const ranges = statRanges[statName];
  if (!ranges) return 1;

  let tier = 1;
  for (let i = 1; i <= 8; i++) {
    if (ranges[i] !== undefined && value >= ranges[i]) {
      tier = i;
    }
  }
  return tier;
}

// Helper function to calculate percentage for progress bar
export function getStatPercentage(statName: string, value: number): number {
  const ranges = statRanges[statName];
  if (!ranges) return 0;

  const min = ranges[1] || 0;
  const max = ranges[8] || 100;

  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}
