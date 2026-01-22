// ===================================
// STATE MANAGEMENT
// ===================================
let fossilData = [];
let filteredData = [];
let currentFossil = null;
let currentImageIndex = 0;
let zoomLevel = 1;
let isDragging = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

// Touch gesture state
let initialPinchDistance = 0;
let initialZoomLevel = 1;

// Exhibition mode state
let exhibitionMode = false;
let exhibitionIndex = 0;

// Filter state
let activeFilters = {
    periodo: [],
    tipo: [],
    pais: []
};

// ===================================
// DOM ELEMENTS
// ===================================
const elements = {
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('error-message'),
    fossilGrid: document.getElementById('fossil-grid'),
    modal: document.getElementById('modal'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    modalClose: document.getElementById('modal-close'),
    modalImage: document.getElementById('modal-image'),
    modalTitle: document.getElementById('modal-title'),
    modalEra: document.getElementById('modal-era'),
    modalPeriodo: document.getElementById('modal-periodo'),
    modalUbicacion: document.getElementById('modal-ubicacion'),
    modalDimensiones: document.getElementById('modal-dimensiones'),
    modalPeso: document.getElementById('modal-peso'),
    modalGenero: document.getElementById('modal-genero'),
    modalDescription: document.getElementById('modal-description'),
    imageContainer: document.getElementById('image-container'),
    imageNavigation: document.getElementById('image-navigation'),
    prevImage: document.getElementById('prev-image'),
    nextImage: document.getElementById('next-image'),
    imageCounter: document.getElementById('image-counter'),
    zoomIn: document.getElementById('zoom-in'),
    zoomOut: document.getElementById('zoom-out'),
    zoomReset: document.getElementById('zoom-reset'),
    zoomLevel: document.getElementById('zoom-level'),
    totalCount: document.getElementById('total-count'),
    eraCount: document.getElementById('era-count'),
    currentYear: document.getElementById('current-year'),
    headerYear: document.getElementById('header-year'),

    // New elements
    searchInput: document.getElementById('search-input'),
    exhibitionBtn: document.getElementById('exhibition-btn'),
    exhibitionMode: document.getElementById('exhibition-mode'),
    exhibitionClose: document.getElementById('exhibition-close'),
    exhibitionImage: document.getElementById('exhibition-image'),
    exhibitionBadge: document.getElementById('exhibition-badge'),
    exhibitionTitle: document.getElementById('exhibition-title'),
    exhibitionSpecies: document.getElementById('exhibition-species'),
    exhibitionPeriodo: document.getElementById('exhibition-periodo'),
    exhibitionEpoca: document.getElementById('exhibition-epoca'),
    exhibitionPais: document.getElementById('exhibition-pais'),
    exhibitionDescription: document.getElementById('exhibition-description'),
    exhibitionPrev: document.getElementById('exhibition-prev'),
    exhibitionNext: document.getElementById('exhibition-next'),
    exhibitionCounter: document.getElementById('exhibition-counter'),

    // Filter elements
    filterPeriodoHeader: document.getElementById('filter-periodo-header'),
    filterPeriodoOptions: document.getElementById('filter-periodo-options'),
    filterTipoHeader: document.getElementById('filter-tipo-header'),
    filterTipoOptions: document.getElementById('filter-tipo-options'),
    filterPaisHeader: document.getElementById('filter-pais-header'),
    filterPaisOptions: document.getElementById('filter-pais-options'),
    shownCount: document.getElementById('shown-count'),
    totalFossils: document.getElementById('total-fossils'),
    clearFiltersBtn: document.getElementById('clear-filters-btn')
};

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Set current year
    const currentYear = new Date().getFullYear();
    elements.currentYear.textContent = currentYear;
    elements.headerYear.textContent = currentYear;

    // Load fossil data
    loadFossilData();

    // Setup event listeners
    setupEventListeners();
}

