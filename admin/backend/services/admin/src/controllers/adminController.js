import { supabase } from "../db.js"

/**
 * Parse PostGIS WKB hex format to {lat, lng}
 */
function parseWkbHexToLatLng(wkbHex) {
  if (!wkbHex || typeof wkbHex !== 'string') return null
  
  try {
    const coordsHex = wkbHex.substring(18)
    if (coordsHex.length < 32) return null
    
    const lngHex = coordsHex.substring(0, 16)
    const latHex = coordsHex.substring(16, 32)
    
    const lng = parseHexToDouble(lngHex)
    const lat = parseHexToDouble(latHex)
    
    if (isNaN(lat) || isNaN(lng)) return null
    
    return { lat, lng }
  } catch (e) {
    console.error("Error parsing WKB:", e)
    return null
  }
}

function parseHexToDouble(hex) {
  const bytes = []
  for (let i = 0; i < 16; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16))
  }
  
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  bytes.forEach((b, i) => view.setUint8(i, b))
  
  return view.getFloat64(0, true)
}

function transformRestaurant(restaurant) {
  if (!restaurant) return restaurant
  
  if (restaurant.location && typeof restaurant.location === 'string') {
    restaurant.location = parseWkbHexToLatLng(restaurant.location)
  }
  
  return restaurant
}

/**
 * GET /restaurants - Get all restaurants (admin view)
 */
export async function getAllRestaurants(req, res) {
  try {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("createdAt", { ascending: false })

    if (error) throw error
    
    const restaurants = (data || []).map(transformRestaurant)
    res.json(restaurants)
  } catch (err) {
    console.error("getAllRestaurants error:", err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * GET /restaurants/:restaurantId - Get single restaurant
 */
export async function getRestaurantById(req, res) {
  try {
    const { restaurantId } = req.params

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", restaurantId)
      .single()

    if (error) throw error
    
    res.json(transformRestaurant(data))
  } catch (err) {
    console.error("getRestaurantById error:", err)
    res.status(404).json({ error: err.message })
  }
}

/**
 * GET /restaurants/:restaurantId/legal - Get restaurant legal info
 */
export async function getRestaurantLegal(req, res) {
  try {
    const { restaurantId } = req.params

    const { data, error } = await supabase
      .from("restaurantLegalInfo")
      .select("*")
      .eq("restaurantid", restaurantId)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    res.json(data ?? {})
  } catch (err) {
    console.error("getRestaurantLegal error:", err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * GET /restaurants/:restaurantId/bank - Get restaurant bank details
 */
export async function getRestaurantBank(req, res) {
  try {
    const { restaurantId } = req.params

    const { data, error } = await supabase
      .from("restaurantBankDetails")
      .select("*")
      .eq("restaurantId", restaurantId)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    res.json(data ?? {})
  } catch (err) {
    console.error("getRestaurantBank error:", err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * GET /restaurants/:restaurantId/beverages - Get all beverages for restaurant
 */
export async function getRestaurantBeverages(req, res) {
  try {
    const { restaurantId } = req.params

    const { data, error } = await supabase
      .from("beverages")
      .select("*")
      .eq("restaurantid", restaurantId)

    if (error) throw error
    
    res.json(data || [])
  } catch (err) {
    console.error("getRestaurantBeverages error:", err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * GET /restaurants/:restaurantId/events - Get all events for restaurant
 */
export async function getRestaurantEvents(req, res) {
  try {
    const { restaurantId } = req.params

    const { data, error } = await supabase
      .from("restaurantEvents")
      .select("*")
      .eq("restaurantid", restaurantId)

    if (error) throw error
    
    res.json(data || [])
  } catch (err) {
    console.error("getRestaurantEvents error:", err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * GET /beverages/:beverageId - Get single beverage
 */
export async function getBeverageById(req, res) {
  try {
    const { beverageId } = req.params

    const { data, error } = await supabase
      .from("beverages")
      .select("*")
      .eq("id", beverageId)
      .single()

    if (error) throw error
    
    res.json(data)
  } catch (err) {
    console.error("getBeverageById error:", err)
    res.status(404).json({ error: err.message })
  }
}

/**
 * GET /events/:eventId - Get single event
 */
export async function getEventById(req, res) {
  try {
    const { eventId } = req.params

    const { data, error } = await supabase
      .from("restaurantEvents")
      .select("*")
      .eq("id", eventId)
      .single()

    if (error) throw error
    
    res.json(data)
  } catch (err) {
    console.error("getEventById error:", err)
    res.status(404).json({ error: err.message })
  }
}

/**
 * PATCH /restaurants/:restaurantId/verify - Update restaurant verification status
 */
export async function updateRestaurantVerification(req, res) {
  try {
    const { restaurantId } = req.params
    const { isVerified } = req.body

    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({ error: 'isVerified must be a boolean' })
    }

    const { data, error } = await supabase
      .from("restaurants")
      .update({ isVerified })
      .eq("id", restaurantId)
      .select()
      .single()

    if (error) throw error
    
    console.log(`Restaurant ${restaurantId} verification status updated to: ${isVerified}`)
    res.json(transformRestaurant(data))
  } catch (err) {
    console.error("updateRestaurantVerification error:", err)
    res.status(500).json({ error: err.message })
  }
}
