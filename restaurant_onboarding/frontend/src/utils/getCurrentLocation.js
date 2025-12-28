export function getCurrentLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      },
      () => resolve(null), // ❗ never block
      { enableHighAccuracy: true, timeout: 5000 }
    )
  })
}
