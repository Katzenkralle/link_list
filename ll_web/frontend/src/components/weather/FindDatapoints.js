export const calculateForecastDate = (currentDate, daysAhead) => {
    // Convert the currentDate from YYYYMMDD to a Date object
    let dateObj = new Date(
        currentDate.toString().substring(0, 4), // Year
        parseInt(currentDate.toString().substring(4, 6)) - 1, // Month (0-based)
        currentDate.toString().substring(6, 8) // Day
    );

    // Calculate the forecast date by adding daysAhead
    dateObj.setDate(dateObj.getDate() + daysAhead);

    // Format the forecast date as YYYYMMDD
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
    let day = dateObj.getDate().toString().padStart(2, '0');

    return `${year}${month}${day}`;
}

// Helper function to calculate the backcast date
export const calculateBackcastDate = (currentDate, daysBehind) => {
    // Convert the currentDate from YYYYMMDD to a Date object
    let dateObj = new Date(
        currentDate.toString().substring(0, 4), // Year
        parseInt(currentDate.toString().substring(4, 6)) - 1, // Month (0-based)
        currentDate.toString().substring(6, 8) // Day
    );

    // Calculate the backcast date by subtracting daysBehind
    dateObj.setDate(dateObj.getDate() - daysBehind);

    // Format the backcast date as YYYYMMDD
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
    let day = dateObj.getDate().toString().padStart(2, '0');

    return `${year}${month}${day}`;
}

export const findNearestDataPoints = (targetDate, targetTime, dataset) => {
    // Sort the dataset by the absolute date difference from the target date
    dataset.sort((a, b) => {
        const dateDiffA = Math.abs(a.date - targetDate);
        const dateDiffB = Math.abs(b.date - targetDate);

        if (dateDiffA !== dateDiffB) {
            // If date differences are not equal, prioritize date
            return dateDiffA - dateDiffB;
        } else {
            // If date differences are equal, prioritize time
            const timeDiffA = Math.abs(a.time - targetTime);
            const timeDiffB = Math.abs(b.time - targetTime);
            return timeDiffA - timeDiffB;
        }
    });

    // The first element of the sorted dataset will be the nearest data point
    const nearestDataPoint = dataset[0];

    return nearestDataPoint;
};
