// Utility function to safely render participant information
export const formatParticipants = (participants) => {
  if (!participants) return '0';
  
  // If it's already a number or string, return it
  if (typeof participants === 'number' || typeof participants === 'string') {
    return participants.toString();
  }
  
  // If it's an object with participant details
  if (typeof participants === 'object') {
    const { actual, planned, male, female } = participants;
    
    // If we have actual/planned numbers
    if (actual !== undefined && planned !== undefined) {
      return `${actual}/${planned}`;
    }
    
    // If we have male/female breakdown
    if (male !== undefined && female !== undefined) {
      return `${male + female} (${male}M/${female}F)`;
    }
    
    // If we have just one of the numbers
    if (actual !== undefined) return actual.toString();
    if (planned !== undefined) return planned.toString();
    
    // Fallback to total count if available
    const total = (male || 0) + (female || 0);
    if (total > 0) return total.toString();
  }
  
  return '0';
};

// Utility function to get numeric participant count
export const getParticipantCount = (participants) => {
  if (!participants) return 0;
  
  if (typeof participants === 'number') return participants;
  if (typeof participants === 'string') return parseInt(participants) || 0;
  
  if (typeof participants === 'object') {
    const { actual, planned, male, female } = participants;
    
    // Priority: actual > planned > total of male/female
    if (actual !== undefined) return actual;
    if (planned !== undefined) return planned;
    
    const total = (male || 0) + (female || 0);
    return total;
  }
  
  return 0;
};

// Safe object renderer - prevents React from trying to render objects
export const safeRender = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value.toString();
};