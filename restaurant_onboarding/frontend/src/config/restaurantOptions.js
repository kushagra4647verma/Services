// Restaurant configuration options
// Cuisine and Amenity options are loaded from text files for easy editing

import cuisineOptionsText from './cuisineOptions.txt?raw'
import amenityOptionsText from './amenityOptions.txt?raw'

// Parse text files into arrays (one option per line)
export const CUISINE_OPTIONS = cuisineOptionsText
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0)

export const AMENITY_OPTIONS = amenityOptionsText
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0)

// Days of the week for opening hours
export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
]

// Default opening hours structure
export const getDefaultOpeningHours = () => {
  return DAYS_OF_WEEK.map(day => ({
    day,
    openTime: "09:00",
    closeTime: "22:00",
    isClosed: false
  }))
}
