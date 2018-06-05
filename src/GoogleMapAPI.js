/**
*********************************  Maps JavaScript API *********************************
**/
let places, map, bounds, openedInfoWindow
let markers = []
let infoWindows = []

/**
* Get favourite places
*/
export const getPlaces = () =>
fetch(`./places.json`, {
  headers : { "Content-Type": "application/json"}})
  .then(response => response.json())
  .then(data => data.places)
  .catch(error => console.log(`an error occurred ${error}`))

  /**
  * Append script tag of calling the API to body
  */
  export const appendScript = (favPlaces) =>
  {
    // Load script guide from https://www.klaasnotfound.com/2016/11/06/making-google-maps-work-with-react/
    const mapAPIKey = 'AIzaSyAPDzJn7OnZkmLfrlJHaNDheloWYxAZjY0'
    places = favPlaces
    window.loadMap = loadMap
    let script = document.createElement('script')
    // loadMap is called once script completes downloading
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapAPIKey}&v=3&callback=loadMap`
    script.async = true
    document.body.appendChild(script)

    // Handle error if script is not loaded
    script.onerror = () => {
      document.getElementById("map").innerHTML = `<span><i class="fa fa-exclamation-triangle"></i>We're having troubles reaching to Google Maps, sorry for that.</span>`
    }
  }

  /**
  * Highlight chosen marker, the marker is being chosen by clicking associated place from the list
  */
  export const highlightMarker = (markerTitle) =>
  {
    // Reset icon and animation for any previously chosen marker
    resetMarkers()

    // Close opened infoWindow if any
    if (openedInfoWindow) {
      openedInfoWindow.close()
    }

    // Change the icon and animate the desired marker
    let marker = markers.filter((marker) => (
      marker.title === markerTitle
    ))[0]
    marker.setIcon('fav.png')
    marker.setAnimation(4)

    // Open infoWindow of the marker
    openWindow(marker, infoWindows[markers.indexOf(marker)])

    // Load details into infoWindow
    getVenueID(marker)
  }

  /**
  * Change markers visibility according to search result
  */
  export const setMarkersVisibility = (results) =>
  {
    markers.forEach((marker) => {
      // Hide all markers
      marker.setMap(null)

      results.map((result) => {
        if (result.title === marker.title) {
          // Show markers which appear in the search result
          marker.setMap(map)
          // Reset markers' icons based on place type
          resetIcon(marker)
        }
      })
    })
  }

  /**
  * Load the map
  */
  function loadMap() {
    map = new window.google.maps.Map(document.getElementById('map'), {
      mapTypeControl: false // Map view only, disable satellite view
    })

    setMarkers()
  }

  /**
  * Set markers on the map
  */
  function setMarkers() {
    // Initialize map bounds
    bounds = new window.google.maps.LatLngBounds()

    // Create a marker per place
    places.map((place) => {
      let marker = new window.google.maps.Marker({
        position: new window.google.maps.LatLng(place.position.lat, place.position.lng),
        map: map,
        title: place.title,
        icon: `${place.type}.png`, // Set icon based on place type
        animation: window.google.maps.Animation.DROP
      })

      let infoWindow = new window.google.maps.InfoWindow({
        content: `<strong>${marker.title} <br>${place.address}</strong>`
      })

      infoWindow.addListener('closeclick', function() {
        // Zoom out the map when infoWindow is closed
        resetZoom()
        openedInfoWindow = null
        markers.map((marker) => {
          // Reset markers' icons based on place type
          resetIcon(marker)
        })
      })

      // Array to access currently opened infoWindow
      infoWindows.push(infoWindow)

      marker.addListener('click', function() {
        // Close opened infoWindow if any
        if (openedInfoWindow) {
          openedInfoWindow.close()
        }

        // Open infoWindow associated with the marker
        openWindow(marker, infoWindow)

        // Load details into infoWindow
        getVenueID(marker)
      })

      markers.push(marker)

      // Extend map based on marker position
      bounds.extend(marker.position)
    })

    // Show all markers
    map.fitBounds(bounds)
  }

  /**
  * Reset markers icon and animation
  */
  function resetMarkers() {
    markers.forEach((marker) => {
      marker.setIcon('likes.png')
      marker.setAnimation(null)
    })
  }

  /**
  * Reset marker icon based on place type
  */
  function resetIcon(marker) {
    let type
    places.map((place) => {
      if (place.title === marker.title) {
        type = place.type
      }
    })[0]
    marker.setIcon(`${type}.png`)
  }

  /**
  * Reset zoom on the map to show all markers
  */
  function resetZoom() {
    map.setCenter({lat: 24.789973, lng: 46.656051})
    map.setZoom(15)
    map.fitBounds(bounds)
  }

  /**
  * Open infoWindow associated with the marker
  */
  function openWindow(marker, infoWindow) {
    infoWindow.open(map, marker)
    openedInfoWindow = infoWindow
    // Zoom in the map based on marker position
    map.setCenter(marker.position)
    map.setZoom(16)
  }

  /**
  *********************************  Foursquare API *********************************
  **/
  let param = {
    client_id: 'KAUW5LJMXQRX0O2TC3BBA4MJHGY5IRYFEGWXVGDVC1XX13MW',
    client_secret: 'UJVOR34A1VB1YKQQ3MEHHA4ZTL3532WKV45JGWR1QXVVZD5Y',
    v: '20180323',
    limit: 1
  }

  /**
  * Get the venue (place) id to be used to show the venue details
  */
  function getVenueID(marker) {
    return fetch(`https://api.foursquare.com/v2/venues/explore?client_id=${param.client_id}&client_secret=${param.client_secret}&query=${marker.title}&ll=${marker.position.lat()},${marker.position.lng()}&v=${param.v}&limit=${param.limit}`)
    .then(response => response.json())
    .then((data) => {
      getVenueDetails(data.response.groups[0].items[0].venue.id, marker)
    })
    .catch((error) => {
      logError(marker)
    })
  }

  /**
  * Get the venue rating and best photo
  */
  function getVenueDetails(venue_id, marker) {
    return fetch(`https://api.foursquare.com/v2/venues/${venue_id}?client_id=${param.client_id}&client_secret=${param.client_secret}&v=${param.v}&limit=${param.limit}`)
    .then(response => response.json())
    .then((data) => {
      loadVenueDetails(data.response.venue, marker)
    })
    .catch((error) => {
      logError(marker)
    })
  }

  /**
  * Load the venue details into infoWindow
  */
  function loadVenueDetails(venue, marker) {
    // Get desired infoWindow to load details in, based on the associated marker
    let currInfoWindow = infoWindows[markers.indexOf(marker)]

    let venueImgSrc = `${venue.bestPhoto.prefix}${venue.bestPhoto.width}x${venue.bestPhoto.height}${venue.bestPhoto.suffix}`
    let venueImg = `<img class="venue-img" src=${venueImgSrc} alt=${marker.title}>`

    // Foursquare logo
    let foursquare = `<div class="foursquare">
    <i class="fa fa-foursquare fa-spin"></i>
    <small> Powered by Foursquare</small>
    </div>`

    // Convert venue rating as scale from 1 to 5, then show it as stars
    let stars = []
    let count
    for (count = 0; count < 5; count++) {
      stars[count] = "fa fa-star-o"

      if (venue.rating >= 9.0 && venue.rating <= 10.0 && count >= 0) {
        stars[count] = "fa fa-star"
      }
      else if (venue.rating >= 7.0 && venue.rating <= 8.9 && count >= 1) {
        stars[count] = "fa fa-star"
      }
      else if (venue.rating >= 5.0 && venue.rating <= 6.9 && count >= 2) {
        stars[count] = "fa fa-star"
      }
      else if (venue.rating >= 3.0 && venue.rating <= 4.9 && count >= 3) {
        stars[count] = "fa fa-star"
      }
      else if (venue.rating >= 1.0 && venue.rating <= 2.9 && count >= 4) {
        stars[count] = "fa fa-star"
      }
    }

    let venueRating = `<div class="venue-rating">
    <span class="rating">${venue.rating}</span>
    <ul class="stars">
    <li><i class="${stars[4]}"></i></li>
    <li><i class="${stars[3]}"></i></li>
    <li><i class="${stars[2]}"></i></li>
    <li><i class="${stars[1]}"></i></li>
    <li><i class="${stars[0]}"></i></li>
    </ul>
    </div>`

    // Load the details into infoWindow
    let content = currInfoWindow.getContent().slice(0, (currInfoWindow.getContent().indexOf(`</strong>`)) + 9)
    currInfoWindow.setContent(`<div class="info-window" role="complementary">` + content + `${venueRating} ${venueImg} ${foursquare} </div>`)
  }

  /**
  * Display error message if Foursquare API could not be reached
  */
  function logError(marker) {
    let currInfoWindow = infoWindows[markers.indexOf(marker)]
    let content = currInfoWindow.getContent().slice(0, (currInfoWindow.getContent().indexOf(`</strong>`)) + 9)
    let info = `<div><i class="fa fa-exclamation-triangle"></i>We're having troubles reaching to Foursquare, sorry for that.</div>`
    currInfoWindow.setContent(`<div class="info-window" role="complementary">` + content + `${info} </div>`)
  }
