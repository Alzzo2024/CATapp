class CentroAcademicoApp {
    constructor() {
        this.currentPage = 'home';
        this.currentBanner = 0;
        this.bannerInterval = null;
        this.appData = null;
        this.currentFilter = 'future';
        
        this.init();
    }

    init() {
        this.showSplashScreen();
        this.loadDataFromServer();
    }

    async loadDataFromServer() {
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`data.json?v=${timestamp}`);
            
            if (response.ok) {
                this.appData = await response.json();
                console.log('Dados carregados do servidor:', this.appData);
                this.initializeApp();
            } else {
                console.log('Erro ao carregar dados, usando dados locais');
                this.loadSampleData();
                this.initializeApp();
            }
        } catch (error) {
            console.log('Erro de rede, usando dados locais:', error);
            this.loadSampleData();
            this.initializeApp();
        }
    }

    initializeApp() {
        this.updateAppInfo();
        this.renderMenu();
        this.renderSettings();
        this.setupEventListeners();
        this.startBannerCarousel();
    }

    updateAppInfo() {
        // Atualizar título da página
        document.title = this.appData.app.name;
        
        // Atualizar logos
        document.querySelectorAll('img[alt*="Centro"], img[alt*="CAT"]').forEach(img => {
            img.src = this.appData.app.logo;
        });
    }

    renderMenu() {
        const navContainer = document.querySelector('.side-menu-nav');
        navContainer.innerHTML = '';

        // Navegação principal
        this.appData.menu.navigation.forEach(item => {
            const navItem = document.createElement('a');
            navItem.href = '#';
            navItem.className = `nav-item ${item.id === 'home' ? 'active' : ''}`;
            navItem.dataset.page = item.id;
            navItem.innerHTML = `<i class="${item.icon}"></i> ${item.title}`;
            navContainer.appendChild(navItem);
        });

        // Seção Participante
        const participantSection = document.getElementById('participantSection');
        participantSection.innerHTML = `<h3>${this.appData.texts.sections.participant}</h3>`;
        
        this.appData.menu.participant.forEach(item => {
            const joinItem = document.createElement('a');
            joinItem.href = '#';
            joinItem.className = 'nav-item';
            joinItem.id = 'joinBtn';
            joinItem.innerHTML = `<i class="${item.icon}"></i> ${item.title}`;
            participantSection.appendChild(joinItem);
        });
    }

    renderSettings() {
        const settingsList = document.querySelector('.settings-list');
        settingsList.innerHTML = '';

        this.appData.settings.items.forEach(item => {
            const settingsItem = document.createElement('div');
            
            if (item.type === 'link') {
                settingsItem.innerHTML = `
                    <a href="${item.url}" target="_blank" class="settings-item">
                        <i class="${item.icon}"></i>
                        <span>${item.title}</span>
                        <i class="fas fa-chevron-right"></i>
                    </a>
                `;
            } else if (item.type === 'action') {
                settingsItem.innerHTML = `
                    <div class="settings-item" id="${item.id}Btn">
                        <i class="${item.icon}"></i>
                        <span>${item.title}</span>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                `;
            } else if (item.type === 'info') {
                settingsItem.innerHTML = `
                    <div class="settings-item">
                        <i class="${item.icon}"></i>
                        <span>${item.title}</span>
                        <span class="version">${item.value}</span>
                    </div>
                `;
            } else {
                settingsItem.innerHTML = `
                    <a href="#" class="settings-item">
                        <i class="${item.icon}"></i>
                        <span>${item.title}</span>
                    </a>
                `;
            }
            
            settingsList.appendChild(settingsItem);
        });
    }

    showSplashScreen() {
        setTimeout(() => {
            document.getElementById('splashScreen').style.display = 'none';
            document.getElementById('mainApp').classList.remove('hidden');
            this.renderHomeContent();
        }, 3000);
    }

    setupEventListeners() {
        // Menu toggle
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.toggleMenu();
            });
        }

        // Menu overlay
        const menuOverlay = document.getElementById('menuOverlay');
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }

        // Exit confirmation
        const cancelExit = document.getElementById('cancelExit');
        if (cancelExit) {
            cancelExit.addEventListener('click', () => {
                this.hideExitModal();
            });
        }

        const confirmExit = document.getElementById('confirmExit');
        if (confirmExit) {
            confirmExit.addEventListener('click', () => {
                window.close();
            });
        }

        // Modal close buttons
        const closeNewsModal = document.getElementById('closeNewsModal');
        if (closeNewsModal) {
            closeNewsModal.addEventListener('click', () => {
                this.hideNewsModal();
            });
        }

        const closeEventModal = document.getElementById('closeEventModal');
        if (closeEventModal) {
            closeEventModal.addEventListener('click', () => {
                this.hideEventModal();
            });
        }

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Setup dynamic event listeners
        this.setupDynamicEventListeners();
    }

    setupDynamicEventListeners() {
        // Navigation items (usando event delegation)
        document.addEventListener('click', (e) => {
            // Navigation items
            if (e.target.closest('.nav-item[data-page]')) {
                e.preventDefault();
                const navItem = e.target.closest('.nav-item[data-page]');
                const page = navItem.dataset.page;
                this.navigateToPage(page);
                this.closeMenu();
                return;
            }

            // Back buttons
            if (e.target.closest('.back-btn')) {
                const backBtn = e.target.closest('.back-btn');
                const target = backBtn.dataset.target;
                this.navigateToPage(target);
                return;
            }

            // See all buttons
            if (e.target.closest('.see-all-btn')) {
                const seeAllBtn = e.target.closest('.see-all-btn');
                const target = seeAllBtn.dataset.target;
                this.navigateToPage(target);
                return;
            }

            // Filter tabs
            if (e.target.closest('.filter-tab')) {
                const filterTab = e.target.closest('.filter-tab');
                const filter = filterTab.dataset.filter;
                this.setFilter(filter);
                return;
            }

            // Join button
            if (e.target.closest('#joinBtn')) {
                e.preventDefault();
                const joinUrl = this.appData.menu.participant[0].url;
                window.open(joinUrl, '_blank');
                return;
            }

            // Update button
            if (e.target.closest('#updateBtn')) {
                this.forceUpdate();
                return;
            }

            // Banner indicators
            if (e.target.closest('.indicator')) {
                const indicators = Array.from(document.querySelectorAll('.indicator'));
                const index = indicators.indexOf(e.target.closest('.indicator'));
                this.setBanner(index);
                return;
            }

            // News cards
            if (e.target.closest('.card[data-news-id]')) {
                const card = e.target.closest('.card[data-news-id]');
                const newsId = parseInt(card.dataset.newsId);
                this.showNewsModal(newsId);
                return;
            }

                        // Event cards
            if (e.target.closest('.card[data-event-id]')) {
                const card = e.target.closest('.card[data-event-id]');
                const eventId = parseInt(card.dataset.eventId);
                this.showEventModal(eventId);
                return;
            }

            // Modal backgrounds (close on click outside)
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
                return;
            }
        });
    }

    async forceUpdate() {
        const updateBtn = document.getElementById('updateBtn');
        if (updateBtn) {
            const originalText = updateBtn.textContent;
            updateBtn.textContent = this.appData.texts.buttons.updating;
            updateBtn.disabled = true;
        }

        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`data.json?v=${timestamp}`);
            
            if (response.ok) {
                this.appData = await response.json();
                this.updateAppInfo();
                this.renderMenu();
                this.renderSettings();
                this.startBannerCarousel();
                this.renderHomeContent();
                
                alert(this.appData.texts.modals.updateSuccess);
            } else {
                throw new Error('Failed to fetch');
            }
        } catch (error) {
            console.error('Update failed:', error);
            alert(this.appData.texts.modals.updateError);
        } finally {
            if (updateBtn) {
                updateBtn.textContent = updateBtn.dataset.originalText || 'Atualizar Conteúdo';
                updateBtn.disabled = false;
            }
        }
    }

    loadSampleData() {
        // Dados de fallback caso o data.json não carregue
        this.appData = {
            "app": {
                "name": "Centro Académico Tradicionalista",
                "shortName": "CAT",
                "version": "1.0.0",
                "logo": "img/CATlogo.png"
            },
            "menu": {
                "navigation": [
                    {
                        "id": "home",
                        "title": "Início",
                        "icon": "fas fa-home"
                    },
                    {
                        "id": "news",
                        "title": "Notícias",
                        "icon": "fas fa-newspaper"
                    },
                    {
                        "id": "agenda",
                        "title": "Agenda",
                        "icon": "fas fa-calendar"
                    }
                ],
                "participant": [
                    {
                        "title": "Tornar-se Participante",
                        "icon": "fas fa-user-plus",
                        "url": "https://forms.gle/exemplo"
                    }
                ]
            },
            "settings": {
                "items": [
                    {
                        "title": "Atualizar Conteúdo",
                        "icon": "fas fa-sync-alt",
                        "type": "action",
                        "id": "update"
                    },
                    {
                        "title": "Versão",
                        "icon": "fas fa-info-circle",
                        "type": "info",
                        "value": "1.0.0"
                    }
                ]
            },
            "banners": [
                {
                    "id": 1,
                    "image": "img/869annosmp.png",
                    "title": "869 Anos Manifestis Probatum",
                    "description": "Celebração dos 869 anos da Bula Manifestis Probatum"
                }
            ],
            "news": [
                {
                    "id": 1,
                    "title": "Celebração dos 846 annos da Manifestis Probatum",
                    "description": "Dia 23 de Maio de 2025 o Centro Académico Tradicionalista celebrou os 846 annos da bula manifestis...",
                    "date": "2025-05-23",
                    "image": "img/manifestisprobatumimg.jpg",
                    "content": "Dia 23 de Maio de 2025 o Centro Académico Tradicionalista celebrou os 846 annos da bula manifestis probatum lançada por sua sanctidade Papa Alexandre III, participámos da missa das 19:00 na Egreja de Nossa Senhora Concepção Velha, e posteriormente um momento de comes e bebes entre membros e não-membros do Centro."
                }
            ],
            "agenda": [
                {
                    "id": 1,
                    "title": "Manifestis Probatum",
                    "description": "Celebração da Bula Manifestis Probatum, Sancta Missa e jantar/convívio com membros e simpatizantes do CAT.",
                    "date": "2025-05-23",
                    "time": "19:00-20:30",
                    "location": "Igreja de Nossa Senhora da Conceição Velha",
                    "image": "img/869annosmp.png",
                    "type": "meeting"
                }
            ],
            "texts": {
                "sections": {
                    "participant": "Participante"
                },
                "buttons": {
                    "updating": "A atualizar..."
                },
                "modals": {
                    "updateSuccess": "Conteúdo atualizado com sucesso!",
                    "updateError": "Erro ao atualizar conteúdo"
                }
            }
        };
    }

    startBannerCarousel() {
        if (!this.appData.banners || this.appData.banners.length === 0) return;

        // Clear existing interval
        if (this.bannerInterval) {
            clearInterval(this.bannerInterval);
        }

        // Reset current banner
        this.currentBanner = 0;

        // Atualizar banners no HTML
        this.updateBanners();

        // Auto-rotate banners only if there's more than one
        if (this.appData.banners.length > 1) {
            this.bannerInterval = setInterval(() => {
                this.nextBanner();
            }, 5000);
        }
    }

    updateBanners() {
        const bannerContainer = document.querySelector('.banner-carousel');
        const bannersHtml = this.appData.banners.map((banner, index) => `
            <div class="banner ${index === 0 ? 'active' : ''}" style="background-image: url('${banner.image}')">
                <div class="banner-content">
                    <h2>${banner.title}</h2>
                    <p>${banner.description}</p>
                </div>
            </div>
        `).join('');

        const indicatorsHtml = this.appData.banners.length > 1 ? `
            <div class="banner-indicators">
                ${this.appData.banners.map((_, index) => `
                    <span class="indicator ${index === 0 ? 'active' : ''}"></span>
                `).join('')}
            </div>
        ` : '';

        bannerContainer.innerHTML = bannersHtml + indicatorsHtml;
    }

    nextBanner() {
        this.currentBanner = (this.currentBanner + 1) % this.appData.banners.length;
        this.setBanner(this.currentBanner);
    }

    setBanner(index) {
        this.currentBanner = index;
        
        // Update banner visibility
        document.querySelectorAll('.banner').forEach((banner, i) => {
            banner.classList.toggle('active', i === index);
        });
        
        // Update indicators
        document.querySelectorAll('.indicator').forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }

    toggleMenu() {
        const sideMenu = document.getElementById('sideMenu');
        const menuOverlay = document.getElementById('menuOverlay');
        
        sideMenu.classList.toggle('open');
        menuOverlay.classList.toggle('active');
    }

    closeMenu() {
        const sideMenu = document.getElementById('sideMenu');
        const menuOverlay = document.getElementById('menuOverlay');
        
        sideMenu.classList.remove('open');
        menuOverlay.classList.remove('active');
    }

    navigateToPage(page) {
        // Update current page
        this.currentPage = page;
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        
        // Show target page
        document.getElementById(`${page}Page`).classList.add('active');
        
        // Update navigation active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeNavItem = document.querySelector(`[data-page="${page}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        // Render page content
        switch(page) {
            case 'home':
                this.renderHomeContent();
                break;
            case 'news':
                this.renderAllNews();
                break;
            case 'agenda':
                this.renderAllAgenda();
                break;
        }
    }

    renderHomeContent() {
        if (!this.appData) return;

        // Render recent news (limit to 3)
        const recentNews = this.appData.news.slice(0, 3);
        this.renderNewsGrid(recentNews, 'newsGrid');
        
        // Render upcoming agenda (limit to 3)
        const upcomingAgenda = this.getFilteredAgenda('future').slice(0, 3);
        this.renderAgendaGrid(upcomingAgenda, 'agendaGrid');
    }

    renderAllNews() {
        this.renderNewsGrid(this.appData.news, 'allNewsGrid');
    }

    renderAllAgenda() {
        const filteredAgenda = this.getFilteredAgenda(this.currentFilter);
        this.renderAgendaGrid(filteredAgenda, 'allAgendaGrid');
    }

    renderNewsGrid(newsItems, containerId) {
        const container = document.getElementById(containerId);
        
        if (newsItems.length === 0) {
            container.innerHTML = '<p>Nenhuma notícia disponível.</p>';
            return;
        }
        
        container.innerHTML = newsItems.map(news => `
            <div class="card" data-news-id="${news.id}">
                <div class="card-image" style="background-image: url('${news.image}')"></div>
                <div class="card-content">
                    <div class="card-date">${this.formatDate(news.date)}</div>
                    <h3 class="card-title">${news.title}</h3>
                    <p class="card-description">${news.description}</p>
                </div>
            </div>
        `).join('');
    }

    renderAgendaGrid(agendaItems, containerId) {
        const container = document.getElementById(containerId);
        
        if (agendaItems.length === 0) {
            container.innerHTML = '<p>Nenhum evento disponível.</p>';
            return;
        }
        
        container.innerHTML = agendaItems.map(event => `
            <div class="card" data-event-id="${event.id}">
                <div class="card-image" style="background-image: url('${event.image}')"></div>
                <div class="card-content">
                    <div class="card-date">${this.formatDate(event.date)}</div>
                    <h3 class="card-title">${event.title}</h3>
                    <p class="card-description">${event.description}</p>
                    ${event.location ? `<div class="card-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    getFilteredAgenda(filter) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.appData.agenda.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            
            if (filter === 'future') {
                return eventDate >= today;
            } else {
                return eventDate < today;
            }
        }).sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return filter === 'future' ? dateA - dateB : dateB - dateA;
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });
        
        // Re-render agenda
        this.renderAllAgenda();
    }

    showNewsModal(newsId) {
        const news = this.appData.news.find(n => n.id === newsId);
        if (!news) return;
        
        const modal = document.getElementById('newsModal');
        const content = document.getElementById('newsModalContent');
        
        content.innerHTML = `
            <div class="modal-image" style="background-image: url('${news.image}')"></div>
            <div class="modal-date">${this.formatDate(news.date)}</div>
            <h2 class="modal-title">${news.title}</h2>
            <div class="modal-description">${news.content}</div>
        `;
        
        modal.classList.add('active');
    }

    showEventModal(eventId) {
        const event = this.appData.agenda.find(e => e.id === eventId);
        if (!event) return;
        
        const modal = document.getElementById('eventModal');
        const content = document.getElementById('eventModalContent');
        
        content.innerHTML = `
            <div class="modal-image" style="background-image: url('${event.image}')"></div>
            <div class="modal-date">${this.formatDate(event.date)} ${event.time ? `• ${event.time}` : ''}</div>
            <h2 class="modal-title">${event.title}</h2>
            <div class="modal-description">${event.description}</div>
            ${event.location ? `<div class="modal-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>` : ''}
        `;
        
        modal.classList.add('active');
    }

    hideNewsModal() {
        document.getElementById('newsModal').classList.remove('active');
    }

    hideEventModal() {
        document.getElementById('eventModal').classList.remove('active');
    }

    showExitModal() {
        document.getElementById('exitModal').classList.add('active');
    }

    hideExitModal() {
        document.getElementById('exitModal').classList.remove('active');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        this.closeMenu();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CentroAcademicoApp();
});

// Handle page visibility change (for mobile apps)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('App moved to background');
    } else {
        console.log('App moved to foreground');
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('App is online');
});

window.addEventListener('offline', () => {
    console.log('App is offline');
});

// Service Worker registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
