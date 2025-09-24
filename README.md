# 🃏 MTG Deck Builder

Um aplicativo web completo para construção de decks de Magic: The Gathering, desenvolvido com HTML, CSS e JavaScript puro.

## ✨ Funcionalidades

### 🔍 Busca de Cartas Avançada
- **Busca por nome** com autocompletar
- **Busca por descrição** (Oracle Text) - encontre cartas por efeitos específicos
- Integração completa com a API pública do Scryfall
- **Filtros inteligentes** com ativação condicional:
  - **Por tipo** (Creature, Land, Instant, Sorcery, Enchantment, Artifact, Planeswalker)
  - **Por cor** (White, Blue, Black, Red, Green, Colorless, Guilds)
  - **Por CMC** (0, 1, 2, 3, 4, 5, 6+)
  - **Por raridade** (Common, Uncommon, Rare, Mythic)
  - **Por palavras-chave** (Flying, Trample, Deathtouch, etc.)
  - **Por formato** (Standard, Pioneer, Modern, Legacy, Vintage, Commander, Pauper)
  - **Por subtipos específicos** baseados no tipo selecionado
- **Barras de busca integradas** para todos os filtros multi-select
- Visualização de cartas com preview ao clicar

### 🎴 Gerenciamento de Deck
- Adicionar/remover cartas do deck
- Controle de quantidade (múltiplas cópias)
- Múltiplos decks (criar, renomear, trocar)
- **Importar deck** - cole decklists em formato texto
- **Exportar deck** - baixe decklists em formato .txt
- **Visualização do deck** - página separada com cartas organizadas por tipo
- Persistência automática no localStorage
- Embaralhar deck
- Simulador de mão inicial (7 cartas aleatórias)

### 📊 Análises e Estatísticas
- **Curva de Mana**: Gráfico de barras mostrando distribuição por CMC
- **Distribuição de Cores**: Gráfico de pizza com cores das cartas
- **Tipos de Carta**: Distribuição por tipo (Criaturas, Terrenos, etc.)
- **Informações Gerais**: CMC médio, total de cartas, contagem de terrenos

### 🎯 Filtros Especializados por Tipo

#### 🧙‍♂️ **Creature Subtypes** (quando Creature selecionado)
- 50+ subtipos de criaturas (Elf, Goblin, Human, Dragon, Angel, etc.)
- Busca integrada para encontrar subtipos específicos
- Filtros em inglês para compatibilidade total com Scryfall

#### 🏞️ **Land Subtypes** (quando Land selecionado)
- Subtipos de terrenos (Plains, Island, Swamp, Mountain, Forest, etc.)
- Filtro "Basic Lands Only" para terrenos básicos
- Busca integrada para subtipos específicos

#### ⚡ **Spell Effects** (quando Instant/Sorcery/Enchantment selecionado)
- **Draw** - cartas que fazem comprar cartas
- **Removal** - cartas que destroem alvos
- **Burn** - cartas que causam dano direto
- **Counter** - cartas que negam mágicas
- **Token** - cartas que geram fichas
- **Pump/Buff** - cartas que aumentam poder/resistência
- **Heal** - cartas que curam vida
- **Tutor** - cartas que buscam na biblioteca

#### ⚙️ **Artifact Subtypes** (quando Artifact selecionado)
- **Equipment** - artefatos equipáveis
- **Vehicle** - artefatos que podem "andar"
- **Clue/Treasure/Food** - artefatos que geram tokens de recurso
- **Mana Rock** - artefatos que geram mana
- **Artifact Land** - terrenos artefato

### 🎮 Funcionalidades Extras
- **Simulador de Mão**: Embaralha o deck e mostra 7 cartas aleatórias
- **Preview de Cartas**: Modal com imagem grande e detalhes
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **Tema Escuro Moderno**: Design limpo com matte black e acentos azuis
- **Busca Oracle Text**: Encontre cartas por efeitos específicos

## 🚀 Como Usar

### 🔍 **Busca de Cartas**
1. **Selecione o tipo de busca** (Nome da carta ou Descrição da carta)
2. **Digite sua busca** na barra principal
3. **Use os filtros avançados** para refinar resultados
4. **Filtros se ativam automaticamente** baseado no tipo selecionado

