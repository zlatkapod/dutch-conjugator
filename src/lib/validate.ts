/**
 * Normalizes a string by trimming whitespace and replacing multiple spaces with a single space.
 */
export const normalize = (str: string): string => {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
};

/**
 * Validates an answer against the correct forms.
 * Correct forms can be a single string or multiple alternatives separated by '|'.
 */
export const validateAnswer = (userAnswer: string, correctForms: string): boolean => {
  const normalizedUser = normalize(userAnswer);
  const alternatives = correctForms.split('|').map(normalize);
  return alternatives.includes(normalizedUser);
};
