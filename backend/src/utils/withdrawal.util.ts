/**
 * Withdrawal utility functions
 * Handles time window restrictions for withdrawals based on GMT+7 timezone
 */

export interface WithdrawalTimeStatus {
  isEnabled: boolean;
  message: string;
  nextEnabledTime?: string;
  nextDisabledTime?: string;
}

/**
 * Check if withdrawals are currently allowed based on GMT+7 timezone
 * Enabled: 06:01 AM - 12:00 PM GMT+7
 * Disabled: 12:01 PM - 06:00 AM GMT+7 (next day)
 */
export const checkWithdrawalTimeWindow = (): WithdrawalTimeStatus => {
  // Get current time in GMT+7 (Bangkok/Jakarta time)
  const now = new Date();
  const gmt7Offset = 7 * 60; // GMT+7 in minutes
  const localOffset = now.getTimezoneOffset(); // Local timezone offset in minutes (negative for east of UTC)
  const totalOffset = gmt7Offset + localOffset;
  
  // Adjust to GMT+7
  const gmt7Time = new Date(now.getTime() + totalOffset * 60 * 1000);
  
  const hours = gmt7Time.getHours();
  const minutes = gmt7Time.getMinutes();
  const currentTimeInMinutes = hours * 60 + minutes;
  
  // Time windows in minutes from midnight
  const enabledStart = 6 * 60 + 1; // 06:01 AM
  const enabledEnd = 12 * 60; // 12:00 PM
  const disabledStart = 12 * 60 + 1; // 12:01 PM
  const disabledEnd = 6 * 60; // 06:00 AM (next day)
  
  // Check if current time is in enabled window (06:01 AM - 12:00 PM)
  const isEnabled = currentTimeInMinutes >= enabledStart && currentTimeInMinutes <= enabledEnd;
  
  if (isEnabled) {
    // Calculate next disabled time (12:01 PM today)
    const nextDisabled = new Date(gmt7Time);
    nextDisabled.setHours(12, 1, 0, 0);
    
    return {
      isEnabled: true,
      message: 'Withdrawals are currently enabled',
      nextDisabledTime: nextDisabled.toISOString(),
    };
  } else {
    // Calculate next enabled time (06:01 AM)
    const nextEnabled = new Date(gmt7Time);
    
    if (currentTimeInMinutes > enabledEnd) {
      // After 12:00 PM, next enabled is tomorrow 06:01 AM
      nextEnabled.setDate(nextEnabled.getDate() + 1);
    }
    nextEnabled.setHours(6, 1, 0, 0);
    
    return {
      isEnabled: false,
      message: 'Withdrawals are currently disabled. Please try again during enabled hours (06:01 AM - 12:00 PM GMT+7)',
      nextEnabledTime: nextEnabled.toISOString(),
    };
  }
};

/**
 * Format time for user display in GMT+7
 */
export const formatGMT7Time = (date: Date): string => {
  const gmt7Offset = 7 * 60;
  const localOffset = date.getTimezoneOffset();
  const totalOffset = gmt7Offset + localOffset;
  
  const gmt7Time = new Date(date.getTime() + totalOffset * 60 * 1000);
  
  const hours = gmt7Time.getHours().toString().padStart(2, '0');
  const minutes = gmt7Time.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes} GMT+7`;
};
