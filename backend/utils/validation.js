// Email validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Date validation (YYYY-MM-DD format)
  const isValidDate = (dateString) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };
  
  // State code validation (2 letters)
  const isValidStateCode = (state) => {
    const stateRegex = /^[A-Z]{2}$/i;
    return stateRegex.test(state);
  };
  
  // Check if end date is after start date
  const isEndDateAfterStartDate = (startDate, endDate) => {
    return new Date(endDate) > new Date(startDate);
  };
  
  // Calculate number of nights between dates
  const calculateNights = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  module.exports = {
    isValidEmail,
    isValidDate,
    isValidStateCode,
    isEndDateAfterStartDate,
    calculateNights
  };