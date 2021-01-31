/**
 * Compare day, month and year
 * @param {Date} date1 date
 * @param {Date} date2 date
 * @returns true if they are the sema day
 */
export const isSameDay = (date1, date2) => {
  const date1String = `${date1.getDate()}/${
    date1.getMonth() + 1
  }/${date1.getFullYear()}`;

  const date2String = `${date2.getDate()}/${
    date2.getMonth() + 1
  }/${date2.getFullYear()}`;

  return date1String === date2String;
};
