/**
 * Leaflet Map Integration for Campus BookSwap
 * Helps users locate book exchange points and sellers on campus
 */

class LeafletCampusMap {
    constructor(mapContainerId, options = {}) {
        this.mapContainer = document.getElementById(mapContainerId);
        if (!this.mapContainer) {
            console.error(`Map container with ID '${mapContainerId}' not found`);
            return;
        }
        
        this.options = {
            center: options.center || [12.9692, 79.1559], // Default to VIT Vellore coordinates
            zoom: options.zoom || 16,
            mapType: options.mapType || 'streets'
        };
        
        this.markers = [];
        this.popups = [];
        this.exchangePoints = [];
        this.userLocation = null;
        this.userMarker = null;
        
        this.initMap();
    }
    
    /**
     * Initialize the Leaflet Map
     */
    initMap() {
        // Create the map
        this.map = L.map(this.mapContainer.id).setView(this.options.center, this.options.zoom);
        
        // Add tile layer (map style)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);
        
        // Add default exchange points
        this.addDefaultExchangePoints();
        
        // Try to get user's location
        this.getUserLocation();
    }
    
    /**
     * Get user's location
     */
    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLatLng = [position.coords.latitude, position.coords.longitude];
                    this.userLocation = userLatLng;
                    
                    // Add user marker if it doesn't exist
                    if (!this.userMarker) {
                        this.addUserMarker(userLatLng);
                    } else {
                        // Update existing marker
                        this.userMarker.setLatLng(userLatLng);
                    }
                },
                (error) => {
                    console.warn('Error getting user location:', error.message);
                }
            );
        }
    }
    
    /**
     * Add user marker to the map
     */
    addUserMarker(latLng) {
        // Create a custom icon for user location
        const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: '<div class="user-marker-icon"><i class="fas fa-user"></i></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        // Create marker
        this.userMarker = L.marker(latLng, {
            icon: userIcon,
            zIndexOffset: 1000 // Ensure it's above other markers
        }).addTo(this.map);
        
        // Add popup
        this.userMarker.bindPopup('<strong>Your Location</strong>');
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
                position: [12.9698, 79.1559],
                type: 'library',
                description: 'Official book exchange point at the main library entrance. Available during library hours.',
                hours: 'Mon-Sat: 8:00 AM - 8:00 PM',
                popularity: 'High'
            },
            {
                id: 'cafe1',
                name: 'Campus Café',
                position: [12.9690, 79.1570],
                type: 'cafe',
                description: 'Popular meeting spot for book exchanges. Free WiFi available.',
                hours: 'Mon-Sun: 7:30 AM - 10:00 PM',
                popularity: 'Medium'
            },
            {
                id: 'hub1',
                name: 'Student Hub',
                position: [12.9685, 79.1550],
                type: 'hub',
                description: 'Student activity center with dedicated book exchange area.',
                hours: 'Mon-Fri: 9:00 AM - 6:00 PM',
                popularity: 'High'
            },
            {
                id: 'dorm1',
                name: 'Men\'s Hostel Common Area',
                position: [12.9710, 79.1545],
                type: 'dorm',
                description: 'Convenient exchange point for hostel residents.',
                hours: 'Always open for residents',
                popularity: 'Medium'
            },
            {
                id: 'dorm2',
                name: 'Women\'s Hostel Common Area',
                position: [12.9675, 79.1540],
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
        const marker = L.marker(point.position, {
            icon: icon,
            title: point.name
        }).addTo(this.map);
        
        // Create popup content
        const popupContent = `
            <div class="map-info-window">
                <h3>${point.name}</h3>
                <p>${point.description}</p>
                <div class="info-details">
                    <p><strong>Hours:</strong> ${point.hours}</p>
                    <p><strong>Popularity:</strong> ${point.popularity}</p>
                </div>
                <div class="info-actions">
                    <button class="btn-directions" data-lat="${point.position[0]}" data-lng="${point.position[1]}">Get Directions</button>
                </div>
            </div>
        `;
        
        // Create popup
        const popup = L.popup().setContent(popupContent);
        
        // Add click event to marker
        marker.bindPopup(popup);
        
        // Add click event for directions button
        marker.on('popupopen', () => {
            setTimeout(() => {
                const directionsBtn = document.querySelector('.btn-directions');
                if (directionsBtn) {
                    directionsBtn.addEventListener('click', (e) => {
                        const lat = e.target.dataset.lat;
                        const lng = e.target.dataset.lng;
                        this.getDirections(lat, lng);
                    });
                }
            }, 100);
        });
        
        // Store marker
        this.markers.push(marker);
        this.popups.push(popup);
        
        return marker;
    }
    
    /**
     * Get marker icon based on point type
     */
    getMarkerIcon(type) {
        let iconHtml = '';
        let className = 'map-marker';
        
        switch (type) {
            case 'library':
                iconHtml = '<i class="fas fa-book"></i>';
                className += ' library-marker';
                break;
            case 'cafe':
                iconHtml = '<i class="fas fa-coffee"></i>';
                className += ' cafe-marker';
                break;
            case 'hub':
                iconHtml = '<i class="fas fa-users"></i>';
                className += ' hub-marker';
                break;
            case 'dorm':
                iconHtml = '<i class="fas fa-home"></i>';
                className += ' dorm-marker';
                break;
            default:
                iconHtml = '<i class="fas fa-map-marker-alt"></i>';
                className += ' default-marker';
        }
        
        return L.divIcon({
            className: className,
            html: `<div class="marker-icon">${iconHtml}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });
    }
    
    /**
     * Get directions to a point
     */
    getDirections(lat, lng) {
        // Open directions in a new tab using OpenStreetMap
        if (this.userLocation) {
            const [userLat, userLng] = this.userLocation;
            window.open(`https://www.openstreetmap.org/directions?from=${userLat},${userLng}&to=${lat},${lng}`, '_blank');
        } else {
            window.open(`https://www.openstreetmap.org/directions?to=${lat},${lng}`, '_blank');
        }
    }
    
    /**
     * Center map on user location
     */
    centerOnUserLocation() {
        if (this.userLocation) {
            this.map.setView(this.userLocation, this.options.zoom);
            if (this.userMarker) {
                this.userMarker.openPopup();
            }
        } else {
            this.getUserLocation();
            // Add a small delay to allow geolocation to complete
            setTimeout(() => {
                if (this.userLocation) {
                    this.map.setView(this.userLocation, this.options.zoom);
                    if (this.userMarker) {
                        this.userMarker.openPopup();
                    }
                }
            }, 1000);
        }
    }
    
    /**
     * Find nearby exchange points within a given radius
     */
    findNearbyPoints(radius = 1000) { // radius in meters
        if (!this.userLocation) return [];
        
        const nearbyPoints = this.exchangePoints.filter(point => {
            const distance = this.calculateDistance(
                this.userLocation[0], this.userLocation[1],
                point.position[0], point.position[1]
            );
            return distance <= radius;
        });
        
        return nearbyPoints;
    }
    
    /**
     * Calculate distance between two points in meters (Haversine formula)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c; // Distance in meters
    }
    
    /**
     * Highlight nearby points on the map
     */
    highlightNearbyPoints(radius = 1000) {
        const nearbyPoints = this.findNearbyPoints(radius);
        
        // Reset all markers
        this.markers.forEach(marker => {
            const icon = marker.getIcon();
            marker.getElement().classList.remove('highlighted-marker');
        });
        
        // Highlight nearby markers
        nearbyPoints.forEach(point => {
            const marker = this.markers.find(m => {
                const pos = m.getLatLng();
                return pos.lat === point.position[0] && pos.lng === point.position[1];
            });
            
            if (marker) {
                marker.getElement().classList.add('highlighted-marker');
            }
        });
        
        return nearbyPoints;
    }
    
    /**
     * Filter markers by type
     */
    filterMarkersByType(types) {
        this.markers.forEach((marker, index) => {
            const point = this.exchangePoints[index];
            if (types.includes(point.type)) {
                // Show marker
                marker.addTo(this.map);
            } else {
                // Hide marker
                marker.remove();
            }
        });
    }
}