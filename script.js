// Wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Initialize the map and set its view to a default location and zoom level
    const map = L.map('map').setView([20, 0], 2); // Centered roughly, zoomed out

    // Add a tile layer to the map (the actual map images)
    // Using OpenStreetMap's dark theme (CartoDB)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // --- Feature: Get User's Location ---
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Set the map view to the user's location with a closer zoom
            map.setView([lat, lon], 6);

            // Add a marker for the user's location
            L.marker([lat, lon]).addTo(map)
                .bindPopup('<strong>Your Location</strong>')
                .openPopup();
        });
    }

    // --- Feature: Fetch and Display Disaster Data ---
    // Using the USGS Earthquake API for significant earthquakes in the past day
    const earthquakeApiUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';

    fetch(earthquakeApiUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data); // Good for debugging: check what the API returned
            const features = data.features;

            // Find the most significant earthquake for the alert banner
            // The USGS feed is usually sorted by time, so the first one is the most recent.
            // Let's find the one with the highest magnitude.
            let mostSignificantQuake = features.reduce((prev, current) => (prev.properties.mag > current.properties.mag) ? prev : current);

            // Display an alert for the most significant quake
            displayAlert(mostSignificantQuake);

            // Loop through each earthquake event
            features.forEach(feature => {
                const coords = feature.geometry.coordinates;
                const lat = coords[1];
                const lon = coords[0];
                const mag = feature.properties.mag;
                const place = feature.properties.place;
                const time = new Date(feature.properties.time).toLocaleString();

                // Create a custom icon with color based on magnitude
                const earthquakeIcon = L.icon({
                    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                // Create the popup content with details
                const popupContent = `
                    <h3>Earthquake Alert</h3>
                    <p><strong>Location:</strong> ${place}</p>
                    <p><strong>Magnitude:</strong> ${mag.toFixed(2)}</p>
                    <p><strong>Time:</strong> ${time}</p>
                    <a href="${feature.properties.url}" target="_blank">More Info (USGS)</a>
                `;

                // Add a marker to the map for each earthquake
                L.marker([lat, lon], {icon: earthquakeIcon}).addTo(map)
                    .bindPopup(popupContent);
            });
        })
        .catch(error => console.error('Error fetching earthquake data:', error));

    
    // Function to display the top alert banner
    function displayAlert(quake) {
        const alertBanner = document.getElementById('alert-banner');
        const magnitude = quake.properties.mag.toFixed(1);
        const place = quake.properties.place;

        alertBanner.innerHTML = `🚨 Significant Earthquake Alert: Magnitude ${magnitude} near ${place}`;
        alertBanner.classList.add('visible');
    }
    // ... previous JavaScript ...

document.addEventListener('DOMContentLoaded', () => {
    // ... (previous map initialization and earthquake fetching code) ...

    // --- Feature: SOS Button ---
    const sosButton = document.getElementById('sos-button');
    sosButton.addEventListener('click', () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // In a real application, you would send this SOS request
                // to a backend server (e.g., using Supabase) with the user's location.
                console.log('SOS Request Sent from:', { latitude: lat, longitude: lon });
                alert('SOS request sent with your location. Help is on the way (this is a simulation).');

                // --- Conceptual: Display Safe Zones (Requires Data) ---
                // In a real application, you would fetch safe zone data
                // based on the affected area (e.g., around Chennai).
                const safeZones = [
                    // Example safe zone coordinates (replace with actual data)
                    { lat: 13.0827, lon: 80.2707, name: 'Community Hall A' },
                    { lat: 13.0500, lon: 80.2500, name: 'School Building B' }
                    // ... more safe zone coordinates ...
                ];

                safeZones.forEach(zone => {
                    L.marker([zone.lat, zone.lon], {
                        icon: L.divIcon({ className: 'safe-zone-marker', html: `<div style="padding: 5px; background-color: rgba(0, 255, 0, 0.7); color: black; border-radius: 3px;">${zone.name}</div>` })
                    }).addTo(map)
                        .bindPopup(`<strong>Safe Zone:</strong> ${zone.name}`);
                });

            }, error => {
                alert('Could not get your location for the SOS request.');
                console.error('Error getting geolocation:', error);
            });
        } else {
            alert('Geolocation is not available on your browser.');
        }
    });

    // ... (previous displayAlert function) ...
});
});
