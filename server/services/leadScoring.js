function scoreLead({ budget, rooms = [], timeline, carpetArea, propertyType }) {
  let score = 0;
  const factors = [];

  const budgetNum = Number(budget) || 0;
  if (budgetNum > 1500000) {
    score += 35;
    factors.push('High budget (>15L): +35');
  } else if (budgetNum > 800000) {
    score += 30;
    factors.push('Good budget (>8L): +30');
  } else if (budgetNum > 400000) {
    score += 15;
    factors.push('Moderate budget (>4L): +15');
  } else {
    score += 5;
    factors.push('Low budget: +5');
  }

  const fullHomeRooms = ['Living Room', 'Kitchen', 'Master Bedroom', 'Bedroom'];
  const hasFullHome = fullHomeRooms.every((r) =>
    rooms.some((room) => room.toLowerCase().includes(r.toLowerCase()))
  );
  if (hasFullHome || rooms.length >= 4) {
    score += 20;
    factors.push('Full home design: +20');
  } else if (rooms.length >= 2) {
    score += 10;
    factors.push('Multiple rooms: +10');
  } else {
    score += 5;
    factors.push('Single room: +5');
  }

  const timelineStr = String(timeline || '').toLowerCase();
  if (
    timelineStr.includes('immediate') ||
    timelineStr.includes('1 month') ||
    timelineStr.includes('asap') ||
    timelineStr.includes('< 3 months') ||
    timelineStr.includes('within 3 months') ||
    timelineStr.includes('1-3 months')
  ) {
    score += 20;
    factors.push('Urgent timeline (<3 months): +20');
  } else if (
    timelineStr.includes('3-6') ||
    timelineStr.includes('6 months')
  ) {
    score += 10;
    factors.push('Medium timeline (3-6 months): +10');
  } else {
    score += 5;
    factors.push('Flexible timeline: +5');
  }

  const areaNum = Number(carpetArea) || 0;
  if (areaNum > 2000) {
    score += 20;
    factors.push('Large area (>2000 sqft): +20');
  } else if (areaNum > 1000) {
    score += 15;
    factors.push('Good area (>1000 sqft): +15');
  } else if (areaNum > 500) {
    score += 10;
    factors.push('Medium area (>500 sqft): +10');
  } else {
    score += 5;
    factors.push('Small area: +5');
  }

  const premiumTypes = ['Villa', 'Penthouse', '4BHK', '3BHK'];
  if (premiumTypes.includes(propertyType)) {
    score += 5;
    factors.push('Premium property type: +5');
  }

  score = Math.min(score, 100);

  let leadCategory;
  if (score >= 70) {
    leadCategory = 'High';
  } else if (score >= 40) {
    leadCategory = 'Medium';
  } else {
    leadCategory = 'Low';
  }

  return {
    leadScore: score,
    leadCategory,
    factors,
  };
}

module.exports = { scoreLead };
