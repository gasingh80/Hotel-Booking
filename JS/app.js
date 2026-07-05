let allHotels = []; // This array stores the data so we can search through it later

// Wait for the page to load before running scripts
document.addEventListener('DOMContentLoaded', () => {
    fetchHotels();
    
    // Listen to what the user types in the search bar
    document.getElementById('search-bar').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterHotels(searchTerm);
    });
});

// Fetch data from the Teacher's API
async function fetchHotels() {
    const loadingText = document.getElementById('loading');
    
    try {
        const response = await fetch('https://demohotelsapi.pythonanywhere.com/hotels/');
        
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        
        // Save the fetched data to our global array
        // (Handles common API formats whether it returns a direct array or an object)
        allHotels = Array.isArray(data) ? data : (data.hotels || data.data || []);
        
        loadingText.style.display = 'none'; // Hide the loading text
        renderHotels(allHotels); // Draw the cards
        
    } catch (error) {
        console.error("Error fetching hotels:", error);
        loadingText.innerText = "Failed to load hotels. Please check your internet connection.";
    }
}

// Function to draw the cards on the screen
function renderHotels(hotelsToDisplay) {
    const grid = document.getElementById('hotel-grid');
    grid.innerHTML = ''; // Clear out the old grid

    if (hotelsToDisplay.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; font-size: 1.2rem;">No hotels found matching your search.</p>';
        return;
    }

    hotelsToDisplay.forEach(hotel => {
        const name = hotel.name || hotel.hotelName || hotel.title || 'Unknown Hotel';
        const city = hotel.city || hotel.location || hotel.address || 'Location unavailable';
        const price = hotel.price || hotel.pricePerNight || 'N/A';
        
        // BULLETPROOF IMAGE LOGIC
        const fallbackImage = 'https://placehold.co/600x400/e2e8f0/3182ce?text=No+Image+Available';
        let image = fallbackImage;
        
        // Only use the API image if it actually starts with 'http'
        if (hotel.image && typeof hotel.image === 'string' && hotel.image.startsWith('http')) {
            image = hotel.image;
        } else if (hotel.imageUrl && typeof hotel.imageUrl === 'string' && hotel.imageUrl.startsWith('http')) {
            image = hotel.imageUrl;
        }
        
        const card = document.createElement('div');
        card.className = 'hotel-card';
        
        card.innerHTML = `
            <img src="${image}" alt="${name}" class="hotel-image" onerror="this.src='${fallbackImage}'">
            <div class="hotel-info">
                <h3 class="hotel-title">${name}</h3>
                <p class="hotel-location">📍 ${city}</p>
                <div class="hotel-price">$${price} <span style="font-size: 0.9rem; color: #718096; font-weight: normal;">/ night</span></div>
                <button class="book-btn" onclick="bookHotel('${name.replace(/'/g, "")}')">Book Now</button>
            </div>
        `;
        
        grid.appendChild(card);
    });
}
// NEW FUNCTION: Redirects to the book page and passes the hotel name in the URL
function bookHotel(hotelName) {
    // encodeURIComponent makes sure spaces in the hotel name don't break the URL
    window.location.href = `book.html?hotel=${encodeURIComponent(hotelName)}`;
}

// Search functionality
function filterHotels(searchTerm) {
    const filteredResults = allHotels.filter(hotel => {
        const name = (hotel.name || hotel.hotelName || hotel.title || '').toLowerCase();
        const city = (hotel.city || hotel.location || hotel.address || '').toLowerCase();
        
        // Return true if the typed word is in the hotel name OR the city
        return name.includes(searchTerm) || city.includes(searchTerm);
    });
    
    renderHotels(filteredResults);
}