export const calculateForecastDate = (currentDate, daysAhead) => {
    // Helper function to calculate the forecast date, meaning currentDate + daysAhead
    // Returns a string in the format YYYYMMDD
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

export const calculateBackcastDate = (currentDate, daysBehind) => {
    // Helper function to calculate the backcast date, meaning currentDate - daysBehind
    // Returns a string in the format YYYYMMDD

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
    // Helper function to find the nearest data points to a target date and time
    // Returns only the nearest data points

    // Sort the dataset by the absolute date difference from the target date   
    dataset.sort((a, b) => {
        const dateDiffA = Math.abs(a.date - targetDate);
        const dateDiffB = Math.abs(b.date - targetDate);// Math.abs() is used to get the absolute value of the difference, always positive

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
    // Helper function to find the highest and lowest value to datasets one used as iterator (must have .date)
    // and the other one used to extract the value from (must have path to value)

    const getValueByPath = (obj, path) => {
        // Helper function to get a value from an object by a path string (e.g. "temperature.value")
        const pathArray = path.split(".");
        let value = obj;
        for (let i = 0; i < pathArray.length; i++) {
            value = value[pathArray[i]];
        };
        return value;
    }
    // Helper function to find the highest and lowest value of a dataset
    let average = [0, 0];
    let highest = Number.NEGATIVE_INFINITY; // Initialize with the lowest possible value
    let lowest = Number.POSITIVE_INFINITY; // Initialize with the highest possible value
    for (let i = 0; i < dataset.length; i++) {
        if (dataset[i].date.toString() == date) {
            // If the date of the current data point matches the target date, get the value of the entry
            // from datasetb and compare it to the current highest and lowest values
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
    // Helper function to color the temperature by value
    // Color changes in range of -15 to 40
    // Returns a string in the format rgb(r, g, b) css ready

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
        // Helper function to convert a string in the format YYYYMMDD to a Date object
        new_date = new_date.toString();
        const year = new_date.slice(0, 4);
        const month = new_date.slice(4, 6) - 1; // Months are zero-based (0 = January)
        const day = new_date.slice(6, 8);
        return new Date(year, month, day);
    }

export const dateToString = (new_date) => {
        // Helper function to convert a Date object to a string in the format YYYYMMDD
        const year = new_date.getFullYear();
        const month = (new_date.getMonth() + 1).toString().padStart(2, '0'); // Add 1 and pad with leading zero if needed
        const day = new_date.getDate().toString().padStart(2, '0'); // Pad with leading zero if needed
        return `${year}${month}${day}`;
    }

export const getSumOfDownfall = (dataset) => {
    let tempRainSum = 0;
      for (let [key, value] of Object.entries(dataset).filter(([key, value]) => key === "rain" || key === "snow")) {
          if (value === null) {
              tempRainSum = null;
              break;
          } else {
              for (let val of Object.values(value)) {
                  if (val === null) {
                      tempRainSum = null;
                      break;
                  } else {
                      tempRainSum += val;
                  }
              }
              if (tempRainSum === null) {
                  break;
              }
          }
        }
        return tempRainSum;
    }

// Function to get the weekday from a date string
export const getWeekdayFromDate = (dateString) => {
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1; // Months are 0-indexed
    const day = parseInt(dateString.substring(6, 8));
  
    // Create a Date object
    const date = new Date(year, month, day);
  
    // Get the numeric day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = date.getDay();
  
    // Array of weekday names
    const weekdays = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
  
    // Return the weekday as a string
    return weekdays[dayOfWeek];
  }