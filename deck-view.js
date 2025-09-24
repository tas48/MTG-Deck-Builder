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

    calculateDrawProbability(cardQuantity, deckSize, handSize = 7) {
        // Calculate probability of drawing at least one copy of this card
        // Using hypergeometric distribution approximation
        
        if (deckSize === 0 || cardQuantity === 0) return 0;
        
        // For small hands relative to deck size, we can use the approximation:
        // P(at least one) ≈ 1 - (1 - cardQuantity/deckSize)^handSize
        const cardProbability = cardQuantity / deckSize;
        const noCardProbability = Math.pow(1 - cardProbability, handSize);
        const atLeastOneProbability = 1 - noCardProbability;
        
        return Math.min(100, Math.max(0, atLeastOneProbability * 100));
    }

    calculateTurnProbability(cardQuantity, deckSize, turn) {
        // Calculate probability of drawing at least one copy by turn X
        // This includes the initial hand (7 cards) plus draws for each turn
        const handSize = 7 + (turn - 1);
        return this.calculateDrawProbability(cardQuantity, deckSize, handSize);
    }

    getProbabilityClass(probability) {
        if (probability >= 70) return 'high';
        if (probability >= 40) return 'medium';
        if (probability >= 20) return 'low';
        return 'very-low';
    }

    displayDeck() {
        if (!this.deckData) {
            return;
        }

        // Update deck name and stats
        document.getElementById('deck-name').textContent = this.deckData.deckName;
        
        this.totalDeckSize = this.deckData.cards.reduce((total, card) => total + card.quantity, 0);
        document.getElementById('total-cards').textContent = this.totalDeckSize;

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

        // Calculate draw probabilities
        const initialHandProb = this.calculateDrawProbability(card.quantity, this.totalDeckSize, 7);
        const turn3Prob = this.calculateTurnProbability(card.quantity, this.totalDeckSize, 3);
        const turn5Prob = this.calculateTurnProbability(card.quantity, this.totalDeckSize, 5);

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
                <div class="card-probabilities">
                    <div class="prob-item">
                        <span class="prob-label">Mão inicial:</span>
                        <span class="prob-value ${this.getProbabilityClass(initialHandProb)}">${initialHandProb.toFixed(1)}%</span>
                    </div>
                    <div class="prob-item">
                        <span class="prob-label">Turno 3:</span>
                        <span class="prob-value ${this.getProbabilityClass(turn3Prob)}">${turn3Prob.toFixed(1)}%</span>
                    </div>
                    <div class="prob-item">
                        <span class="prob-label">Turno 5:</span>
                        <span class="prob-value ${this.getProbabilityClass(turn5Prob)}">${turn5Prob.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        `;

        return cardDiv;
    }

    showCardModal(card) {
        const modal = document.getElementById('card-modal');
        const content = document.getElementById('modal-card-content');

        // Calculate draw probabilities
        const initialHandProb = this.calculateDrawProbability(card.quantity, this.totalDeckSize, 7);
        const turn3Prob = this.calculateTurnProbability(card.quantity, this.totalDeckSize, 3);
        const turn5Prob = this.calculateTurnProbability(card.quantity, this.totalDeckSize, 5);
        const turn10Prob = this.calculateTurnProbability(card.quantity, this.totalDeckSize, 10);

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
                
                <div style="background: #1a1a1a; padding: 1rem; border-radius: 8px; margin: 1rem 0; border: 1px solid #333;">
                    <h4 style="color: #e5e5e5; margin-bottom: 0.5rem;">📊 Probabilidades de Compra</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; text-align: left;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #888888;">Mão inicial (7 cartas):</span>
                            <span style="color: #4CAF50; font-weight: bold;">${initialHandProb.toFixed(1)}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #888888;">Até turno 3:</span>
                            <span style="color: #FFC107; font-weight: bold;">${turn3Prob.toFixed(1)}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #888888;">Até turno 5:</span>
                            <span style="color: #FF9800; font-weight: bold;">${turn5Prob.toFixed(1)}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #888888;">Até turno 10:</span>
                            <span style="color: #F44336; font-weight: bold;">${turn10Prob.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
                
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
