/**
 * Campus Map Dashboard Integration for Campus BookSwap
 * Integrates the campus map into the dashboard for easy access
 */

class CampusMapDashboard {
    constructor() {
        this.mapInstance = null;
        this.currentUser = this.getCurrentUser();
        this.savedLocations = this.loadSavedLocations();
        this.meetingHistory = this.loadMeetingHistory();
    }
    
    /**
     * Get current user information
     */
    getCurrentUser() {
        // In a real application, this would get the logged-in user
        // For demo purposes, we'll return a dummy user
        return {
            id: 'user123',
            name: 'John Smith',
            email: 'john.smith@university.edu'
        };
    }
    
    /**
     * Load saved locations from localStorage
     */
    loadSavedLocations() {
        const savedLocationsJson = localStorage.getItem('bookswap_saved_locations');
        return savedLocationsJson ? JSON.parse(savedLocationsJson) : this.getDefaultSavedLocations();
    }
    
    /**
     * Get default saved locations for demo purposes
     */
    getDefaultSavedLocations() {
        return [
            {
                id: 'loc1',
                name: 'Main Library',
                position: { lat: 12.9698, lng: 79.1559 },
                type: 'library',
                notes: 'Preferred meeting spot for textbook exchanges'
            },
            {
                id: 'loc2',
                name: 'Campus Café',
                position: { lat: 12.9690, lng: 79.1570 },
                type: 'cafe',
                notes: 'Good for morning meetups'
            },
            {
                id: 'loc3',
                name: 'Student Hub',
                position: { lat: 12.9685, lng: 79.1550 },
                type: 'hub',
                notes: 'Central location with good seating'
            }
        ];
    }
    
    /**
     * Save locations to localStorage
     */
    saveSavedLocations() {
        localStorage.setItem('bookswap_saved_locations', JSON.stringify(this.savedLocations));
    }
    
    /**
     * Load meeting history from localStorage
     */
    loadMeetingHistory() {
        const meetingHistoryJson = localStorage.getItem('bookswap_meeting_history');
        return meetingHistoryJson ? JSON.parse(meetingHistoryJson) : this.getDefaultMeetingHistory();
    }
    
    /**
     * Get default meeting history for demo purposes
     */
    getDefaultMeetingHistory() {
        return [
            {
                id: 'meet1',
                date: '2023-05-15T14:30:00Z',
                location: {
                    name: 'Main Library',
                    position: { lat: 12.9698, lng: 79.1559 }
                },
                user: {
                    id: 'user456',
                    name: 'Alice Johnson'
                },
                book: {
                    id: 'book123',
                    title: 'Introduction to Computer Science'
                },
                status: 'completed'
            },
            {
                id: 'meet2',
                date: '2023-05-20T10:15:00Z',
                location: {
                    name: 'Campus Café',
                    position: { lat: 12.9690, lng: 79.1570 }
                },
                user: {
                    id: 'user789',
                    name: 'Bob Williams'
                },
                book: {
                    id: 'book456',
                    title: 'Calculus: Early Transcendentals'
                },
                status: 'scheduled'
            }
        ];
    }
    
    /**
     * Save meeting history to localStorage
     */
    saveMeetingHistory() {
        localStorage.setItem('bookswap_meeting_history', JSON.stringify(this.meetingHistory));
    }
    
    /**
     * Initialize the dashboard
     */
    initialize() {
        // Add event listeners for tab changes
        this.addTabChangeListeners();
    }
    
    /**
     * Add event listeners for tab changes
     */
    addTabChangeListeners() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const tabName = event.currentTarget.dataset.tab;
                
