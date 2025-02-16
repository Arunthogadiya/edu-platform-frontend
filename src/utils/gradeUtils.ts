export interface GradeCalculation {
  average: number;
  trend: 'up' | 'down' | 'stable';
  letterGrade: string;
}

export const calculateGradeStats = (scores: number[]): GradeCalculation => {
  if (!scores || scores.length === 0) {
    return {
      average: 0,
      trend: 'stable',
      letterGrade: 'N/A'
    };
  }

  const average = scores.reduce((acc, score) => acc + score, 0) / scores.length;
  
  // Calculate trend based on last two scores if available
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (scores.length >= 2) {
    const lastScore = scores[scores.length - 1];
    const previousScore = scores[scores.length - 2];
    if (lastScore > previousScore) trend = 'up';
    else if (lastScore < previousScore) trend = 'down';
  }

  // Convert to letter grade
  const letterGrade = getLetterGrade(average);

  return {
    average,
    trend,
    letterGrade
  };
};

const getLetterGrade = (score: number): string => {
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
};