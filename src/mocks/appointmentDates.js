const today = new Date();

/**
 * compute the next 6 days
 */
export const computeAppointmentDates = () => {
  let dates = [];
  for (let index = 0; index < 6; index++) {
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + index);

    dates.push(nextDate);
  }

  return dates;
};