                if (tabName === 'campus-map') {
                    // Initialize map when tab is selected
                    this.initializeMapInDashboard();
                }
            });
        });
    }
    
    /**
     * Initialize map in dashboard
     */
    initializeMapInDashboard() {
        // Check if map is already initialized
        if (this.mapInstance) return;
        
        // Check if LeafletCampusMap class is available
        if (typeof LeafletCampusMap === 'undefined') {
            // Load leaflet-map.js if not already loaded
            const script = document.createElement('script');
            script.src = 'js/leaflet-map.js';
            script.onload = () => {
                this.setupMapInDashboard();
            };
            document.head.appendChild(script);
        } else {
            this.setupMapInDashboard();
        }
    }
    
    /**
     * Setup map in dashboard
     */
    setupMapInDashboard() {
        const mapContainer = document.getElementById('campus-map-container');
        if (!mapContainer) return;
        
        // Create a map canvas element if it doesn't exist
        let mapCanvas = document.getElementById('campus-map-canvas');
        if (!mapCanvas) {
            mapCanvas = document.createElement('div');
            mapCanvas.id = 'campus-map-canvas';
            mapCanvas.style.height = '500px';
            mapCanvas.style.width = '100%';
            mapCanvas.style.borderRadius = '8px';
            
            // Clear the container and add the canvas
            mapContainer.innerHTML = '';
            mapContainer.appendChild(mapCanvas);
        }
        
        // Initialize the map with Leaflet
        this.mapInstance = new LeafletCampusMap('campus-map-canvas', {
            zoom: 16
        });
        
        // Add saved locations to map
        this.addSavedLocationsToMap();
        
        // Add event listeners for map interactions
        this.addMapEventListeners();
    }
    
    /**
     * Add saved locations to map
     */
    addSavedLocationsToMap() {
        if (!this.mapInstance) return;
        
        this.savedLocations.forEach(location => {
            this.mapInstance.addExchangePoint({
                id: location.id,
                name: location.name,
                position: location.position,
                type: location.type,
                description: location.notes,
                hours: 'Varies',
                popularity: 'Personal'
            });
        });
    }
    
    /**
     * Add event listeners for map interactions
     */
    addMapEventListeners() {
        // Add event listeners for save location button
        const saveLocationBtn = document.getElementById('save-location-btn');
        if (saveLocationBtn) {
            saveLocationBtn.addEventListener('click', () => {
                this.showSaveLocationForm();
            });
        }
        
        // Add event listener for find nearby button
        const findNearbyBtn = document.getElementById('find-nearby-btn');
        if (findNearbyBtn) {
            findNearbyBtn.addEventListener('click', () => {
                this.findNearbyExchangePoints();
            });
        }
        
        // Add event listeners for filter checkboxes
        const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.applyFilters();
            });
        });
        
        // Add event listeners for upcoming meetings
        const upcomingMeetings = document.querySelectorAll('.meeting-item');
        upcomingMeetings.forEach(meeting => {
            const viewOnMapBtn = meeting.querySelector('.view-on-map-btn');
            if (viewOnMapBtn) {
                viewOnMapBtn.addEventListener('click', (event) => {
                    const meetingId = event.currentTarget.dataset.id;
                    this.showMeetingOnMap(meetingId);
                });
            }
        });
        
        // Add event listener for my location button
        const myLocationBtn = document.getElementById('my-location-btn');
        if (myLocationBtn) {
            myLocationBtn.addEventListener('click', () => {
                this.centerMapOnUserLocation();
            });
        }
    }
    
    /**
     * Show save location form
     */
    showSaveLocationForm() {
        // In a real application, this would show a form to save the current location
        // For demo purposes, we'll just add a new location
        const newLocation = {
            id: 'loc' + (this.savedLocations.length + 1),
            name: 'New Location ' + (this.savedLocations.length + 1),
            position: this.mapInstance.map.getCenter(),
            type: 'custom',
            notes: 'Added on ' + new Date().toLocaleDateString()
        };
        
        this.savedLocations.push(newLocation);
        this.saveSavedLocations();
        
        // Add to map
        this.mapInstance.addExchangePoint({
            id: newLocation.id,
            name: newLocation.name,
            position: newLocation.position,
            type: newLocation.type,
            description: newLocation.notes,
            hours: 'Varies',
            popularity: 'Personal'
        });
        
        // Update saved locations list
        this.updateSavedLocationsList();
    }
    
    /**
     * Show meeting on map
     */
    showMeetingOnMap(meetingId) {
        if (!this.mapInstance) return;
        
        const meeting = this.meetingHistory.find(m => m.id === meetingId);
        if (!meeting) return;
        
        // Center map on meeting location
        this.mapInstance.map.setCenter(meeting.location.position);
        
        // Find the marker for this location
        const marker = this.mapInstance.markers.find(m => 
            m.getPosition().lat() === meeting.location.position.lat && 
            m.getPosition().lng() === meeting.location.position.lng
        );
        
        if (marker) {
            // Trigger click on marker to show info window
            google.maps.event.trigger(marker, 'click');
        }
    }
    
    /**
     * Update saved locations list
     */
    updateSavedLocationsList() {
        const savedLocationsList = document.getElementById('saved-locations-list');
        if (!savedLocationsList) return;
        
        let html = '';
        
        this.savedLocations.forEach(location => {
            html += `
                <div class="saved-location-item">
                    <div class="location-icon">
                        <i class="fas fa-${this.getLocationIcon(location.type)}"></i>
                    </div>
                    <div class="location-details">
                        <h4>${location.name}</h4>
                        <p>${location.notes}</p>
                    </div>
                    <div class="location-actions">
                        <button class="btn-view-on-map" data-id="${location.id}">
                            <i class="fas fa-map-marker-alt"></i>
                        </button>
                        <button class="btn-delete-location" data-id="${location.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        savedLocationsList.innerHTML = html;
        
        // Add event listeners to new buttons
        const viewOnMapBtns = savedLocationsList.querySelectorAll('.btn-view-on-map');
        viewOnMapBtns.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const locationId = event.currentTarget.dataset.id;
                this.showLocationOnMap(locationId);
            });
        });
        
        const deleteLocationBtns = savedLocationsList.querySelectorAll('.btn-delete-location');
        deleteLocationBtns.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const locationId = event.currentTarget.dataset.id;
                this.deleteLocation(locationId);
            });
        });
    }
    
    /**
     * Show location on map
     */
    showLocationOnMap(locationId) {
        if (!this.mapInstance) return;
        
        const location = this.savedLocations.find(l => l.id === locationId);
        if (!location) return;
        
        // Center map on location
        this.mapInstance.map.setCenter(location.position);
        
        // Find the marker for this location
        const marker = this.mapInstance.markers.find(m => 
            m.getPosition().lat() === location.position.lat && 
            m.getPosition().lng() === location.position.lng
        );
        
        if (marker) {
            // Trigger click on marker to show info window
            google.maps.event.trigger(marker, 'click');
        }
    }
    
    /**
     * Delete location
     */
    deleteLocation(locationId) {
        // Find location index
        const locationIndex = this.savedLocations.findIndex(l => l.id === locationId);
        if (locationIndex === -1) return;
        
        // Remove from saved locations
        this.savedLocations.splice(locationIndex, 1);
        this.saveSavedLocations();
        
        // Update saved locations list
        this.updateSavedLocationsList();
        
        // Refresh map
        if (this.mapInstance) {
            // In a real application, we would just remove the specific marker
            // For demo purposes, we'll reinitialize the map
            this.mapInstance = null;
            this.initializeMapInDashboard();
        }
    }
    
    /**
     * Get icon for location type
     */
    getLocationIcon(type) {
        switch (type) {
            case 'library':
                return 'book';
            case 'cafe':
                return 'coffee';
            case 'hub':
                return 'users';
            case 'dorm':
                return 'home';
            case 'custom':
                return 'map-pin';
            default:
                return 'map-marker-alt';
        }
    }
    
    /**
     * Update upcoming meetings list
     */
    updateUpcomingMeetingsList() {
        const upcomingMeetingsList = document.getElementById('upcoming-meetings-list');
        if (!upcomingMeetingsList) return;
        
        // Filter for upcoming meetings (status = scheduled)
        const upcomingMeetings = this.meetingHistory.filter(m => m.status === 'scheduled');
        
        if (upcomingMeetings.length === 0) {
            upcomingMeetingsList.innerHTML = '<div class="empty-state">No upcoming meetings</div>';
            return;
        }
        
        let html = '';
        
        upcomingMeetings.forEach(meeting => {
            const date = new Date(meeting.date);
            const formattedDate = `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
            
            html += `
                <div class="meeting-item">
                    <div class="meeting-icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="meeting-details">
                        <h4>${meeting.book.title}</h4>
                        <p>With ${meeting.user.name}</p>
                        <p>${meeting.location.name} - ${formattedDate}</p>
                    </div>
                    <div class="meeting-actions">
                        <button class="view-on-map-btn" data-id="${meeting.id}">
                            <i class="fas fa-map-marker-alt"></i> View on Map
                        </button>
                    </div>
                </div>
            `;
        });
        
        upcomingMeetingsList.innerHTML = html;
        
        // Add event listeners to new buttons
        const viewOnMapBtns = upcomingMeetingsList.querySelectorAll('.view-on-map-btn');
        viewOnMapBtns.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const meetingId = event.currentTarget.dataset.id;
                this.showMeetingOnMap(meetingId);
            });
        });
    }
    
    /**
     * Generate dashboard HTML
     */
    generateDashboardHTML(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const html = `
            <div class="campus-map-dashboard">
                <div class="dashboard-header">
                    <h2>Campus Map</h2>
                    <p>Find book exchange points, save favorite locations, and manage your meeting spots.</p>
                </div>
                
                <div class="dashboard-content">
                    <div class="dashboard-section">
                        <h3>Interactive Campus Map</h3>
                        <div id="campus-map-dashboard-container" class="map-container">
                            <div class="map-header">
                                <h3 class="map-title">Book Exchange Map</h3>
                                <div class="map-actions">
                                    <button id="my-location-btn" class="btn-secondary">
                                        <i class="fas fa-location-arrow"></i> My Location
                                    </button>
                                    <button id="save-location-btn" class="btn-primary">
                                        <i class="fas fa-bookmark"></i> Save Location
                                    </button>
                                    <button id="find-nearby-btn" class="btn-primary">
                                        <i class="fas fa-search-location"></i> Find Nearby
                                    </button>
                                </div>
                            </div>
                            <div class="map-content">
                                <div class="map-sidebar">
                                    <div id="map-filters-container">
                                        <div class="filter-section">
                                            <h4>Filter Exchange Points</h4>
                                            <div class="filter-options">
                                                <label class="filter-option">
                                                    <input type="checkbox" data-type="library" checked> Libraries
                                                </label>
                                                <label class="filter-option">
                                                    <input type="checkbox" data-type="cafe" checked> Cafés
                                                </label>
                                                <label class="filter-option">
                                                    <input type="checkbox" data-type="hub" checked> Student Hubs
                                                </label>
                                                <label class="filter-option">
                                                    <input type="checkbox" data-type="dorm" checked> Dormitories
                                                </label>
                                                <label class="filter-option">
                                                    <input type="checkbox" data-type="custom" checked> Custom Locations
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="directions-panel" class="directions-panel"></div>
                                </div>
                                <div id="campus-map-canvas" style="height: 400px;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-columns">
                        <div class="dashboard-section">
                            <h3>Saved Locations</h3>
                            <div id="saved-locations-list" class="locations-list">
                                <!-- Saved locations will be inserted here by JavaScript -->
                            </div>
                        </div>
                        
                        <div class="dashboard-section">
                            <h3>Upcoming Meetings</h3>
                            <div id="upcoming-meetings-list" class="meetings-list">
                                <!-- Upcoming meetings will be inserted here by JavaScript -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-section">
                        <h3>Exchange Point Availability</h3>
                        <div class="availability-container">
                            <div class="availability-legend">
                                <div class="legend-item">
                                    <span class="status-dot status-high"></span>
                                    <span>High Availability</span>
                                </div>
                                <div class="legend-item">
                                    <span class="status-dot status-medium"></span>
                                    <span>Medium Availability</span>
                                </div>
                                <div class="legend-item">
                                    <span class="status-dot status-low"></span>
                                    <span>Low Availability</span>
                                </div>
                            </div>
                            <div id="availability-list" class="availability-list">
                                <!-- Availability will be inserted here by JavaScript -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-section">
                        <h3>Safety Tips for Book Exchanges</h3>
                        <div class="tips-container">
                            <div class="tip-card">
                                <div class="tip-number">1</div>
                                <div class="tip-content">
                                    <h4>Meet in Public Places</h4>
                                    <p>Always meet in well-lit, public areas with plenty of people around.</p>
                                </div>
                            </div>
                            
                            <div class="tip-card">
                                <div class="tip-number">2</div>
                                <div class="tip-content">
                                    <h4>Bring a Friend</h4>
                                    <p>If possible, bring a friend along, especially for first-time meetings.</p>
                                </div>
                            </div>
                            
                            <div class="tip-card">
                                <div class="tip-number">3</div>
                                <div class="tip-content">
                                    <h4>Share Your Plans</h4>
                                    <p>Let someone know where you're going and when you expect to return.</p>
                                </div>
                            </div>
                            
                            <div class="tip-card">
                                <div class="tip-number">4</div>
                                <div class="tip-content">
                                    <h4>Use Secure Payments</h4>
                                    <p>Use our secure payment system instead of carrying cash.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Initialize map
        this.initializeMapInDashboard();
        
        // Update saved locations list
        this.updateSavedLocationsList();
        
        // Update upcoming meetings list
        this.updateUpcomingMeetingsList();
        
        // Update availability list
        this.updateAvailabilityList();
        
        // Add event listeners
        this.addMapEventListeners();
    }
}

/**
     * Find nearby exchange points based on user location
     */
    findNearbyExchangePoints() {
        if (!this.mapInstance) return;
        
        // Get user location
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Center map on user location
                this.mapInstance.map.setCenter(userLocation);
                
                // Find nearby exchange points (within 1km)
                const nearbyPoints = this.getNearbyExchangePoints(userLocation, 1);
                
                // Highlight nearby points on map
                this.highlightNearbyPoints(nearbyPoints);
                
                // Show notification
                alert(`Found ${nearbyPoints.length} exchange points within 1km of your location.`);
            },
            (error) => {
                console.error('Error getting user location:', error);
                alert('Unable to get your location. Please try again.');
            }
        );
    }
    
    /**
     * Get nearby exchange points within a certain radius (in km)
     */
    getNearbyExchangePoints(userLocation, radiusKm) {
        if (!this.mapInstance || !this.mapInstance.markers) return [];
        
        const nearbyPoints = [];
        
        this.mapInstance.markers.forEach(marker => {
            const markerPosition = marker.getPosition();
            const distance = this.calculateDistance(
                userLocation.lat, userLocation.lng,
                markerPosition.lat(), markerPosition.lng()
            );
            
            if (distance <= radiusKm) {
                nearbyPoints.push({
                    marker: marker,
                    distance: distance
                });
            }
        });
        
        // Sort by distance
        nearbyPoints.sort((a, b) => a.distance - b.distance);
        
        return nearbyPoints;
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
     * Highlight nearby points on map
     */
    highlightNearbyPoints(nearbyPoints) {
        if (!this.mapInstance) return;
        
        // Reset all markers to default
        this.mapInstance.markers.forEach(marker => {
            marker.setAnimation(null);
        });
        
        // Highlight nearby markers
        nearbyPoints.forEach(point => {
            point.marker.setAnimation(google.maps.Animation.BOUNCE);
            
            // Stop animation after 3 seconds
            setTimeout(() => {
                point.marker.setAnimation(null);
            }, 3000);
        });
    }
    
    /**
     * Apply filters to map markers
     */
    applyFilters() {
        if (!this.mapInstance) return;
        
        const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
        const activeFilters = [];
        
        // Get active filters
        filterCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                activeFilters.push(checkbox.dataset.type);
            }
        });
        
        // Apply filters to markers
        this.mapInstance.markers.forEach(marker => {
            const markerType = marker.get('type') || 'custom';
            
            if (activeFilters.includes(markerType)) {
                marker.setVisible(true);
            } else {
                marker.setVisible(false);
            }
        });
    }
    
    /**
     * Center map on user location
     */
    centerMapOnUserLocation() {
        if (!this.mapInstance) return;
        
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Center map on user location
                this.mapInstance.map.setCenter(userLocation);
                
                // Add or update user location marker
                if (this.userLocationMarker) {
                    this.userLocationMarker.setPosition(userLocation);
                } else {
                    this.userLocationMarker = new google.maps.Marker({
                        position: userLocation,
                        map: this.mapInstance.map,
                        title: 'Your Location',
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#4285F4',
                            fillOpacity: 1,
                            strokeColor: '#FFFFFF',
                            strokeWeight: 2
                        }
                    });
                }
            },
            (error) => {
                console.error('Error getting user location:', error);
                alert('Unable to get your location. Please try again.');
            }
        );
    }
    
    /**
     * Update availability list
     */
    updateAvailabilityList() {
        const availabilityList = document.getElementById('availability-list');
        if (!availabilityList) return;
        
        // Get exchange points from map instance or use default
        const exchangePoints = this.mapInstance ? 
            this.mapInstance.exchangePoints : 
            this.getDefaultExchangePoints();
        
        if (!exchangePoints || exchangePoints.length === 0) {
            availabilityList.innerHTML = '<div class="empty-state">No exchange points available</div>';
            return;
        }
        
        // Generate availability data with random status for demo
        const availabilityData = exchangePoints.map(point => {
            // In a real app, this would come from a server
            // For demo, we'll generate random availability
            const availabilityLevels = ['high', 'medium', 'low'];
            const randomIndex = Math.floor(Math.random() * availabilityLevels.length);
            
            return {
                id: point.id,
                name: point.name,
                type: point.type,
                availability: availabilityLevels[randomIndex],
                lastUpdated: new Date().toLocaleTimeString()
            };
        });
        
        // Sort by availability (high to low)
        availabilityData.sort((a, b) => {
            const order = { 'high': 0, 'medium': 1, 'low': 2 };
            return order[a.availability] - order[b.availability];
        });
        
        // Generate HTML
        let html = '';
        
        availabilityData.forEach(item => {
            html += `
                <div class="availability-item">
                    <div class="availability-icon">
                        <i class="fas fa-${this.getLocationIcon(item.type)}"></i>
                    </div>
                    <div class="availability-details">
                        <h4>${item.name}</h4>
                        <div class="availability-status">
                            <span class="status-dot status-${item.availability}"></span>
                            <span>${item.availability.charAt(0).toUpperCase() + item.availability.slice(1)} Availability</span>
                        </div>
                        <p class="availability-updated">Last updated: ${item.lastUpdated}</p>
                    </div>
                    <div class="availability-actions">
                        <button class="btn-view-on-map" data-id="${item.id}">
                            <i class="fas fa-map-marker-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        availabilityList.innerHTML = html;
        
        // Add event listeners to view buttons
        const viewButtons = availabilityList.querySelectorAll('.btn-view-on-map');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const locationId = event.currentTarget.dataset.id;
                this.showLocationOnMap(locationId);
            });
        });
    }

// Initialize the CampusMapDashboard class
window.campusMapDashboard = null;

function initializeCampusMapDashboard() {
    window.campusMapDashboard = new CampusMapDashboard();
    window.campusMapDashboard.initialize();
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the dashboard page
    if (document.getElementById('campus-map-container')) {
        initializeCampusMapDashboard();
    }
});