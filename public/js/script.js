// Card search/filter functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const listingCards = document.querySelectorAll('.listing-card');
    const noResults = document.getElementById('noResults');
    
    if (searchInput && listingCards.length > 0) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            let visibleCount = 0;
            
            listingCards.forEach(card => {
                const title = card.querySelector('.card-title').textContent.toLowerCase();
                const location = card.querySelector('.card-text.text-muted').textContent.toLowerCase();
                const description = card.querySelector('.line-clamp-2').textContent.toLowerCase();
                const parentCol = card.closest('.col');
                
                if (title.includes(searchTerm) || 
                    location.includes(searchTerm) || 
                    description.includes(searchTerm)) {
                    parentCol.style.display = '';
                    visibleCount++;
                } else {
                    parentCol.style.display = 'none';
                }
            });
            
            // Show/hide no results message
            if (visibleCount === 0 && searchTerm.length > 0) {
                noResults.classList.remove('d-none');
            } else {
                noResults.classList.add('d-none');
            }
        });
    }
    
    // Make entire card clickable (already done with <a> tag)
    // Add click animation to cards
    document.querySelectorAll('.card-link').forEach(link => {
        link.addEventListener('click', function(e) {
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