/**
 * Birthday-based personalization engine for SYNTHAI
 * Calculates zodiac sign, life path number, and personalization theme
 */

export interface PersonalizationData {
  zodiacSign: string;
  zodiacSymbol: string;
  lifePathNumber: number;
  personalityTheme: string;
  personalityDescription: string;
  luckyColor: string;
  luckyNumber: number;
}

// Zodiac signs with date ranges
const ZODIAC_SIGNS = [
  { name: 'Capricorn', symbol: '♑', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: 'Aquarius', symbol: '♒', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: 'Pisces', symbol: '♓', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  { name: 'Aries', symbol: '♈', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: 'Taurus', symbol: '♉', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: 'Gemini', symbol: '♊', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { name: 'Cancer', symbol: '♋', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { name: 'Leo', symbol: '♌', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: 'Virgo', symbol: '♍', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: 'Libra', symbol: '♎', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { name: 'Scorpio', symbol: '♏', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { name: 'Sagittarius', symbol: '♐', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
];

// Zodiac traits and themes
const ZODIAC_TRAITS: Record<string, { description: string; luckyColor: string; luckyNumber: number }> = {
  'Capricorn': { description: 'Ambitious, disciplined, and practical', luckyColor: '#2D3436', luckyNumber: 3 },
  'Aquarius': { description: 'Innovative, independent, and humanitarian', luckyColor: '#0984E3', luckyNumber: 4 },
  'Pisces': { description: 'Compassionate, artistic, and intuitive', luckyColor: '#6C5CE7', luckyNumber: 7 },
  'Aries': { description: 'Courageous, determined, and energetic', luckyColor: '#D63031', luckyNumber: 1 },
  'Taurus': { description: 'Reliable, practical, and sensual', luckyColor: '#27AE60', luckyNumber: 6 },
  'Gemini': { description: 'Curious, adaptable, and communicative', luckyColor: '#F39C12', luckyNumber: 5 },
  'Cancer': { description: 'Nurturing, protective, and emotional', luckyColor: '#1ABC9C', luckyNumber: 2 },
  'Leo': { description: 'Confident, creative, and generous', luckyColor: '#F1C40F', luckyNumber: 1 },
  'Virgo': { description: 'Analytical, practical, and detail-oriented', luckyColor: '#95A5A6', luckyNumber: 5 },
  'Libra': { description: 'Diplomatic, fair-minded, and artistic', luckyColor: '#E8DAEF', luckyNumber: 6 },
  'Scorpio': { description: 'Passionate, mysterious, and determined', luckyColor: '#8B0000', luckyNumber: 8 },
  'Sagittarius': { description: 'Optimistic, adventurous, and philosophical', luckyColor: '#9B59B6', luckyNumber: 9 },
};

/**
 * Calculate zodiac sign from birth date
 */
export function getZodiacSign(month: number, day: number): { name: string; symbol: string } {
  for (const sign of ZODIAC_SIGNS) {
    if (
      (month === sign.startMonth && day >= sign.startDay) ||
      (month === sign.endMonth && day <= sign.endDay)
    ) {
      return { name: sign.name, symbol: sign.symbol };
    }
  }
  // Default to Capricorn if not found
  return { name: 'Capricorn', symbol: '♑' };
}

/**
 * Calculate life path number using numerology
 * Reduces birth date to single digit (1-9)
 */
export function getLifePathNumber(year: number, month: number, day: number): number {
  const sumDigits = (num: number): number => {
    return num
      .toString()
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit), 0);
  };

  let total = sumDigits(year) + sumDigits(month) + sumDigits(day);
  
  // Keep reducing until single digit (except 11, 22, 33 which are master numbers)
  while (total >= 10 && total !== 11 && total !== 22 && total !== 33) {
    total = sumDigits(total);
  }

  return total;
}

/**
 * Get personalization theme color based on life path number
 */
export function getThemeFromLifePath(lifePathNumber: number): string {
  const themes: Record<number, string> = {
    1: 'from-red-500 to-orange-500',
    2: 'from-blue-500 to-cyan-500',
    3: 'from-yellow-500 to-amber-500',
    4: 'from-green-500 to-emerald-500',
    5: 'from-purple-500 to-pink-500',
    6: 'from-pink-500 to-rose-500',
    7: 'from-indigo-500 to-blue-500',
    8: 'from-gray-500 to-slate-500',
    9: 'from-violet-500 to-purple-500',
    11: 'from-blue-600 to-purple-600',
    22: 'from-green-600 to-teal-600',
    33: 'from-pink-600 to-red-600',
  };

  return themes[lifePathNumber] || themes[1];
}

/**
 * Generate complete personalization data from birth information
 */
export function generatePersonalizationData(
  birthDate: Date,
  birthTime?: string
): PersonalizationData {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const year = birthDate.getFullYear();

  const zodiac = getZodiacSign(month, day);
  const lifePathNumber = getLifePathNumber(year, month, day);
  const theme = getThemeFromLifePath(lifePathNumber);
  const traits = ZODIAC_TRAITS[zodiac.name] || ZODIAC_TRAITS['Capricorn'];

  return {
    zodiacSign: zodiac.name,
    zodiacSymbol: zodiac.symbol,
    lifePathNumber,
    personalityTheme: theme,
    personalityDescription: traits.description,
    luckyColor: traits.luckyColor,
    luckyNumber: traits.luckyNumber,
  };
}

/**
 * Generate personalized greeting based on birth data
 */
export function generatePersonalizedGreeting(
  name: string,
  zodiacSign: string,
  lifePathNumber: number
): string {
  const greetings = [
    `Welcome, ${name}! Your ${zodiacSign} energy is radiating today.`,
    `Hello, ${name}! Your life path number ${lifePathNumber} guides your journey.`,
    `Greetings, ${name}! Let's harness your ${zodiacSign} strengths today.`,
    `Welcome back, ${name}! Your cosmic energy is aligned with your goals.`,
    `Hello, ${name}! Your numerology suggests a day of great potential.`,
  ];

  return greetings[Math.floor(Math.random() * greetings.length)];
}

/**
 * Generate AI system prompt customization based on birth data
 */
export function generatePersonalizedSystemPrompt(personalization: PersonalizationData): string {
  return `You are SYNTHAI, a personal AI agent customized for a ${personalization.zodiacSign} user with life path number ${personalization.lifePathNumber}.

Key personality traits: ${personalization.personalityDescription}

Adapt your communication style to be:
- Aligned with their ${personalization.zodiacSign} energy (${personalization.personalityDescription})
- Respectful of their numerological life path (${personalization.lifePathNumber})
- Encouraging and supportive of their unique strengths
- Mindful of their lucky number (${personalization.luckyNumber}) when suggesting timing or quantities

Help them track projects, follow up on commitments, and achieve their goals in a way that resonates with their astrological and numerological profile.`;
}
