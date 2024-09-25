export const formatDate = (date: string) => {
    const chicagoDate = new Date(`${date}T12:00:00-06:00`);
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(chicagoDate);
};

export const formatChartDate = (date: string) => {
    const chicagoDate = new Date(`${date}T12:00:00-06:00`);
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        month: 'short',
        day: 'numeric'
    }).format(chicagoDate);
};