// ===================================
// DATA LOADING
// ===================================
async function loadFossilData() {
    try {
        elements.loading.style.display = 'block';
        elements.errorMessage.style.display = 'none';

        const response = await fetch('catalogo_fosiles.json');
        if (!response.ok) throw new Error('Failed to load data');

        fossilData = await response.json();
        filteredData = [...fossilData];

        updateStats();
        renderFossilGrid();
        initializeFilters();

        elements.loading.style.display = 'none';
    } catch (error) {
        console.error('Error loading fossil data:', error);
        elements.loading.style.display = 'none';
        elements.errorMessage.style.display = 'block';
    }
}

function updateStats() {
    elements.totalCount.textContent = fossilData.length;

    // Count unique periods
    const uniquePeriods = new Set(fossilData.map(f => f.Periodo));
    elements.eraCount.textContent = uniquePeriods.size;
}

// ===================================
// FILTERS
// ===================================
function initializeFilters() {
    // Get unique values for each filter
    const periodos = [...new Set(fossilData.map(f => f.Periodo))].sort();
    const tipos = [...new Set(fossilData.map(f => f.Denominación))].sort();
    const paises = [...new Set(fossilData.map(f => f.País))].sort();

    // Populate filter options
    populateFilterOptions('periodo', periodos, elements.filterPeriodoOptions);
    populateFilterOptions('tipo', tipos, elements.filterTipoOptions);
    populateFilterOptions('pais', paises, elements.filterPaisOptions);

    // Update filter count
    updateFilterCount();
}

function populateFilterOptions(filterType, options, container) {
    container.innerHTML = '';

    options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'filter-option';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `filter-${filterType}-${option}`;
        checkbox.value = option;
        checkbox.addEventListener('change', () => handleFilterChange(filterType, option, checkbox.checked));

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = option;

        optionDiv.appendChild(checkbox);
        optionDiv.appendChild(label);
        container.appendChild(optionDiv);
    });
}

function handleFilterChange(filterType, value, checked) {
    if (checked) {
        if (!activeFilters[filterType].includes(value)) {
            activeFilters[filterType].push(value);
        }
    } else {
        activeFilters[filterType] = activeFilters[filterType].filter(v => v !== value);
    }

    applyFilters();
    updateClearButton();
}

function applyFilters() {
    filteredData = fossilData.filter(fossil => {
        // Check periodo filter
        if (activeFilters.periodo.length > 0 && !activeFilters.periodo.includes(fossil.Periodo)) {
            return false;
        }

        // Check tipo filter
        if (activeFilters.tipo.length > 0 && !activeFilters.tipo.includes(fossil.Denominación)) {
            return false;
        }

        // Check pais filter
        if (activeFilters.pais.length > 0 && !activeFilters.pais.includes(fossil.País)) {
            return false;
        }

        return true;
    });

    renderFossilGrid();
    updateFilterCount();
}

function updateFilterCount() {
    elements.shownCount.textContent = filteredData.length;
    elements.totalFossils.textContent = fossilData.length;
}

function updateClearButton() {
    const hasActiveFilters = activeFilters.periodo.length > 0 ||
        activeFilters.tipo.length > 0 ||
        activeFilters.pais.length > 0;

    elements.clearFiltersBtn.style.display = hasActiveFilters ? 'block' : 'none';
}

function clearAllFilters() {
    // Reset active filters
    activeFilters = {
        periodo: [],
        tipo: [],
        pais: []
    };

    // Uncheck all checkboxes
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Reset filtered data
    filteredData = [...fossilData];

    // Update UI
    renderFossilGrid();
    updateFilterCount();
    updateClearButton();
}

