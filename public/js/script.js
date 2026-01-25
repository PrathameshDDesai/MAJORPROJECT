// Card search/filter functionality
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const cityFilter = document.getElementById('cityFilter');
    const genderFilter = document.getElementById('genderFilter');
    const listingCards = document.querySelectorAll('.listing-card');
    const noResults = document.getElementById('noResults');
    const listingCount = document.getElementById('listingCount');

    function filterListings() {
        if (!searchInput || !listingCards.length) return;

        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCity = cityFilter ? cityFilter.value.toLowerCase() : '';
        const selectedGender = genderFilter ? genderFilter.value : '';
        let visibleCount = 0;

        listingCards.forEach(card => {
            const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
            const locationText = card.querySelector('.card-text.text-muted')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.line-clamp-2')?.textContent.toLowerCase() || '';
            const cardCity = card.getAttribute('data-city')?.toLowerCase() || '';
            const cardGender = card.getAttribute('data-gender') || 'Any';
            const parentCol = card.closest('.col');

            // Check if card matches search term
            const matchesSearch = !searchTerm ||
                title.includes(searchTerm) ||
                locationText.includes(searchTerm) ||
                description.includes(searchTerm);

            // Check if card matches city filter
            const matchesCity = !selectedCity || cardCity === selectedCity;

            // Check if card matches gender filter
            // If listing has no gender set or is "Any", it should show in all results
            const matchesGender = !selectedGender ||
                cardGender === selectedGender ||
                cardGender === 'Any' ||
                !cardGender;

            if (matchesSearch && matchesCity && matchesGender) {
                parentCol.style.display = '';
                visibleCount++;
            } else {
                parentCol.style.display = 'none';
            }
        });

        // Update count
        if (listingCount) {
            listingCount.textContent = visibleCount;
        }

        // Show/hide no results message
        if (visibleCount === 0) {
            noResults?.classList.remove('d-none');
        } else {
            noResults?.classList.add('d-none');
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterListings);
    }

    if (cityFilter) {
        cityFilter.addEventListener('change', filterListings);
    }

    if (genderFilter) {
        genderFilter.addEventListener('change', filterListings);
    }


    // Make entire card clickable (already done with <a> tag)
    // Add click animation to cards
    document.querySelectorAll('.card-link').forEach(link => {
        link.addEventListener('click', function (e) {
            // If clicked on button inside card, don't trigger card click
            if (e.target.closest('.btn') || e.target.tagName === 'BUTTON') {
                e.stopPropagation();
                return;
            }

            // Add click feedback
            const card = this.querySelector('.listing-card');
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });
    });
});


//   // Import the functions you need from the SDKs you need
//   import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
//   import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
//   // TODO: Add SDKs for Firebase products that you want to use
//   // https://firebase.google.com/docs/web/setup#available-libraries

//   // Your web app's Firebase configuration
//   // For Firebase JS SDK v7.20.0 and later, measurementId is optional
//   const firebaseConfig = {
//     apiKey: "AIzaSyBgjM-VGXysJ5_tYjawbYSK0GoodKabD4w",
//     authDomain: "unirooms-96a65.firebaseapp.com",
//     projectId: "unirooms-96a65",
//     storageBucket: "unirooms-96a65.firebasestorage.app",
//     messagingSenderId: "1019153795400",
//     appId: "1:1019153795400:web:24320f7607ccc71eea8b7d",
//     measurementId: "G-TX5RL27FQH"
//   };

//   // Initialize Firebase
//   const app = initializeApp(firebaseConfig);
//   const analytics = getAnalytics(app);
