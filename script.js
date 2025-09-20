// MTG Deck Builder - JavaScript
class MTGDeckBuilder {
    constructor() {
        this.currentDeck = [];
        this.decks = {};
        this.currentDeckName = 'default';
        this.searchResults = [];
        this.charts = {};
        
        this.init();
    }

    init() {
        this.loadDecks();
        this.setupEventListeners();
        this.updateDeckDisplay();
        this.updateStats();
        this.updateFiltersCount();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('search-btn').addEventListener('click', () => this.searchCards());
        document.getElementById('filter-search-btn').addEventListener('click', () => this.searchWithFiltersOnly());
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchCards();
        });

        // Filters
        document.getElementById('type-filter').addEventListener('change', () => {
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
        document.getElementById('shuffle-btn').addEventListener('click', () => this.shuffleDeck());
        document.getElementById('simulate-hand-btn').addEventListener('click', () => this.simulateHand());

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
    }

    async searchCards() {
        const query = document.getElementById('search-input').value.trim();
        const filters = this.buildFilters();
        
        console.log('searchCards chamada - Query:', query, 'Filtros:', filters);
        
        // If no query and no filters, don't search
        if (!query && !filters.trim()) {
            console.log('Nenhuma busca - sem query e sem filtros');
            return;
        }
        
        const searchQuery = query ? `${query} ${filters}`.trim() : filters;
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
        if (type) filters.push(`t:${type}`);

        const color = document.getElementById('color-filter').value;
        if (color) filters.push(`c:${color}`);

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
        console.log('Filtros construídos:', result);
        return result;
    }

    getActiveFiltersCount() {
        let count = 0;
        
        if (document.getElementById('type-filter').value) count++;
        if (document.getElementById('color-filter').value) count++;
        if (document.getElementById('cmc-filter').value) count++;
        
        // Count multi-select filters
        const selectedRarities = document.querySelectorAll('.rarity-checkbox:checked').length;
        if (selectedRarities > 0) count++;
        
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

    clearFilters() {
        document.getElementById('type-filter').value = '';
        document.getElementById('color-filter').value = '';
        document.getElementById('cmc-filter').value = '';
        
        // Clear multi-select filters
        document.querySelectorAll('.rarity-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelectorAll('.keyword-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.getElementById('format-filter').value = '';
        document.getElementById('legendary-filter').checked = false;
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

        const imageUrl = card.image_uris?.normal || 
                        card.card_faces?.[0]?.image_uris?.normal || 
                        'https://via.placeholder.com/200x280?text=No+Image';

        cardDiv.innerHTML = `
            <img src="${imageUrl}" alt="${card.name}" class="card-image" loading="lazy">
            <div class="card-overlay">
                <button class="add-to-deck-overlay" onclick="event.stopPropagation(); deckBuilder.addToDeck('${card.id}')">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;

        return cardDiv;
    }

    addToDeck(cardId) {
        const card = this.searchResults.find(c => c.id === cardId);
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

        const imageUrl = card.image_uris?.normal || 
                        card.card_faces?.[0]?.image_uris?.normal || 
                        'https://via.placeholder.com/60x84?text=No+Image';

        cardDiv.innerHTML = `
            <img src="${imageUrl}" alt="${card.name}" class="deck-card-image">
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
        `;

        return cardDiv;
    }

    showCardModal(card) {
        const modal = document.getElementById('card-modal');
        const content = document.getElementById('modal-card-content');

        const imageUrl = card.image_uris?.large || 
                        card.card_faces?.[0]?.image_uris?.large || 
                        card.image_uris?.normal || 
                        card.card_faces?.[0]?.image_uris?.normal || 
                        'https://via.placeholder.com/400x560?text=No+Image';

        content.innerHTML = `
            <img src="${imageUrl}" alt="${card.name}" style="max-width: 100%; height: auto; max-height: 300px; border-radius: 8px; margin-bottom: 1rem;">
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
                <img src="${imageUrl}" alt="${card.name}" class="hand-card-image">
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

    updateStats() {
        this.updateGeneralStats();
        this.updateManaCurveChart();
        this.updateColorDistributionChart();
        this.updateTypeDistributionChart();
    }

    updateGeneralStats() {
        const totalCards = this.currentDeck.reduce((total, card) => total + card.quantity, 0);
        const totalCmc = this.currentDeck.reduce((total, card) => total + (card.cmc * card.quantity), 0);
        const avgCmc = totalCards > 0 ? (totalCmc / totalCards).toFixed(1) : '0.0';
        
        const landCount = this.currentDeck
            .filter(card => card.type_line.toLowerCase().includes('land'))
            .reduce((total, card) => total + card.quantity, 0);

        document.getElementById('total-cards').textContent = totalCards;
        document.getElementById('avg-cmc').textContent = avgCmc;
        document.getElementById('land-count').textContent = landCount;
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
        
        this.currentDeck = this.decks.default || [];
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