// ===================================
// SEARCH
// ===================================
function handleSearch(query) {
    query = query.toLowerCase().trim();

    if (query === '') {
        filteredData = [...fossilData];
    } else {
        filteredData = fossilData.filter(fossil => {
            return fossil.Denominación.toLowerCase().includes(query) ||
                (fossil.Género && fossil.Género.toLowerCase().includes(query)) ||
                fossil.Periodo.toLowerCase().includes(query) ||
                fossil.País.toLowerCase().includes(query) ||
                fossil['Nº Inventario'].toLowerCase().includes(query) ||
                (fossil.Notas && fossil.Notas.toLowerCase().includes(query));
        });
    }

    // Apply active filters on top of search
    if (activeFilters.periodo.length > 0 || activeFilters.tipo.length > 0 || activeFilters.pais.length > 0) {
        filteredData = filteredData.filter(fossil => {
            if (activeFilters.periodo.length > 0 && !activeFilters.periodo.includes(fossil.Periodo)) {
                return false;
            }
            if (activeFilters.tipo.length > 0 && !activeFilters.tipo.includes(fossil.Denominación)) {
                return false;
            }
            if (activeFilters.pais.length > 0 && !activeFilters.pais.includes(fossil.País)) {
                return false;
            }
            return true;
        });
    }

    renderFossilGrid();
    updateFilterCount();
}

// ===================================
// RENDERING
// ===================================
function renderFossilGrid() {
    elements.fossilGrid.innerHTML = '';

    filteredData.forEach((fossil, index) => {
        const card = createFossilCard(fossil, index);
        elements.fossilGrid.appendChild(card);
    });
}

function createFossilCard(fossil, index) {
    const card = document.createElement('div');
    card.className = 'fossil-card';
    card.setAttribute('data-index', index);

    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image-container';

    const img = document.createElement('img');
    const imagePath = `imagenes/${fossil['Nº Inventario']}/${fossil.imagenes[0]}`;
    img.src = imagePath;
    img.alt = fossil.Denominación;
    img.className = 'card-image';

    // Fallback for missing images
    img.onerror = function () {
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
    };

    // Badge with inventory number
    const badge = document.createElement('div');
    badge.className = 'card-badge';
    badge.textContent = fossil['Nº Inventario'];

    imageContainer.appendChild(img);
    imageContainer.appendChild(badge);

    // Card info
    const cardInfo = document.createElement('div');
    cardInfo.className = 'card-info';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = fossil.Denominación;

    const species = document.createElement('p');
    species.className = 'card-species';
    species.textContent = fossil.Género || '';

    const details = document.createElement('div');
    details.className = 'card-details';

    const periodo = document.createElement('span');
    periodo.className = 'card-detail';
    periodo.textContent = fossil.Periodo;

    const datacion = document.createElement('span');
    datacion.className = 'card-detail card-datacion';
    datacion.textContent = fossil['Datación Relativa'];

    const pais = document.createElement('span');
    pais.className = 'card-detail';
    pais.textContent = fossil.País;

    details.appendChild(periodo);
    details.appendChild(datacion);
    details.appendChild(pais);

    cardInfo.appendChild(title);
    cardInfo.appendChild(species);
    cardInfo.appendChild(details);

    card.appendChild(imageContainer);
    card.appendChild(cardInfo);

    // Click event to open modal
    card.addEventListener('click', () => openModal(index));

    return card;
}

// ===================================
// MODAL FUNCTIONALITY
// ===================================
function openModal(index) {
    currentFossil = filteredData[index];
    currentImageIndex = 0;
    resetZoom();

    updateModalContent();
    elements.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.modal.classList.remove('active');
    document.body.style.overflow = '';
}

function updateModalContent() {
    if (!currentFossil) return;

    elements.modalTitle.textContent = currentFossil.Denominación;
    elements.modalPeriodo.textContent = currentFossil.Periodo;
    elements.modalEra.textContent = currentFossil.Epoca || '';
    elements.modalUbicacion.textContent = currentFossil.País;
    elements.modalDimensiones.textContent = currentFossil.Dimensiones || 'No especificado';
    elements.modalPeso.textContent = currentFossil.Peso || 'No especificado';
    elements.modalGenero.textContent = currentFossil.Género || 'No especificado';
    elements.modalDescription.textContent = currentFossil.Notas || 'Sin descripción disponible.';

    updateModalImage();
    updateImageNavigation();
}

function updateModalImage() {
    if (!currentFossil) return;

    const imagePath = `imagenes/${currentFossil['Nº Inventario']}/${currentFossil.imagenes[currentImageIndex]}`;
    elements.modalImage.src = imagePath;
    elements.modalImage.alt = currentFossil.Denominación;
}

