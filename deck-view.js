// Deck View Page - JavaScript
class DeckViewer {
    constructor() {
        this.deckData = null;
        this.categorizedCards = {
            creatures: [],
            lands: [],
            instants: [],
            sorceries: [],
            enchantments: [],
            artifacts: [],
            planeswalkers: [],
            other: []
        };
        
        this.init();
    }

    init() {
        this.loadDeckData();
        this.setupEventListeners();
        this.categorizeCards();
        this.displayDeck();
    }

    loadDeckData() {
        const savedData = localStorage.getItem('currentDeckData');
        if (!savedData) {
            this.showError('Nenhum deck encontrado. Volte à página principal e selecione um deck.');
            return;
        }

        try {
            this.deckData = JSON.parse(savedData);
        } catch (error) {
            console.error('Erro ao carregar dados do deck:', error);
            this.showError('Erro ao carregar dados do deck.');
        }
    }

    setupEventListeners() {
        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            window.close();
        });

        // Print button
        document.getElementById('print-btn').addEventListener('click', () => {
            window.print();
        });

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
    }

    categorizeCards() {
        if (!this.deckData || !this.deckData.cards) {
            return;
        }

        // Reset categories
        this.categorizedCards = {
            creatures: [],
            lands: [],
            instants: [],
            sorceries: [],
            enchantments: [],
            artifacts: [],
            planeswalkers: [],
            other: []
        };

        this.deckData.cards.forEach(card => {
            const typeLine = card.type_line.toLowerCase();
            
            if (typeLine.includes('creature')) {
                this.categorizedCards.creatures.push(card);
            } else if (typeLine.includes('land')) {
                this.categorizedCards.lands.push(card);
            } else if (typeLine.includes('instant')) {
                this.categorizedCards.instants.push(card);
            } else if (typeLine.includes('sorcery')) {
                this.categorizedCards.sorceries.push(card);
            } else if (typeLine.includes('enchantment')) {
                this.categorizedCards.enchantments.push(card);
            } else if (typeLine.includes('artifact')) {
                this.categorizedCards.artifacts.push(card);
            } else if (typeLine.includes('planeswalker')) {
                this.categorizedCards.planeswalkers.push(card);
            } else {
                this.categorizedCards.other.push(card);
            }
        });

        // Sort cards by name within each category
        Object.keys(this.categorizedCards).forEach(category => {
            this.categorizedCards[category].sort((a, b) => a.name.localeCompare(b.name));
        });
    }

    displayDeck() {
        if (!this.deckData) {
            return;
        }

        // Update deck name and stats
        document.getElementById('deck-name').textContent = this.deckData.deckName;
        
        const totalCards = this.deckData.cards.reduce((total, card) => total + card.quantity, 0);
        document.getElementById('total-cards').textContent = totalCards;

        // Calculate average CMC (excluding lands)
        const nonLandCards = this.deckData.cards.filter(card => !card.type_line.toLowerCase().includes('land'));
        const nonLandTotalCards = nonLandCards.reduce((total, card) => total + card.quantity, 0);
        const totalCmc = nonLandCards.reduce((total, card) => total + (card.cmc * card.quantity), 0);
        const avgCmc = nonLandTotalCards > 0 ? (totalCmc / nonLandTotalCards).toFixed(1) : '0.0';
        document.getElementById('avg-cmc').textContent = avgCmc;

        // Display each category
        this.displayCategory('creatures', 'Criaturas');
        this.displayCategory('lands', 'Terrenos');
        this.displayCategory('instants', 'Instantâneos');
        this.displayCategory('sorceries', 'Feitiços');
        this.displayCategory('enchantments', 'Encantamentos');
        this.displayCategory('artifacts', 'Artefatos');
        this.displayCategory('planeswalkers', 'Planeswalkers');
        this.displayCategory('other', 'Outros');
    }

    displayCategory(categoryKey, categoryName) {
        const cards = this.categorizedCards[categoryKey];
        const section = document.getElementById(`${categoryKey}-section`);
        const grid = document.getElementById(`${categoryKey}-grid`);
        const countElement = document.getElementById(`${categoryKey}-count`);

        if (cards.length === 0) {
            section.classList.add('hidden');
            return;
        }

        section.classList.remove('hidden');
        
        // Update count
        const totalQuantity = cards.reduce((total, card) => total + card.quantity, 0);
        countElement.textContent = totalQuantity;

        // Clear and populate grid
        grid.innerHTML = '';
        cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            grid.appendChild(cardElement);
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
            <div class="card-info">
                <div class="card-name">${card.name}</div>
                <div class="card-type">${card.type_line}</div>
                <div class="card-quantity">${card.quantity}x</div>
            </div>
        `;

        return cardDiv;
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
                <p style="margin-bottom: 0.5rem; color: #888888;"><strong>Quantidade no Deck:</strong> ${card.quantity}</p>
                ${card.oracle_text ? `<p style="margin-bottom: 1rem; color: #888888; font-size: 0.9rem; line-height: 1.4;"><strong>Texto:</strong><br>${card.oracle_text.replace(/\n/g, '<br>')}</p>` : ''}
            </div>
        `;

        modal.classList.remove('hidden');
    }

    showError(message) {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="deck-info">
                <h2 style="color: #e53e3e;">Erro</h2>
                <p style="color: #888888; margin-bottom: 1rem;">${message}</p>
                <button class="btn btn-primary" onclick="window.close()">
                    <i class="fas fa-arrow-left"></i> Voltar
                </button>
            </div>
        `;
    }
}

// Initialize the deck viewer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DeckViewer();
});
