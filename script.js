// MTG Deck Builder - JavaScript
class MTGDeckBuilder {
    constructor() {
        this.currentDeck = [];
        this.decks = {};
        this.currentDeckName = 'default';
        this.searchResults = [];
        this.charts = {};
        this.selectedDeckKey = 'mtgSelectedDeck';
        
        this.init();
    }

    init() {
        this.loadDecks();
        this.setupEventListeners();
        this.updateDeckDisplay();
        this.updateStats();
        this.updateFiltersCount();
        this.toggleSubtypeFilter(); // Initialize subtype filter state
        this.toggleLandSubtypeFilter(); // Initialize land subtype filter state
        this.toggleSpellEffectFilter(); // Initialize spell effect filter state
        this.toggleArtifactSubtypeFilter(); // Initialize artifact subtype filter state
        this.toggleColorFilter(); // Initialize color filter state
        this.updateSearchPlaceholder(); // Initialize search placeholder
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('search-btn').addEventListener('click', () => this.searchCards());
        document.getElementById('filter-search-btn').addEventListener('click', () => this.searchWithFiltersOnly());
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchCards();
        });
        
        // Search type selector
        document.getElementById('search-type').addEventListener('change', () => {
            this.updateSearchPlaceholder();
        });

        // Filters
        document.getElementById('type-filter').addEventListener('change', () => {
            this.toggleSubtypeFilter();
            this.toggleLandSubtypeFilter();
            this.toggleSpellEffectFilter();
            this.toggleArtifactSubtypeFilter();
            this.toggleColorFilter();
            this.updateFiltersCount();
            this.searchCards();
        });
        document.getElementById('color-filter').addEventListener('change', () => {
            this.updateFiltersCount();
            this.searchCards();
        });
        document.getElementById('cmc-filter').addEventListener('change', () => {
            this.updateFiltersCount();
            this.searchCards();
        });
        
        // Multi-select filters
        document.querySelectorAll('.rarity-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFiltersCount();
                this.searchCards();
            });
        });
        
        document.querySelectorAll('.subtype-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFiltersCount();
                this.searchCards();
            });
        });
        
        document.querySelectorAll('.land-subtype-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFiltersCount();
                this.searchCards();
            });
        });
        
        document.querySelectorAll('.spell-effect-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFiltersCount();
                this.searchCards();
            });
        });
        
        document.querySelectorAll('.artifact-subtype-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFiltersCount();
                this.searchCards();
            });
        });
        
        // Subtype search functionality
        document.getElementById('subtype-search').addEventListener('input', (e) => {
            this.filterSubtypes(e.target.value);
        });
        
        // Land subtype search functionality
        document.getElementById('land-subtype-search').addEventListener('input', (e) => {
            this.filterLandSubtypes(e.target.value);
        });
        
        // Keyword search functionality
        document.getElementById('keyword-search').addEventListener('input', (e) => {
            this.filterKeywords(e.target.value);
        });
        
        // Rarity search functionality
        document.getElementById('rarity-search').addEventListener('input', (e) => {
            this.filterRarities(e.target.value);
        });
        
        // Spell effect search functionality
        document.getElementById('spell-effect-search').addEventListener('input', (e) => {
            this.filterSpellEffects(e.target.value);
        });
        
        // Artifact subtype search functionality
        document.getElementById('artifact-subtype-search').addEventListener('input', (e) => {
            this.filterArtifactSubtypes(e.target.value);
        });
        
        document.querySelectorAll('.keyword-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFiltersCount();
                this.searchCards();
            });
        });
        
        document.getElementById('format-filter').addEventListener('change', () => {
            this.updateFiltersCount();
            this.searchCards();
        });
        document.getElementById('legendary-filter').addEventListener('change', () => {
            this.updateFiltersCount();
            this.searchCards();
        });
        document.getElementById('clear-filters-btn').addEventListener('click', () => this.clearFilters());

        // Deck management
        document.getElementById('new-deck-btn').addEventListener('click', () => this.createNewDeck());
        document.getElementById('deck-selector').addEventListener('change', (e) => this.switchDeck(e.target.value));
        document.getElementById('export-deck-btn').addEventListener('click', () => this.exportDeck());
        document.getElementById('import-deck-btn').addEventListener('click', () => this.showImportModal());
        document.getElementById('shuffle-btn').addEventListener('click', () => this.shuffleDeck());
        document.getElementById('simulate-hand-btn').addEventListener('click', () => this.simulateHand());
        document.getElementById('view-deck-btn').addEventListener('click', () => this.viewDeck());
        document.getElementById('deck-search').addEventListener('input', (e) => this.filterDeckCards(e.target.value));
        document.getElementById('clear-deck-search').addEventListener('click', () => this.clearDeckSearch());

        // Modal controls
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.add('hidden');
            });
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Draw new hand button
        document.getElementById('draw-new-hand').addEventListener('click', () => {
            this.simulateHand();
        });
        
        // Import modal controls
        document.getElementById('import-deck-confirm').addEventListener('click', () => this.importDeck());
        document.getElementById('import-deck-cancel').addEventListener('click', () => this.hideImportModal());
    }

    updateSearchPlaceholder() {
        const searchType = document.getElementById('search-type').value;
        const searchInput = document.getElementById('search-input');
        
        if (searchType === 'oracle') {
            searchInput.placeholder = 'Ex: "draw a card", "destroy target creature", "deal 3 damage"';
        } else {
            searchInput.placeholder = 'Search cards...';
        }
    }

    async searchCards() {
        const query = document.getElementById('search-input').value.trim();
        const searchType = document.getElementById('search-type').value;
        const filters = this.buildFilters();
        
        console.log('searchCards chamada - Query:', query, 'Tipo:', searchType, 'Filtros:', filters);
        
        // If no query and no filters, don't search
        if (!query && !filters.trim()) {
            console.log('Nenhuma busca - sem query e sem filtros');
            return;
        }
        
        // Build the search query based on type
        let searchQuery = '';
        if (query) {
            if (searchType === 'oracle') {
                // Use oracle text search
                searchQuery = `oracle:"${query}"`;
            } else {
                // Use regular name search
                searchQuery = query;
            }
        }
        
        // Add filters if present
        if (filters.trim()) {
            if (searchQuery) {
                searchQuery = `${searchQuery} ${filters}`.trim();
            } else {
                searchQuery = filters;
            }
        }
        
        console.log('Query final:', searchQuery);

        this.showLoading(true);
        this.hideNoResults();

        try {
            const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data.object === 'error') {
                this.showNoResults();
                return;
            }

            this.searchResults = data.data || [];
            this.displaySearchResults();
        } catch (error) {
            console.error('Erro ao buscar cartas:', error);
            this.showNoResults();
        } finally {
            this.showLoading(false);
        }
    }

    async searchWithFiltersOnly() {
        const filters = this.buildFilters();
        if (!filters.trim()) {
            alert('Selecione pelo menos um filtro para buscar!');
            return;
        }

        this.showLoading(true);
        this.hideNoResults();

        try {
            const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(filters)}`);
            const data = await response.json();

            if (data.object === 'error') {
                this.showNoResults();
                return;
            }

            this.searchResults = data.data || [];
            this.displaySearchResults();
        } catch (error) {
            console.error('Erro ao buscar cartas:', error);
            this.showNoResults();
        } finally {
            this.showLoading(false);
        }
    }

    buildFilters() {
        let filters = [];

        const type = document.getElementById('type-filter').value;
        if (type) {
            if (type === 'token') {
                filters.push('is:token t:creature');
            } else {
                filters.push(`t:${type}`);
            }
        }

        const color = document.getElementById('color-filter').value;
        if (color) {
            // For single colors, use exact color match (exclusive)
            if (['w', 'u', 'b', 'r', 'g', 'c'].includes(color)) {
                filters.push(`c=${color}`);
            } else {
                // For multi-color combinations, use the normal syntax
                filters.push(`c:${color}`);
            }
        }

        const cmc = document.getElementById('cmc-filter').value;
        if (cmc) {
            if (cmc === '6+') {
                filters.push('cmc>=6');
            } else {
                filters.push(`cmc:${cmc}`);
            }
        }

        // Multi-select rarity
        const selectedRarities = Array.from(document.querySelectorAll('.rarity-checkbox:checked')).map(cb => cb.value);
        if (selectedRarities.length > 0) {
            if (selectedRarities.length === 1) {
                filters.push(`r:${selectedRarities[0]}`);
            } else {
                const rarityQuery = selectedRarities.map(r => `r:${r}`).join(' OR ');
                filters.push(`(${rarityQuery})`);
            }
        }

        // Multi-select subtypes (only if creature type is selected)
        const selectedType = document.getElementById('type-filter').value;
        if (selectedType === 'creature' || selectedType === 'token') {
            const selectedSubtypes = Array.from(document.querySelectorAll('.subtype-checkbox:checked')).map(cb => cb.value);
            if (selectedSubtypes.length > 0) {
                if (selectedSubtypes.length === 1) {
                    filters.push(`t:${selectedSubtypes[0]}`);
                } else {
                    const subtypeQuery = selectedSubtypes.map(s => `t:${s}`).join(' OR ');
                    filters.push(`(${subtypeQuery})`);
                }
            }
        }
        
        // Multi-select land subtypes (only if land type is selected)
        if (selectedType === 'land') {
            const selectedLandSubtypes = Array.from(document.querySelectorAll('.land-subtype-checkbox:checked')).map(cb => cb.value);
            if (selectedLandSubtypes.length > 0) {
                if (selectedLandSubtypes.length === 1) {
                    filters.push(`t:${selectedLandSubtypes[0]}`);
                } else {
                    const landSubtypeQuery = selectedLandSubtypes.map(s => `t:${s}`).join(' OR ');
                    filters.push(`(${landSubtypeQuery})`);
                }
            }
        }

        // Multi-select keywords
        const selectedKeywords = Array.from(document.querySelectorAll('.keyword-checkbox:checked')).map(cb => cb.value);
        if (selectedKeywords.length > 0) {
            if (selectedKeywords.length === 1) {
                filters.push(`keyword:${selectedKeywords[0]}`);
            } else {
                const keywordQuery = selectedKeywords.map(k => `keyword:${k}`).join(' OR ');
                filters.push(`(${keywordQuery})`);
            }
        }
        
        // Multi-select spell effects (only if instant, sorcery or enchantment type is selected)
        if (selectedType === 'instant' || selectedType === 'sorcery' || selectedType === 'enchantment') {
            const selectedSpellEffects = Array.from(document.querySelectorAll('.spell-effect-checkbox:checked')).map(cb => cb.value);
            if (selectedSpellEffects.length > 0) {
                const spellEffectQueries = selectedSpellEffects.map(effect => {
                    switch(effect) {
                        case 'draw': return 'oracle:"draw a card"';
                        case 'removal': return 'oracle:"destroy target"';
                        case 'burn': return 'oracle:"damage"';
                        case 'counter': return 'oracle:"counter target"';
                        case 'token': return 'oracle:"create a token"';
                        case 'pump': return 'oracle:"+1/+1"';
                        case 'heal': return 'oracle:"gain life"';
                        case 'tutor': return 'oracle:"search your library"';
                        default: return '';
                    }
                }).filter(q => q);
                
                if (spellEffectQueries.length > 0) {
                    if (spellEffectQueries.length === 1) {
                        filters.push(spellEffectQueries[0]);
                    } else {
                        filters.push(`(${spellEffectQueries.join(' OR ')})`);
                    }
                }
            }
        }
        
        // Multi-select artifact subtypes (only if artifact type is selected)
        if (selectedType === 'artifact') {
            const selectedArtifactSubtypes = Array.from(document.querySelectorAll('.artifact-subtype-checkbox:checked')).map(cb => cb.value);
            if (selectedArtifactSubtypes.length > 0) {
                if (selectedArtifactSubtypes.length === 1) {
                    filters.push(`t:${selectedArtifactSubtypes[0]}`);
                } else {
                    const artifactSubtypeQuery = selectedArtifactSubtypes.map(s => `t:${s}`).join(' OR ');
                    filters.push(`(${artifactSubtypeQuery})`);
                }
            }
        }

        const format = document.getElementById('format-filter').value;
        if (format) {
            if (format === 'pauper') {
                filters.push('r:common');
            } else {
                filters.push(`f:${format}`);
            }
        }

        const legendary = document.getElementById('legendary-filter').checked;
        if (legendary) filters.push('is:legendary');

        const result = filters.join(' ');
        return result;
    }

    getActiveFiltersCount() {
        let count = 0;
        
        if (document.getElementById('type-filter').value) count++;
        if (document.getElementById('color-filter').value && !document.getElementById('color-filter').disabled) count++;
        if (document.getElementById('cmc-filter').value) count++;
        
        // Count multi-select filters
        const selectedRarities = document.querySelectorAll('.rarity-checkbox:checked').length;
        if (selectedRarities > 0) count++;
        
        // Only count subtypes if creature or token type is selected
        const selectedType = document.getElementById('type-filter').value;
        if (selectedType === 'creature' || selectedType === 'token') {
            const selectedSubtypes = document.querySelectorAll('.subtype-checkbox:checked').length;
            if (selectedSubtypes > 0) count++;
        }
        
        // Only count land subtypes if land type is selected
        if (selectedType === 'land') {
            const selectedLandSubtypes = document.querySelectorAll('.land-subtype-checkbox:checked').length;
            if (selectedLandSubtypes > 0) count++;
        }
        
        // Only count spell effects if instant, sorcery or enchantment type is selected
        if (selectedType === 'instant' || selectedType === 'sorcery' || selectedType === 'enchantment') {
            const selectedSpellEffects = document.querySelectorAll('.spell-effect-checkbox:checked').length;
            if (selectedSpellEffects > 0) count++;
        }
        
        // Only count artifact subtypes if artifact type is selected
        if (selectedType === 'artifact') {
            const selectedArtifactSubtypes = document.querySelectorAll('.artifact-subtype-checkbox:checked').length;
            if (selectedArtifactSubtypes > 0) count++;
        }
        
        const selectedKeywords = document.querySelectorAll('.keyword-checkbox:checked').length;
        if (selectedKeywords > 0) count++;
        
        if (document.getElementById('format-filter').value) count++;
        if (document.getElementById('legendary-filter').checked) count++;
        
        
        return count;
    }

    updateFiltersCount() {
        const count = this.getActiveFiltersCount();
        document.getElementById('active-filters-count').textContent = count;
        
        // Update button appearance based on active filters
        const filterBtn = document.getElementById('filter-search-btn');
        if (count > 0) {
            filterBtn.style.background = 'linear-gradient(135deg, #444444 0%, #666666 100%)';
            filterBtn.style.borderColor = '#888888';
        } else {
            filterBtn.style.background = '#1a1a1a';
            filterBtn.style.borderColor = '#444444';
        }
    }

    filterSubtypes(searchTerm) {
        const options = document.querySelectorAll('#subtype-options .multi-select-option');
        const term = searchTerm.toLowerCase();
        
        options.forEach(option => {
            const span = option.querySelector('span');
            const text = span.textContent.toLowerCase();
            
            if (text.includes(term)) {
                option.classList.remove('hidden');
            } else {
                option.classList.add('hidden');
            }
        });
    }

    toggleSubtypeFilter() {
        const typeFilter = document.getElementById('type-filter').value;
        const subtypeContainer = document.querySelector('.filter-column:nth-child(4)');
        const subtypeCheckboxes = document.querySelectorAll('.subtype-checkbox');
        const subtypeSearch = document.getElementById('subtype-search');
        
        if (typeFilter === 'creature' || typeFilter === 'token') {
            // Enable subtype filter
            subtypeContainer.style.opacity = '1';
            subtypeContainer.style.pointerEvents = 'auto';
            subtypeCheckboxes.forEach(checkbox => {
                checkbox.disabled = false;
            });
            subtypeSearch.disabled = false;
        } else {
            // Disable subtype filter
            subtypeContainer.style.opacity = '0.5';
            subtypeContainer.style.pointerEvents = 'none';
            subtypeCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                checkbox.disabled = true;
            });
            subtypeSearch.value = '';
            subtypeSearch.disabled = true;
            this.filterSubtypes(''); // Show all options
        }
    }
    
    filterLandSubtypes(searchTerm) {
        const options = document.querySelectorAll('#land-subtype-options .multi-select-option');
        const term = searchTerm.toLowerCase();
        
        options.forEach(option => {
            const span = option.querySelector('span');
            const text = span.textContent.toLowerCase();
            
            if (text.includes(term)) {
                option.classList.remove('hidden');
            } else {
                option.classList.add('hidden');
            }
        });
    }
    
    filterKeywords(searchTerm) {
        const options = document.querySelectorAll('#keyword-options .multi-select-option');
        const term = searchTerm.toLowerCase();
        
        options.forEach(option => {
            const span = option.querySelector('span');
            const text = span.textContent.toLowerCase();
            
            if (text.includes(term)) {
                option.classList.remove('hidden');
            } else {
                option.classList.add('hidden');
            }
        });
    }
    
    filterRarities(searchTerm) {
        const options = document.querySelectorAll('#rarity-options .multi-select-option');
        const term = searchTerm.toLowerCase();
        
        options.forEach(option => {
            const span = option.querySelector('span');
            const text = span.textContent.toLowerCase();
            
            if (text.includes(term)) {
                option.classList.remove('hidden');
            } else {
                option.classList.add('hidden');
            }
        });
    }
    
    filterSpellEffects(searchTerm) {
        const options = document.querySelectorAll('#spell-effect-options .multi-select-option');
        const term = searchTerm.toLowerCase();
        
        options.forEach(option => {
            const span = option.querySelector('span');
            const text = span.textContent.toLowerCase();
            
            if (text.includes(term)) {
                option.classList.remove('hidden');
            } else {
                option.classList.add('hidden');
            }
        });
    }
    
    filterArtifactSubtypes(searchTerm) {
        const options = document.querySelectorAll('#artifact-subtype-options .multi-select-option');
        const term = searchTerm.toLowerCase();
        
        options.forEach(option => {
            const span = option.querySelector('span');
            const text = span.textContent.toLowerCase();
            
            if (text.includes(term)) {
                option.classList.remove('hidden');
            } else {
                option.classList.add('hidden');
            }
        });
    }
    
    toggleLandSubtypeFilter() {
        const typeFilter = document.getElementById('type-filter').value;
        const landSubtypeContainer = document.querySelector('.filter-column:nth-child(6)');
        const landSubtypeCheckboxes = document.querySelectorAll('.land-subtype-checkbox');
        const landSubtypeSearch = document.getElementById('land-subtype-search');
        
        if (typeFilter === 'land') {
            // Enable land subtype filter
            landSubtypeContainer.style.opacity = '1';
            landSubtypeContainer.style.pointerEvents = 'auto';
            landSubtypeCheckboxes.forEach(checkbox => {
                checkbox.disabled = false;
            });
            landSubtypeSearch.disabled = false;
            
        } else {
            // Disable land subtype filter
            landSubtypeContainer.style.opacity = '0.5';
            landSubtypeContainer.style.pointerEvents = 'none';
            landSubtypeCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                checkbox.disabled = true;
            });
            landSubtypeSearch.value = '';
            landSubtypeSearch.disabled = true;
            this.filterLandSubtypes(''); // Show all options
        }
    }
    
    
    toggleColorFilter() {
        const typeFilter = document.getElementById('type-filter').value;
        const colorFilter = document.getElementById('color-filter');
        const colorLabel = document.querySelector('label[for="color-filter"]');
        
        if (typeFilter === 'land') {
            // Disable color filter for lands
            colorFilter.disabled = true;
            colorFilter.value = '';
            colorLabel.style.opacity = '0.5';
            colorLabel.style.pointerEvents = 'none';
        } else {
            // Enable color filter for other types
            colorFilter.disabled = false;
            colorLabel.style.opacity = '1';
            colorLabel.style.pointerEvents = 'auto';
        }
    }
    
    toggleSpellEffectFilter() {
        const typeFilter = document.getElementById('type-filter').value;
        const spellEffectContainer = document.querySelector('.filter-column:nth-child(7)');
        const spellEffectCheckboxes = document.querySelectorAll('.spell-effect-checkbox');
        const spellEffectSearch = document.getElementById('spell-effect-search');
        
        if (typeFilter === 'instant' || typeFilter === 'sorcery' || typeFilter === 'enchantment') {
            // Enable spell effect filter
            spellEffectContainer.style.opacity = '1';
            spellEffectContainer.style.pointerEvents = 'auto';
            spellEffectCheckboxes.forEach(checkbox => {
                checkbox.disabled = false;
            });
            spellEffectSearch.disabled = false;
        } else {
            // Disable spell effect filter
            spellEffectContainer.style.opacity = '0.5';
            spellEffectContainer.style.pointerEvents = 'none';
            spellEffectCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                checkbox.disabled = true;
            });
            spellEffectSearch.value = '';
            spellEffectSearch.disabled = true;
            this.filterSpellEffects(''); // Show all options
        }
    }
    
    toggleArtifactSubtypeFilter() {
        const typeFilter = document.getElementById('type-filter').value;
        const artifactSubtypeContainer = document.querySelector('.filter-column:nth-child(8)');
        const artifactSubtypeCheckboxes = document.querySelectorAll('.artifact-subtype-checkbox');
        const artifactSubtypeSearch = document.getElementById('artifact-subtype-search');
        
        if (typeFilter === 'artifact') {
            // Enable artifact subtype filter
            artifactSubtypeContainer.style.opacity = '1';
            artifactSubtypeContainer.style.pointerEvents = 'auto';
            artifactSubtypeCheckboxes.forEach(checkbox => {
                checkbox.disabled = false;
            });
            artifactSubtypeSearch.disabled = false;
        } else {
            // Disable artifact subtype filter
            artifactSubtypeContainer.style.opacity = '0.5';
            artifactSubtypeContainer.style.pointerEvents = 'none';
            artifactSubtypeCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                checkbox.disabled = true;
            });
            artifactSubtypeSearch.value = '';
            artifactSubtypeSearch.disabled = true;
            this.filterArtifactSubtypes(''); // Show all options
        }
    }

    clearFilters() {
        document.getElementById('type-filter').value = '';
        document.getElementById('color-filter').value = '';
        document.getElementById('cmc-filter').value = '';
        
        // Clear multi-select filters
        document.querySelectorAll('.rarity-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelectorAll('.subtype-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelectorAll('.land-subtype-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelectorAll('.spell-effect-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelectorAll('.artifact-subtype-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelectorAll('.keyword-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear subtype search
        document.getElementById('subtype-search').value = '';
        this.filterSubtypes(''); // Show all options
        
        // Clear land subtype search
        document.getElementById('land-subtype-search').value = '';
        this.filterLandSubtypes(''); // Show all options
        
        // Clear keyword search
        document.getElementById('keyword-search').value = '';
        this.filterKeywords(''); // Show all options
        
        // Clear rarity search
        document.getElementById('rarity-search').value = '';
        this.filterRarities(''); // Show all options
        
        // Clear spell effect search
        document.getElementById('spell-effect-search').value = '';
        this.filterSpellEffects(''); // Show all options
        
        // Clear artifact subtype search
        document.getElementById('artifact-subtype-search').value = '';
        this.filterArtifactSubtypes(''); // Show all options
        
        document.getElementById('format-filter').value = '';
        document.getElementById('legendary-filter').checked = false;
        
        // Reset filter states
        this.toggleSubtypeFilter();
        this.toggleLandSubtypeFilter();
        this.toggleSpellEffectFilter();
        this.toggleArtifactSubtypeFilter();
        this.toggleColorFilter();
        
        this.updateFiltersCount();
        this.searchCards();
    }

    displaySearchResults() {
        const container = document.getElementById('search-results');
        container.innerHTML = '';

        if (this.searchResults.length === 0) {
            this.showNoResults();
            return;
        }

        this.searchResults.forEach(card => {
            const cardElement = this.createCardElement(card);
            container.appendChild(cardElement);
        });
    }

    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.addEventListener('click', () => this.showCardModal(card));

        // Improved image URL logic with better fallbacks
        let imageUrl = '';
        if (card.image_uris?.normal) {
            imageUrl = card.image_uris.normal;
        } else if (card.image_uris?.small) {
            imageUrl = card.image_uris.small;
        } else if (card.card_faces?.[0]?.image_uris?.normal) {
            imageUrl = card.card_faces[0].image_uris.normal;
        } else if (card.card_faces?.[0]?.image_uris?.small) {
            imageUrl = card.card_faces[0].image_uris.small;
        } else {
            imageUrl = 'https://via.placeholder.com/200x280/1a1a1a/888888?text=No+Image';
        }

        cardDiv.innerHTML = `
            <img src="${imageUrl}" alt="${card.name}" class="card-image" loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/200x280/1a1a1a/888888?text=No+Image'">
            <div class="card-overlay">
                <button class="add-to-deck-overlay" onclick="event.stopPropagation(); deckBuilder.addToDeck('${card.id}')">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;

        return cardDiv;
    }

    addToDeck(cardId) {
        // First try to find the card in the current deck
        let card = this.currentDeck.find(c => c.id === cardId);
        
        // If not found in deck, try to find in search results
        if (!card) {
            card = this.searchResults.find(c => c.id === cardId);
        }
        
        if (!card) return;

        const existingCard = this.currentDeck.find(c => c.id === cardId);
        if (existingCard) {
            existingCard.quantity += 1;
        } else {
            this.currentDeck.push({
                ...card,
                quantity: 1
            });
        }

        this.saveDecks();
        this.updateDeckDisplay();
        this.updateStats();
    }

    removeFromDeck(cardId) {
        const cardIndex = this.currentDeck.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return;

        const card = this.currentDeck[cardIndex];
        if (card.quantity > 1) {
            card.quantity -= 1;
        } else {
            this.currentDeck.splice(cardIndex, 1);
        }

        this.saveDecks();
        this.updateDeckDisplay();
        this.updateStats();
    }

    updateDeckDisplay() {
        const container = document.getElementById('deck-cards');
        const countElement = document.getElementById('deck-count');
        
        countElement.textContent = this.currentDeck.reduce((total, card) => total + card.quantity, 0);

        if (this.currentDeck.length === 0) {
            container.innerHTML = `
                <div class="empty-deck">
                    <i class="fas fa-plus-circle"></i>
                    <p>Adicione cartas ao seu deck para começar</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        this.currentDeck.forEach(card => {
            const cardElement = this.createDeckCardElement(card);
            container.appendChild(cardElement);
        });
    }

    createDeckCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'deck-card';

        // Improved image URL logic with better fallbacks
        let imageUrl = '';
        if (card.image_uris?.normal) {
            imageUrl = card.image_uris.normal;
        } else if (card.image_uris?.small) {
            imageUrl = card.image_uris.small;
        } else if (card.card_faces?.[0]?.image_uris?.normal) {
            imageUrl = card.card_faces[0].image_uris.normal;
        } else if (card.card_faces?.[0]?.image_uris?.small) {
            imageUrl = card.card_faces[0].image_uris.small;
        } else {
            imageUrl = 'https://via.placeholder.com/60x84/1a1a1a/888888?text=No+Image';
        }

        cardDiv.innerHTML = `
            <div class="deck-card-image-container">
                <img src="${imageUrl}" alt="${card.name}" class="deck-card-image"
                     onerror="this.src='https://via.placeholder.com/60x84/1a1a1a/888888?text=No+Image'"
                     onmouseenter="deckBuilder.showCardPreview(event, '${card.id}')"
                     onmouseleave="deckBuilder.hideCardPreview()"
                     onmousemove="deckBuilder.updateCardPreviewPosition(event)">
            </div>
            <div class="deck-card-content">
                <div class="deck-card-info">
                    <div class="deck-card-name">${card.name}</div>
                    <div class="deck-card-type">${card.type_line}</div>
                </div>
                <div class="deck-card-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="deckBuilder.removeFromDeck('${card.id}')" ${card.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span class="quantity">${card.quantity}</span>
                        <button class="quantity-btn" onclick="deckBuilder.addToDeck('${card.id}')">+</button>
                    </div>
                    <button class="remove-card" onclick="deckBuilder.removeFromDeck('${card.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        return cardDiv;
    }

    showCardPreview(event, cardId) {
        // Find the card in current deck first
        let card = this.currentDeck.find(c => c.id === cardId);
        
        // If not found in deck, try to find in search results
        if (!card) {
            card = this.searchResults.find(c => c.id === cardId);
        }
        
        if (!card) return;

        // Create or get preview element
        let preview = document.getElementById('card-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.id = 'card-preview';
            preview.className = 'card-preview';
            document.body.appendChild(preview);
        }

        // Set card image with improved fallbacks
        let imageUrl = '';
        if (card.image_uris?.large) {
            imageUrl = card.image_uris.large;
        } else if (card.image_uris?.normal) {
            imageUrl = card.image_uris.normal;
        } else if (card.card_faces?.[0]?.image_uris?.large) {
            imageUrl = card.card_faces[0].image_uris.large;
        } else if (card.card_faces?.[0]?.image_uris?.normal) {
            imageUrl = card.card_faces[0].image_uris.normal;
        } else {
            imageUrl = 'https://via.placeholder.com/488x680/1a1a1a/888888?text=No+Image';
        }

        preview.innerHTML = `
            <div class="card-preview-content">
                <img src="${imageUrl}" alt="${card.name}" class="card-preview-image">
                <div class="card-preview-name">${card.name}</div>
            </div>
        `;

        // Position the preview
        this.updateCardPreviewPosition(event);
        preview.classList.add('visible');
    }

    hideCardPreview() {
        const preview = document.getElementById('card-preview');
        if (preview) {
            preview.classList.remove('visible');
        }
    }

    updateCardPreviewPosition(event) {
        const preview = document.getElementById('card-preview');
        if (!preview) return;

        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const previewRect = preview.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate position (offset from mouse)
        let left = mouseX + 20;
        let top = mouseY - 20;

        // Adjust if preview would go off screen
        if (left + previewRect.width > viewportWidth) {
            left = mouseX - previewRect.width - 20;
        }
        if (top + previewRect.height > viewportHeight) {
            top = viewportHeight - previewRect.height - 20;
        }
        if (top < 0) {
            top = 20;
        }

        preview.style.left = `${left}px`;
        preview.style.top = `${top}px`;
    }

    showCardModal(card) {
        const modal = document.getElementById('card-modal');
        const content = document.getElementById('modal-card-content');

        // Improved image URL logic with better fallbacks
        let imageUrl = '';
        if (card.image_uris?.large) {
            imageUrl = card.image_uris.large;
        } else if (card.image_uris?.normal) {
            imageUrl = card.image_uris.normal;
        } else if (card.card_faces?.[0]?.image_uris?.large) {
            imageUrl = card.card_faces[0].image_uris.large;
        } else if (card.card_faces?.[0]?.image_uris?.normal) {
            imageUrl = card.card_faces[0].image_uris.normal;
        } else {
            imageUrl = 'https://via.placeholder.com/400x560/1a1a1a/888888?text=No+Image';
        }

        content.innerHTML = `
            <img src="${imageUrl}" alt="${card.name}" style="max-width: 100%; height: auto; max-height: 300px; border-radius: 8px; margin-bottom: 1rem;"
                 onerror="this.src='https://via.placeholder.com/400x560/1a1a1a/888888?text=No+Image'">
            <div style="text-align: center;">
                <h3 style="margin-bottom: 0.5rem; color: #e5e5e5;">${card.name}</h3>
                <p style="margin-bottom: 0.5rem; color: #888888;"><strong>Tipo:</strong> ${card.type_line}</p>
                <p style="margin-bottom: 0.5rem; color: #888888;"><strong>Custo de Mana:</strong> ${card.mana_cost || card.cmc}</p>
                ${card.oracle_text ? `<p style="margin-bottom: 1rem; color: #888888; font-size: 0.9rem; line-height: 1.4;"><strong>Texto:</strong><br>${card.oracle_text.replace(/\n/g, '<br>')}</p>` : ''}
                <button class="btn btn-primary" onclick="deckBuilder.addToDeck('${card.id}'); document.getElementById('card-modal').classList.add('hidden');">
                    <i class="fas fa-plus"></i> Adicionar ao Deck
                </button>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    filterDeckCards(searchTerm) {
        const deckCards = document.querySelectorAll('.deck-card');
        const clearBtn = document.getElementById('clear-deck-search');
        
        // Show/hide clear button
        if (searchTerm.trim()) {
            clearBtn.style.display = 'block';
        } else {
            clearBtn.style.display = 'none';
        }
        
        deckCards.forEach(card => {
            const cardName = card.querySelector('.deck-card-name').textContent.toLowerCase();
            const cardType = card.querySelector('.deck-card-type').textContent.toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            
            const matches = cardName.includes(searchLower) || cardType.includes(searchLower);
            
            if (matches) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    clearDeckSearch() {
        const searchInput = document.getElementById('deck-search');
        const clearBtn = document.getElementById('clear-deck-search');
        
        searchInput.value = '';
        clearBtn.style.display = 'none';
        
        // Show all cards
        const deckCards = document.querySelectorAll('.deck-card');
        deckCards.forEach(card => {
            card.style.display = 'block';
        });
    }

    simulateHand() {
        if (this.currentDeck.length === 0) {
            alert('Adicione cartas ao deck primeiro!');
            return;
        }

        const deck = [];
        this.currentDeck.forEach(card => {
            for (let i = 0; i < card.quantity; i++) {
                deck.push(card);
            }
        });

        // Shuffle deck
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        // Draw 7 cards
        const hand = deck.slice(0, 7);
        this.displayHand(hand);
    }

    displayHand(hand) {
        const modal = document.getElementById('hand-modal');
        const container = document.getElementById('hand-cards');

        container.innerHTML = '';
        hand.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'hand-card';

            const imageUrl = card.image_uris?.normal || 
                            card.card_faces?.[0]?.image_uris?.normal || 
                            'https://via.placeholder.com/120x168?text=No+Image';

            cardDiv.innerHTML = `
                <img src="${imageUrl}" alt="${card.name}" class="hand-card-image"
                     onmouseenter="deckBuilder.showCardPreview(event, '${card.id}')"
                     onmouseleave="deckBuilder.hideCardPreview()"
                     onmousemove="deckBuilder.updateCardPreviewPosition(event)">
            `;

            container.appendChild(cardDiv);
        });

        modal.classList.remove('hidden');
    }

    shuffleDeck() {
        if (this.currentDeck.length === 0) {
            alert('Adicione cartas ao deck primeiro!');
            return;
        }

        // Shuffle the deck array
        for (let i = this.currentDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.currentDeck[i], this.currentDeck[j]] = [this.currentDeck[j], this.currentDeck[i]];
        }

        this.saveDecks();
        this.updateDeckDisplay();
        alert('Deck embaralhado!');
    }

    viewDeck() {
        if (this.currentDeck.length === 0) {
            alert('Adicione cartas ao deck primeiro!');
            return;
        }

        // Save current deck data to localStorage for the deck view page
        localStorage.setItem('currentDeckData', JSON.stringify({
            deckName: this.currentDeckName,
            cards: this.currentDeck
        }));

        // Open deck view page in new tab
        window.open('deck-view.html', '_blank');
    }

    updateStats() {
        this.updateGeneralStats();
        this.updateManaCurveChart();
        this.updateColorDistributionChart();
        this.updateTypeDistributionChart();
    }

    updateGeneralStats() {
        const totalCards = this.currentDeck.reduce((total, card) => total + card.quantity, 0);
        
        // Calculate CMC excluding lands
        const nonLandCards = this.currentDeck.filter(card => !card.type_line.toLowerCase().includes('land'));
        const nonLandTotalCards = nonLandCards.reduce((total, card) => total + card.quantity, 0);
        const totalCmc = nonLandCards.reduce((total, card) => total + (card.cmc * card.quantity), 0);
        const avgCmc = nonLandTotalCards > 0 ? (totalCmc / nonLandTotalCards).toFixed(1) : '0.0';
        
        const landCount = this.currentDeck
            .filter(card => card.type_line.toLowerCase().includes('land'))
            .reduce((total, card) => total + card.quantity, 0);

        // Calculate recommended land count: CMC average * 10
        const recommendedLands = Math.round(parseFloat(avgCmc) * 10);

        document.getElementById('total-cards').textContent = totalCards;
        document.getElementById('avg-cmc').textContent = avgCmc;
        document.getElementById('land-count').textContent = landCount;
        document.getElementById('recommended-lands').textContent = recommendedLands;
    }

    updateManaCurveChart() {
        const ctx = document.getElementById('mana-curve-chart').getContext('2d');
        
        // Destroy existing chart
        if (this.charts.manaCurve) {
            this.charts.manaCurve.destroy();
        }

        const cmcData = {};
        this.currentDeck.forEach(card => {
            const cmc = Math.min(card.cmc, 7); // Cap at 7+ for better visualization
            cmcData[cmc] = (cmcData[cmc] || 0) + card.quantity;
        });

        const labels = Array.from({length: 8}, (_, i) => i === 7 ? '7+' : i.toString());
        const data = labels.map((_, i) => cmcData[i] || 0);

        this.charts.manaCurve = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade',
                    data: data,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateColorDistributionChart() {
        const ctx = document.getElementById('color-distribution-chart').getContext('2d');
        
        if (this.charts.colorDistribution) {
            this.charts.colorDistribution.destroy();
        }

        const colorData = { 'W': 0, 'U': 0, 'B': 0, 'R': 0, 'G': 0, 'C': 0 };
        
        this.currentDeck.forEach(card => {
            const manaCost = card.mana_cost || '';
            const colors = this.extractColors(manaCost);
            
            if (colors.length === 0) {
                colorData['C'] += card.quantity;
            } else {
                colors.forEach(color => {
                    colorData[color] += card.quantity;
                });
            }
        });

        const labels = ['Branco', 'Azul', 'Preto', 'Vermelho', 'Verde', 'Incolor'];
        const data = Object.values(colorData);
        const colors = ['#F7F7F7', '#0E68AB', '#150B00', '#D3202A', '#00733E', '#CAC5C0'];

        this.charts.colorDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateTypeDistributionChart() {
        const ctx = document.getElementById('type-distribution-chart').getContext('2d');
        
        if (this.charts.typeDistribution) {
            this.charts.typeDistribution.destroy();
        }

        const typeData = {};
        
        this.currentDeck.forEach(card => {
            const typeLine = card.type_line.toLowerCase();
            let type = 'Outros';
            
            if (typeLine.includes('creature')) type = 'Criaturas';
            else if (typeLine.includes('land')) type = 'Terrenos';
            else if (typeLine.includes('instant')) type = 'Instantâneos';
            else if (typeLine.includes('sorcery')) type = 'Feitiços';
            else if (typeLine.includes('enchantment')) type = 'Encantamentos';
            else if (typeLine.includes('artifact')) type = 'Artefatos';
            else if (typeLine.includes('planeswalker')) type = 'Planeswalkers';
            
            typeData[type] = (typeData[type] || 0) + card.quantity;
        });

        const labels = Object.keys(typeData);
        const data = Object.values(typeData);

        this.charts.typeDistribution = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                        '#9966FF', '#FF9F40', '#FF6384'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    extractColors(manaCost) {
        const colorMap = {
            'W': 'W', 'U': 'U', 'B': 'B', 'R': 'R', 'G': 'G'
        };
        
        const colors = [];
        const regex = /[WUBRG]/g;
        let match;
        
        while ((match = regex.exec(manaCost)) !== null) {
            if (!colors.includes(match[0])) {
                colors.push(match[0]);
            }
        }
        
        return colors;
    }

    createNewDeck() {
        const deckName = prompt('Nome do novo deck:');
        if (!deckName || deckName.trim() === '') return;

        const cleanName = deckName.trim();
        if (this.decks[cleanName]) {
            alert('Já existe um deck com esse nome!');
            return;
        }

        this.decks[cleanName] = [];
        this.currentDeckName = cleanName;
        this.currentDeck = this.decks[cleanName];
        
        // Save the selected deck to localStorage
        localStorage.setItem(this.selectedDeckKey, this.currentDeckName);
        
        this.updateDeckSelector();
        this.saveDecks();
        this.updateDeckDisplay();
        this.updateStats();
    }

    switchDeck(deckName) {
        if (deckName === 'default') {
            this.currentDeckName = 'default';
            this.currentDeck = this.decks.default || [];
        } else {
            this.currentDeckName = deckName;
            this.currentDeck = this.decks[deckName] || [];
        }
        
        // Save the selected deck to localStorage
        localStorage.setItem(this.selectedDeckKey, this.currentDeckName);
        
        this.updateDeckDisplay();
        this.updateStats();
    }

    updateDeckSelector() {
        const selector = document.getElementById('deck-selector');
        selector.innerHTML = '<option value="default">Deck Principal</option>';
        
        Object.keys(this.decks).forEach(deckName => {
            if (deckName !== 'default') {
                const option = document.createElement('option');
                option.value = deckName;
                option.textContent = deckName;
                selector.appendChild(option);
            }
        });
        
        selector.value = this.currentDeckName;
    }

    exportDeck() {
        if (this.currentDeck.length === 0) {
            alert('Adicione cartas ao deck primeiro!');
            return;
        }

        let decklist = `# ${this.currentDeckName}\n\n`;
        
        this.currentDeck.forEach(card => {
            decklist += `${card.quantity} ${card.name}\n`;
        });

        // Create and download file
        const blob = new Blob([decklist], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentDeckName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showImportModal() {
        document.getElementById('import-modal').classList.remove('hidden');
        document.getElementById('import-textarea').value = '';
        document.getElementById('import-textarea').focus();
    }

    hideImportModal() {
        document.getElementById('import-modal').classList.add('hidden');
    }

    async importDeck() {
        const decklistText = document.getElementById('import-textarea').value.trim();
        console.log('Import deck called, text:', decklistText);
        
        if (!decklistText) {
            alert('Cole um decklist válido!');
            return;
        }

        // Show loading state
        const importBtn = document.getElementById('import-deck-confirm');
        const originalText = importBtn.innerHTML;
        importBtn.disabled = true;
        importBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importando...';

        try {
            const lines = decklistText.split('\n').filter(line => line.trim() && !line.startsWith('#'));
            console.log('Parsed lines:', lines);
            const importedCards = [];
            
            for (const line of lines) {
                const match = line.match(/^(\d+)\s+(.+)$/);
                console.log('Processing line:', line, 'Match:', match);
                if (match) {
                    const quantity = parseInt(match[1]);
                    const cardName = match[2].trim();
                    console.log('Found card:', cardName, 'Quantity:', quantity);
                    
                    if (quantity > 0 && cardName) {
                        // Search for the card using Scryfall API
                        try {
                            console.log('Searching for card:', cardName);
                            const response = await fetch(`https://api.scryfall.com/cards/search?q=!"${cardName}"`);
                            console.log('API response status:', response.status);
                            if (response.ok) {
                                const data = await response.json();
                                console.log('API response data:', data);
                                if (data.data && data.data.length > 0) {
                                    // Find the exact match or use the first result
                                    let card = data.data.find(c => c.name.toLowerCase() === cardName.toLowerCase());
                                    if (!card) {
                                        card = data.data[0];
                                    }
                                    console.log('Found card data:', card.name);
                                    for (let i = 0; i < quantity; i++) {
                                        importedCards.push({
                                            ...card,
                                            quantity: 1
                                        });
                                    }
                                } else {
                                    console.warn(`Card not found: ${cardName}`);
                                }
                            }
                        } catch (error) {
                            console.warn(`Error searching for card: ${cardName}`, error);
                        }
                    }
                }
            }

            console.log('Total imported cards:', importedCards.length);
            if (importedCards.length === 0) {
                alert('Nenhuma carta válida encontrada no decklist!');
                return;
            }

            // Clear current deck and add imported cards
            console.log('Clearing current deck and adding imported cards');
            this.currentDeck = [];
            importedCards.forEach(card => {
                const existingCard = this.currentDeck.find(c => c.id === card.id);
                if (existingCard) {
                    existingCard.quantity += 1;
                } else {
                    this.currentDeck.push(card);
                }
            });

            console.log('Final deck after import:', this.currentDeck.length, 'unique cards');
            console.log('Current deck name:', this.currentDeckName);
            this.saveDecks();
            console.log('Decks saved, updating display...');
            this.updateDeckDisplay();
            this.updateStats();
            this.hideImportModal();
            
            alert(`Deck importado com sucesso! ${importedCards.length} cartas adicionadas.`);
            
        } catch (error) {
            console.error('Error importing deck:', error);
            alert('Erro ao importar o deck. Verifique o formato e tente novamente.');
        } finally {
            // Restore button state
            importBtn.disabled = false;
            importBtn.innerHTML = originalText;
        }
    }

    saveDecks() {
        this.decks[this.currentDeckName] = this.currentDeck;
        localStorage.setItem('mtgDecks', JSON.stringify(this.decks));
    }

    loadDecks() {
        const saved = localStorage.getItem('mtgDecks');
        if (saved) {
            this.decks = JSON.parse(saved);
        } else {
            this.decks = { default: [] };
        }
        
        // Load the previously selected deck
        const selectedDeck = localStorage.getItem(this.selectedDeckKey);
        if (selectedDeck && this.decks[selectedDeck]) {
            this.currentDeckName = selectedDeck;
            this.currentDeck = this.decks[selectedDeck];
        } else {
            this.currentDeck = this.decks.default || [];
            this.currentDeckName = 'default';
        }
        
        this.updateDeckSelector();
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }

    showNoResults() {
        document.getElementById('no-results').classList.remove('hidden');
    }

    hideNoResults() {
        document.getElementById('no-results').classList.add('hidden');
    }
}

// Initialize the application
const deckBuilder = new MTGDeckBuilder();