function updateImageNavigation() {
    if (!currentFossil) return;

    const imageCount = currentFossil.imagenes.length;

    if (imageCount > 1) {
        elements.imageNavigation.style.display = 'flex';
        elements.imageCounter.textContent = `${currentImageIndex + 1} / ${imageCount}`;
        elements.prevImage.disabled = currentImageIndex === 0;
        elements.nextImage.disabled = currentImageIndex === imageCount - 1;
    } else {
        elements.imageNavigation.style.display = 'none';
    }
}

function previousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        updateModalImage();
        updateImageNavigation();
        resetZoom();
    }
}

function nextImage() {
    if (currentFossil && currentImageIndex < currentFossil.imagenes.length - 1) {
        currentImageIndex++;
        updateModalImage();
        updateImageNavigation();
        resetZoom();
    }
}

// ===================================
// ZOOM FUNCTIONALITY
// ===================================
function zoomIn() {
    zoomLevel = Math.min(zoomLevel + 0.25, 5);
    applyZoom();
}

function zoomOut() {
    zoomLevel = Math.max(zoomLevel - 0.25, 1);
    applyZoom();
}

function resetZoom() {
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    applyZoom();
}

function applyZoom() {
    const scaleTransform = `scale(${zoomLevel})`;
    const translateTransform = `translate(${translateX / zoomLevel}px, ${translateY / zoomLevel}px)`;
    elements.modalImage.style.transform = `${scaleTransform} ${translateTransform}`;
    elements.zoomLevel.textContent = `${Math.round(zoomLevel * 100)}%`;

    // Update cursor based on zoom level
    if (zoomLevel > 1) {
        elements.modalImage.style.cursor = isDragging ? 'grabbing' : 'grab';
    } else {
        elements.modalImage.style.cursor = 'default';
    }
}

// Mouse wheel zoom
function handleWheel(e) {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(1, Math.min(5, zoomLevel + delta));

    if (newZoom !== zoomLevel) {
        zoomLevel = newZoom;
        applyZoom();
    }
}

// Pinch to zoom
function handleTouchStart(e) {
    if (e.touches.length === 2) {
        // Pinch gesture
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialPinchDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        initialZoomLevel = zoomLevel;
    } else if (e.touches.length === 1 && zoomLevel > 1) {
        // Single touch drag
        startDrag(e);
    }
}

function handleTouchMove(e) {
    if (e.touches.length === 2) {
        // Pinch zoom
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );

        const scale = currentDistance / initialPinchDistance;
        zoomLevel = Math.max(1, Math.min(5, initialZoomLevel * scale));
        applyZoom();
    } else if (e.touches.length === 1 && isDragging) {
        // Single touch drag
        drag(e);
    }
}

function handleTouchEnd(e) {
    if (e.touches.length < 2) {
        initialPinchDistance = 0;
    }
    if (e.touches.length === 0) {
        endDrag();
    }
}

// ===================================
// DRAG FUNCTIONALITY
// ===================================
function startDrag(e) {
    if (zoomLevel <= 1) return;

    isDragging = true;

    if (e.type === 'mousedown') {
        e.preventDefault();
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
    } else if (e.type === 'touchstart' && e.touches.length === 1) {
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
    }

    applyZoom();
}

function drag(e) {
    if (!isDragging || zoomLevel <= 1) return;

    e.preventDefault();

    if (e.type === 'mousemove') {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
    } else if (e.type === 'touchmove' && e.touches.length === 1) {
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;
    }

    applyZoom();
}

function endDrag() {
    isDragging = false;
    applyZoom();
}

