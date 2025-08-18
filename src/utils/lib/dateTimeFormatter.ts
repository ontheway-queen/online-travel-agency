import CustomError from "./customError";

export const dateTimeFormatter = (date: string | Date, time: string) => {
  const dateObject = new Date(date);
  const timeComponents = time.match(/(\d{2}:\d{2}:\d{2})/);

  if (dateObject && timeComponents) {
    const [hours, minutes, seconds] = timeComponents[1].split(':');

    dateObject.setUTCHours(Number(hours), Number(minutes), Number(seconds));

    const formattedDateTimeString = dateObject.toISOString().slice(0, 19);

    return formattedDateTimeString;
  } else {
    throw new CustomError('Invalid date or time format', 400);
  }
};

  export const convertDateTime = (dateStr: string | Date, timeStr: string) => {
  const dateParts = String(dateStr).split('T')[0].split('-');

  //zero-padding for month and day
  const year = dateParts[0];
  const month = dateParts[1].padStart(2, '0');
  const day = dateParts[2].padStart(2, '0');

  const time = timeStr.slice(0, 8);

  const dateTime = `${year}-${month}-${day}T${time}`;

  return dateTime;
};
