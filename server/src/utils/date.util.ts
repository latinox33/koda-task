export function getNextFriday(date: Date | string): string {
    const dateToFormat = new Date(date);
    const daysUntilFriday = (5 - dateToFormat.getDay() + 7) % 7 || 7;
    const nextFriday = new Date(dateToFormat.setDate(dateToFormat.getDate() + daysUntilFriday));

    const year = nextFriday.getFullYear();
    const month = `${nextFriday.getMonth() + 1}`.padStart(2, '0');
    const day = `${nextFriday.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function getNextSunday(date: Date | string): string {
    const nextSunday = new Date(date);
    nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7));

    const year = nextSunday.getFullYear();
    const month = `${nextSunday.getMonth() + 1}`.padStart(2, '0');
    const day = `${nextSunday.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
}
