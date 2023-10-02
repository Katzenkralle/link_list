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

export const ZipFindExtremeValues = (dataset, datasetb, entry, date) => {
    const getValueByPath = (obj, path) => {
        const pathArray = path.split(".");
        let value = obj;
        for (let i = 0; i < pathArray.length; i++) {
            value = value[pathArray[i]];
        };
        return value;
    }
    let average = [0, 0];
    let highest = Number.NEGATIVE_INFINITY; // Initialize with the lowest possible value
    let lowest = Number.POSITIVE_INFINITY; // Initialize with the highest possible value
    for (let i = 0; i < dataset.length; i++) {
        if (dataset[i].date.toString() == date) {
            let value = getValueByPath(datasetb[i], entry);
            if (value > highest) {
                highest = value;
            }
            if (value < lowest) {
                lowest = value;
            }
            average[0] += value;
            average[1] += 1;
            
        }
    }
    return [highest, lowest, (average[0]/average[1])];

}

export const colorByTemp = (temp) => {
    temp += 15 //to set refrenzpoint to 0

    if (temp < 0) {
        temp = 0;
    }
    const tempRef = temp * 17; //to get the scope of 1024
    temp *= 4.25 //to get the scope of 255
    let r = undefined
    let g = undefined
    let b = undefined

    if (tempRef < 255) {
        r = 0
        g = temp;
        b = 255;
        
    } else if (tempRef < 510) {
        r = 0
        g = 255;
        b = 255 -temp;
        
    } else if (tempRef < 767){
        r = temp;
        g = 255;
        b = 0;
    

    } else if (767 < tempRef) {
        r  = 255;
        g = 255 - tempRef;
        b = 0;
    }

    return `rgb(${r}, ${g}, ${b})`
    }

    
export const strToDate = (new_date) => {
        new_date = new_date.toString();
        const year = new_date.slice(0, 4);
        const month = new_date.slice(4, 6) - 1; // Months are zero-based (0 = January)
        const day = new_date.slice(6, 8);
        return new Date(year, month, day);
    }

export const dateToString = (new_date) => {
        const year = new_date.getFullYear();
        const month = (new_date.getMonth() + 1).toString().padStart(2, '0'); // Add 1 and pad with leading zero if needed
        const day = new_date.getDate().toString().padStart(2, '0'); // Pad with leading zero if needed
        return `${year}${month}${day}`;
    }