// ===================================
// EXHIBITION MODE
// ===================================
function enterExhibitionMode() {
    if (filteredData.length === 0) return;

    exhibitionMode = true;
    exhibitionIndex = 0;
    updateExhibitionContent();
    elements.exhibitionMode.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function exitExhibitionMode() {
    exhibitionMode = false;
    elements.exhibitionMode.style.display = 'none';
    document.body.style.overflow = '';
}

function updateExhibitionContent() {
    const fossil = filteredData[exhibitionIndex];
    if (!fossil) return;

    const imagePath = `imagenes/${fossil['Nº Inventario']}/${fossil.imagenes[0]}`;
    elements.exhibitionImage.src = imagePath;
    elements.exhibitionImage.alt = fossil.Denominación;

    elements.exhibitionBadge.textContent = fossil['Nº Inventario'];
    elements.exhibitionTitle.textContent = fossil.Denominación;
    elements.exhibitionSpecies.textContent = fossil.Género || '';
    elements.exhibitionPeriodo.textContent = fossil.Periodo;
    elements.exhibitionEpoca.textContent = fossil.Epoca || '';
    elements.exhibitionPais.textContent = fossil.País;
    elements.exhibitionDescription.textContent = fossil.Notas || 'Sin descripción disponible.';

    elements.exhibitionCounter.textContent = `${exhibitionIndex + 1} / ${filteredData.length}`;
    elements.exhibitionPrev.disabled = exhibitionIndex === 0;
    elements.exhibitionNext.disabled = exhibitionIndex === filteredData.length - 1;
}

function previousExhibition() {
    if (exhibitionIndex > 0) {
        exhibitionIndex--;
        updateExhibitionContent();
    }
}

function nextExhibition() {
    if (exhibitionIndex < filteredData.length - 1) {
        exhibitionIndex++;
        updateExhibitionContent();
    }
}

// ===================================
// EVENT LISTENERS
// ===================================
function setupEventListeners() {
    // Modal events
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalBackdrop.addEventListener('click', closeModal);

    // Image navigation
    elements.prevImage.addEventListener('click', previousImage);
    elements.nextImage.addEventListener('click', nextImage);

    // Zoom controls
    elements.zoomIn.addEventListener('click', zoomIn);
    elements.zoomOut.addEventListener('click', zoomOut);
    elements.zoomReset.addEventListener('click', resetZoom);

    // Mouse wheel zoom
    elements.imageContainer.addEventListener('wheel', handleWheel, { passive: false });

    // Touch gestures (pinch-to-zoom and drag)
    elements.imageContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    elements.imageContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    elements.imageContainer.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Mouse drag functionality
    elements.modalImage.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Search
    elements.searchInput.addEventListener('input', debounce((e) => {
        handleSearch(e.target.value);
    }, 300));

    // Exhibition mode
    elements.exhibitionBtn.addEventListener('click', enterExhibitionMode);
    elements.exhibitionClose.addEventListener('click', exitExhibitionMode);
    elements.exhibitionPrev.addEventListener('click', previousExhibition);
    elements.exhibitionNext.addEventListener('click', nextExhibition);

    // Filter toggles
    elements.filterPeriodoHeader.addEventListener('click', () => {
        toggleFilter(elements.filterPeriodoHeader, elements.filterPeriodoOptions);
    });

    elements.filterTipoHeader.addEventListener('click', () => {
        toggleFilter(elements.filterTipoHeader, elements.filterTipoOptions);
    });

    elements.filterPaisHeader.addEventListener('click', () => {
        toggleFilter(elements.filterPaisHeader, elements.filterPaisOptions);
    });

    // Clear filters
    elements.clearFiltersBtn.addEventListener('click', clearAllFilters);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Modal navigation
        if (elements.modal.classList.contains('active')) {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') previousImage();
            if (e.key === 'ArrowRight') nextImage();
        }

        // Exhibition mode navigation
        if (exhibitionMode) {
            if (e.key === 'Escape') exitExhibitionMode();
            if (e.key === 'ArrowLeft') previousExhibition();
            if (e.key === 'ArrowRight') nextExhibition();
        }
    });
}

function toggleFilter(header, options) {
    header.classList.toggle('active');
    options.classList.toggle('open');
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Log app initialization
console.log('🦴 Fossil Collection App Initialized with Enhanced Features');