### 🎴 **Gerenciamento de Deck**
1. **Clique no botão +** para adicionar cartas ao deck
2. **Ajuste quantidades** usando os controles +/-
3. **Importe decks** colando decklists no formato texto
4. **Exporte decks** baixando arquivos .txt
5. **Simule mãos** para testar seu deck

### 🎯 **Filtros Especializados**
- **Creatures**: Use subtipos para encontrar Elfos, Dragões, etc.
- **Lands**: Filtre por Plains, Islands, ou apenas terrenos básicos
- **Spells**: Encontre por efeito (Draw, Removal, Burn, Counter, etc.)
- **Artifacts**: Filtre por Equipment, Vehicles, Mana Rocks, etc.

### 📊 **Análise de Deck**
- **Visualize a curva de mana** no gráfico de barras
- **Veja distribuição de cores** no gráfico de pizza
- **Monitore tipos de carta** e CMC médio
- **Teste com simulador de mão** (7 cartas aleatórias)

## 🛠 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilização moderna com Flexbox e Grid
- **JavaScript ES6+**: Lógica da aplicação com classes e async/await
- **Chart.js**: Gráficos interativos para estatísticas
- **Font Awesome**: Ícones modernos
- **Scryfall API**: Dados e imagens das cartas

## 📱 Responsividade

O aplicativo é totalmente responsivo e funciona perfeitamente em:
- 📱 **Mobile** (1-2 colunas de filtros)
- 💻 **Tablet** (3-5 colunas de filtros)
- 🖥 **Desktop** (6-9 colunas de filtros)
- 🖥 **Wide Desktop** (9 colunas completas)

## 🎨 Design

- **Tema escuro matte black** com acentos azuis modernos
- **Animações suaves** em hover e transições
- **Cards com sombra** e efeitos de elevação
- **Tipografia clara** e hierarquia visual
- **Cores temáticas** baseadas nas cores do Magic
- **Interface limpa** com foco na funcionalidade
- **Modais elegantes** para melhor experiência do usuário

## 💾 Persistência

Todos os decks são salvos automaticamente no `localStorage` do navegador, permitindo:
- Continuar trabalhando entre sessões
- Múltiplos decks salvos
- Backup automático das alterações

## 🔧 Estrutura do Projeto

```
MTG-Deck-Builder/
├── index.html          # Estrutura principal
├── styles.css          # Estilos e responsividade
├── script.js           # Lógica da aplicação
└── README.md           # Documentação
```

## 🌟 Recursos Avançados

### 🔧 **Performance e Otimização**
- **Debounce na busca** para otimizar requisições
- **Lazy loading** de imagens para performance
- **Error handling** robusto para falhas de API
- **Validação de dados** antes de adicionar ao deck
- **Animações CSS** para feedback visual

### 🎯 **Filtros Inteligentes**
- **Ativação condicional** - filtros se ativam baseado no tipo selecionado
- **Busca integrada** em todos os filtros multi-select
- **Compatibilidade total** com sintaxe Scryfall
- **Filtros em inglês** para máxima precisão
- **Contador de filtros ativos** em tempo real

### 📱 **Interface Moderna**
- **Tema escuro matte black** com acentos azuis
- **Layout responsivo** com 9 colunas no desktop
- **Modais elegantes** para preview e importação
- **Feedback visual** em todas as interações
- **Tipografia otimizada** para legibilidade

### 🔍 **Busca Avançada**
- **Oracle Text Search** - encontre cartas por efeitos
- **Exemplos**: "draw a card", "destroy target creature", "deal 3 damage"
- **Sintaxe Scryfall** completa e otimizada
- **Placeholders dinâmicos** baseados no tipo de busca

## 📄 Licença

Este projeto é de código aberto e utiliza dados públicos da API do Scryfall.

---

**Desenvolvido com ❤️ para a comunidade Magic: The Gathering**

*Imagens e dados de cartas fornecidos por [Scryfall](https://scryfall.com)*
