/**
 * Campus Map Integration for Campus BookSwap
 * Helps users locate book exchange points and sellers on campus
 */

class CampusMap {
    constructor(mapContainerId, options = {}) {
        this.mapContainer = document.getElementById(mapContainerId);
        if (!this.mapContainer) {
            console.error(`Map container with ID '${mapContainerId}' not found`);
            return;
        }
        
        this.options = {
            center: options.center || { lat: 12.9692, lng: 79.1559 }, // Default to VIT Vellore coordinates
            zoom: options.zoom || 16,
            mapTypeId: options.mapTypeId || 'roadmap',
            styles: options.styles || this.getDefaultMapStyles()
        };
        
        this.markers = [];
        this.infoWindows = [];
        this.exchangePoints = [];
        this.userLocation = null;
        
        this.initMap();
    }
    
    /**
     * Initialize the Google Map
     */
    initMap() {
        // Check if Google Maps API is loaded
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
            this.loadGoogleMapsAPI();
            return;
        }
        
        // Create the map
        this.map = new google.maps.Map(this.mapContainer, this.options);
        
        // Add default exchange points
        this.addDefaultExchangePoints();
        
        // Try to get user's location
        this.getUserLocation();
        
        // Add event listeners
        this.addMapEventListeners();
    }
    
    /**
     * Load Google Maps API dynamically
     */
    loadGoogleMapsAPI() {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initCampusMap`; // Replace with your API key
        script.async = true;
        script.defer = true;
        
        // Define global callback function
        window.initCampusMap = () => {
            this.initMap();
        };
        
        document.head.appendChild(script);
    }
    
    /**
     * Get default map styles for a campus-friendly look
     */
    getDefaultMapStyles() {
        return [
            {
                featureType: 'poi.business',
                stylers: [{ visibility: 'off' }]
            },
            {
                featureType: 'poi.school',
                stylers: [{ visibility: 'on' }]
            },
            {
                featureType: 'poi.school',
                elementType: 'labels.text',
                stylers: [{ visibility: 'on' }, { weight: 8 }]
            },
            {
                featureType: 'transit',
                elementType: 'labels.icon',
                stylers: [{ visibility: 'on' }]
            }
        ];
    }
    
    /**
     * Add default book exchange points to the map
     */
    addDefaultExchangePoints() {
        // Example exchange points for VIT Vellore
        const defaultPoints = [
            {
                id: 'lib1',
                name: 'Main Library',
                position: { lat: 12.9698, lng: 79.1559 },
                type: 'library',
                description: 'Official book exchange point at the main library entrance. Available during library hours.',
                hours: 'Mon-Sat: 8:00 AM - 8:00 PM',
                popularity: 'High'
            },
            {
                id: 'cafe1',
                name: 'Campus Café',
                position: { lat: 12.9690, lng: 79.1570 },
                type: 'cafe',
                description: 'Popular meeting spot for book exchanges. Free WiFi available.',
                hours: 'Mon-Sun: 7:30 AM - 10:00 PM',
                popularity: 'Medium'
            },
            {
                id: 'hub1',
                name: 'Student Hub',
                position: { lat: 12.9685, lng: 79.1550 },
                type: 'hub',
                description: 'Student activity center with dedicated book exchange area.',
                hours: 'Mon-Fri: 9:00 AM - 6:00 PM',
                popularity: 'High'
            },
            {
                id: 'dorm1',
                name: 'Men\'s Hostel Common Area',
                position: { lat: 12.9710, lng: 79.1545 },
                type: 'dorm',
                description: 'Convenient exchange point for hostel residents.',
                hours: 'Always open for residents',
                popularity: 'Medium'
            },
            {
                id: 'dorm2',
                name: 'Women\'s Hostel Common Area',
                position: { lat: 12.9675, lng: 79.1540 },
                type: 'dorm',
                description: 'Convenient exchange point for hostel residents.',
                hours: 'Always open for residents',
                popularity: 'Medium'
            }
        ];
        
        // Add each point to the map
        defaultPoints.forEach(point => {
            this.addExchangePoint(point);
        });
        
        // Store the exchange points
        this.exchangePoints = defaultPoints;
    }
    
    /**
     * Add a book exchange point to the map
     */
    addExchangePoint(point) {
        // Create marker icon based on point type
        const icon = this.getMarkerIcon(point.type);
        
        // Create marker
        const marker = new google.maps.Marker({
            position: point.position,
            map: this.map,
            title: point.name,
            icon: icon,
            animation: google.maps.Animation.DROP
        });
        
        // Create info window content
        const contentString = `
            <div class="map-info-window">
                <h3>${point.name}</h3>
                <p>${point.description}</p>
                <div class="info-details">
                    <p><strong>Hours:</strong> ${point.hours}</p>
                    <p><strong>Popularity:</strong> ${point.popularity}</p>
                </div>
                <div class="info-actions">
                    <button class="btn-directions" data-lat="${point.position.lat}" data-lng="${point.position.lng}">Get Directions</button>
                </div>
            </div>
        `;
        
        // Create info window
        const infoWindow = new google.maps.InfoWindow({
            content: contentString
        });
        
        // Add click event to marker
        marker.addListener('click', () => {
            // Close all open info windows
            this.infoWindows.forEach(window => window.close());
            
            // Open this info window
            infoWindow.open(this.map, marker);
            
            // Add event listeners to buttons in info window
            google.maps.event.addListener(infoWindow, 'domready', () => {
                const directionsBtn = document.querySelector('.btn-directions');
                if (directionsBtn) {
                    directionsBtn.addEventListener('click', (e) => {
                        const lat = e.target.dataset.lat;
                        const lng = e.target.dataset.lng;
                        this.getDirections({ lat: parseFloat(lat), lng: parseFloat(lng) });
                    });
                }
            });
        });
        
        // Store marker and info window
        this.markers.push(marker);
        this.infoWindows.push(infoWindow);
        
        return marker;
    }
    
    /**
     * Get marker icon based on point type
     */
    getMarkerIcon(type) {
        const iconBase = 'https://maps.google.com/mapfiles/ms/icons/';
        
        switch (type) {
            case 'library':
                return iconBase + 'blue-dot.png';
            case 'cafe':
                return iconBase + 'yellow-dot.png';
            case 'hub':
                return iconBase + 'green-dot.png';
            case 'dorm':
                return iconBase + 'purple-dot.png';
            case 'seller':
                return iconBase + 'red-dot.png';
            default:
                return iconBase + 'red-dot.png';
        }
    }
    
    /**
     * Get user's current location
     */
    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    this.userLocation = pos;
                    
                    // Add user marker
                    this.addUserMarker(pos);
                    
                    // Center map on user location
                    this.map.setCenter(pos);
                },
                () => {
                    console.warn('Error: The Geolocation service failed.');
                }
            );
        } else {
            console.warn('Error: Your browser doesn\'t support geolocation.');
        }
    }
    
    /**
     * Add a marker for the user's location
     */
    addUserMarker(position) {
        // Create marker for user location
        const marker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: 'Your Location',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
            },
            zIndex: 1000 // Ensure user marker is on top
        });
        
        // Create info window content
        const contentString = `
            <div class="map-info-window">
                <h3>Your Location</h3>
                <p>This is your current location on campus.</p>
                <div class="info-actions">
                    <button class="btn-find-nearest">Find Nearest Exchange Point</button>
                </div>
            </div>
        `;
        
        // Create info window
        const infoWindow = new google.maps.InfoWindow({
            content: contentString
        });
        
        // Add click event to marker
        marker.addListener('click', () => {
            // Close all open info windows
            this.infoWindows.forEach(window => window.close());
            
            // Open this info window
            infoWindow.open(this.map, marker);
            
            // Add event listeners to buttons in info window
            google.maps.event.addListener(infoWindow, 'domready', () => {
                const findNearestBtn = document.querySelector('.btn-find-nearest');
                if (findNearestBtn) {
                    findNearestBtn.addEventListener('click', () => {
                        this.findNearestExchangePoint();
                    });
                }
            });
        });
        
        // Store marker and info window
        this.userMarker = marker;
        this.infoWindows.push(infoWindow);
        
        return marker;
    }
    
    /**
     * Find the nearest exchange point to the user's location
     */
    findNearestExchangePoint() {
        if (!this.userLocation) {
            alert('Your location is not available. Please enable location services.');
            return;
        }
        
        let nearestPoint = null;
        let shortestDistance = Infinity;
        
        // Calculate distance to each exchange point
        this.exchangePoints.forEach(point => {
            const distance = this.calculateDistance(
                this.userLocation.lat, this.userLocation.lng,
                point.position.lat, point.position.lng
            );
            
            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestPoint = point;
            }
        });
        
        if (nearestPoint) {
            // Center map on nearest point
            this.map.setCenter(nearestPoint.position);
            
            // Find the marker for this point
            const marker = this.markers.find(m => 
                m.getPosition().lat() === nearestPoint.position.lat && 
                m.getPosition().lng() === nearestPoint.position.lng
            );
            
            if (marker) {
                // Trigger click on marker to show info window
                google.maps.event.trigger(marker, 'click');
                
                // Draw path from user to nearest point
                this.drawPath(this.userLocation, nearestPoint.position);
            }
        }
    }
    
    /**
     * Calculate distance between two points using Haversine formula
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in km
        return distance;
    }
    
    /**
     * Convert degrees to radians
     */
    deg2rad(deg) {
        return deg * (Math.PI/180);
    }
    
    /**
     * Draw a path between two points
     */
    drawPath(start, end) {
        // Remove existing path if any
        if (this.path) {
            this.path.setMap(null);
        }
        
        // Create new path
        this.path = new google.maps.Polyline({
            path: [start, end],
            geodesic: true,
            strokeColor: '#4285F4',
            strokeOpacity: 1.0,
            strokeWeight: 3
        });
        
        // Add path to map
        this.path.setMap(this.map);
    }
    
    /**
     * Get directions to a point using Google Maps Directions Service
     */
    getDirections(destination) {
        if (!this.userLocation) {
            alert('Your location is not available. Please enable location services.');
            return;
        }
        
        // Check if Directions Service is available
        if (!this.directionsService) {
            this.directionsService = new google.maps.DirectionsService();
        }
        
        // Check if Directions Renderer is available
        if (!this.directionsRenderer) {
            this.directionsRenderer = new google.maps.DirectionsRenderer({
                map: this.map,
                suppressMarkers: false,
                polylineOptions: {
                    strokeColor: '#4285F4',
                    strokeWeight: 5,
                    strokeOpacity: 0.8
                }
            });
        }
        
        // Set up request
        const request = {
            origin: this.userLocation,
            destination: destination,
            travelMode: google.maps.TravelMode.WALKING // Default to walking on campus
        };
        
        // Get directions
        this.directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                // Display directions
                this.directionsRenderer.setDirections(result);
                
                // Close all info windows
                this.infoWindows.forEach(window => window.close());
                
                // Show directions panel if it exists
                const directionsPanel = document.getElementById('directions-panel');
                if (directionsPanel) {
                    directionsPanel.innerHTML = '';
                    this.directionsRenderer.setPanel(directionsPanel);
                }
            } else {
                alert('Directions request failed due to ' + status);
            }
        });
    }
    
    /**
     * Add a seller location to the map
     */
    addSellerLocation(seller) {
        const position = { lat: seller.lat, lng: seller.lng };
        
        // Create marker
        const marker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: seller.name,
            icon: this.getMarkerIcon('seller'),
            animation: google.maps.Animation.DROP
        });
        
        // Create info window content
        const contentString = `
            <div class="map-info-window">
                <h3>${seller.name}</h3>
                <p>${seller.description || 'Book seller on campus'}</p>
                <div class="info-details">
                    <p><strong>Books Available:</strong> ${seller.booksCount || 'Unknown'}</p>
                    <p><strong>Rating:</strong> ${seller.rating || 'Not rated'}</p>
                </div>
                <div class="info-actions">
                    <button class="btn-view-profile" data-id="${seller.id}">View Profile</button>
                    <button class="btn-directions" data-lat="${position.lat}" data-lng="${position.lng}">Get Directions</button>
                </div>
            </div>
        `;
        
        // Create info window
        const infoWindow = new google.maps.InfoWindow({
            content: contentString
        });
        
        // Add click event to marker
        marker.addListener('click', () => {
            // Close all open info windows
            this.infoWindows.forEach(window => window.close());
            
            // Open this info window
            infoWindow.open(this.map, marker);
            
            // Add event listeners to buttons in info window
            google.maps.event.addListener(infoWindow, 'domready', () => {
                const viewProfileBtn = document.querySelector('.btn-view-profile');
                if (viewProfileBtn) {
                    viewProfileBtn.addEventListener('click', (e) => {
                        const sellerId = e.target.dataset.id;
                        window.location.href = `profile.html?id=${sellerId}`;
                    });
                }
                
                const directionsBtn = document.querySelector('.btn-directions');
                if (directionsBtn) {
                    directionsBtn.addEventListener('click', (e) => {
                        const lat = e.target.dataset.lat;
                        const lng = e.target.dataset.lng;
                        this.getDirections({ lat: parseFloat(lat), lng: parseFloat(lng) });
                    });
                }
            });
        });
        
        // Store marker and info window
        this.markers.push(marker);
        this.infoWindows.push(infoWindow);
        
        return marker;
    }
    
    /**
     * Add map event listeners
     */
    addMapEventListeners() {
        // Add click event to map to close info windows
        this.map.addListener('click', () => {
            this.infoWindows.forEach(window => window.close());
        });
    }
    
    /**
     * Filter exchange points by type
     */
    filterExchangePoints(types) {
        // If no types specified, show all
        if (!types || types.length === 0) {
            this.markers.forEach(marker => marker.setVisible(true));
            return;
        }
        
        // Hide all markers first
        this.markers.forEach((marker, index) => {
            const point = this.exchangePoints[index];
            if (point) {
                marker.setVisible(types.includes(point.type));
            }
        });
    }
    
    /**
     * Generate HTML for map filters
     */
    generateMapFilters(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const html = `
            <div class="map-filters">
                <h3>Filter Exchange Points</h3>
                <div class="filter-options">
                    <label class="filter-option">
                        <input type="checkbox" value="library" checked> Libraries
                    </label>
                    <label class="filter-option">
                        <input type="checkbox" value="cafe" checked> Cafés
                    </label>
                    <label class="filter-option">
                        <input type="checkbox" value="hub" checked> Student Hubs
                    </label>
                    <label class="filter-option">
                        <input type="checkbox" value="dorm" checked> Dormitories
                    </label>
                    <label class="filter-option">
                        <input type="checkbox" value="seller" checked> Sellers
                    </label>
                </div>
                <button id="find-nearest-btn" class="btn-primary">Find Nearest Point</button>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Add event listeners to filters
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const selectedTypes = Array.from(checkboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                
                this.filterExchangePoints(selectedTypes);
            });
        });
        
        // Add event listener to find nearest button
        const findNearestBtn = container.querySelector('#find-nearest-btn');
        if (findNearestBtn) {
            findNearestBtn.addEventListener('click', () => {
                this.findNearestExchangePoint();
            });
        }
    }
}

// Export the CampusMap class
window.CampusMap = CampusMap;