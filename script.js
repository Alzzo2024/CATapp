class CentroAcademicoApp {
    constructor() {
        this.appData = null;
        this.currentPage = 'home';
        this.currentBanner = 0;
        this.bannerInterval = null;
        this.currentFilter = 'future';
        
        this.init();
    }

    async init() {
        console.log('Inicializando app...');
        
        // Show splash screen
        this.showSplashScreen();
        
        // Load data
        await this.loadData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize app
        this.updateAppInfo();
        this.renderMenu();
        this.renderSettings();
        this.renderHomeContent();
        this.startBannerCarousel();
        
        // Hide splash and show app
        setTimeout(() => {
            this.hideSplashScreen();
        }, 2000);
    }

    showSplashScreen() {
        const splashScreen = document.getElementById('splashScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (splashScreen) splashScreen.style.display = 'flex';
        if (mainApp) mainApp.classList.add('hidden');
    }

    hideSplashScreen() {
        const splashScreen = document.getElementById('splashScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (splashScreen) {
            splashScreen.style.opacity = '0';
            setTimeout(() => {
                splashScreen.style.display = 'none';
                if (mainApp) mainApp.classList.remove('hidden');
            }, 300);
        }
    }

    async loadData() {
        try {
            console.log('Carregando dados...');
            const timestamp = new Date().getTime();
            const response = await fetch(`data.json?v=${timestamp}`);
            
            if (response.ok) {
                this.appData = await response.json();
                console.log('Dados carregados:', this.appData);
            } else {
                throw new Error('Falha ao carregar dados');
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.loadSampleData();
        }
    }

    updateAppInfo() {
        if (!this.appData) return;
        
        // Update document title
        document.title = this.appData.app.name;
        
        // Update theme color
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor && this.appData.app.colors) {
            themeColor.content = this.appData.app.colors.primary;
        }
    }

    renderMenu() {
        if (!this.appData) return;
        
        const sideMenuNav = document.getElementById('sideMenuNav');
        const participantSection = document.getElementById('participantSection');
        
        if (sideMenuNav && this.appData.menu.navigation) {
            sideMenuNav.innerHTML = this.appData.menu.navigation.map(item => `
                <a href="#" class="nav-item ${item.id === this.currentPage ? 'active' : ''}" data-page="${item.id}">
                    <i class="${item.icon}"></i> ${item.title}
                </a>
            `).join('');
        }
        
        if (participantSection && this.appData.menu.participant) {
            participantSection.innerHTML = `
                <h3>${this.appData.texts.sections.participant}</h3>
                ${this.appData.menu.participant.map(item => `
                    <a href="${item.url}" class="nav-item" target="_blank" rel="noopener">
                        <i class="${item.icon}"></i> ${item.title}
                    </a>
                `).join('')}
            `;
        }
    }

    renderSettings() {
        if (!this.appData) return;
        
        const settingsList = document.getElementById('settingsList');
        
        if (settingsList && this.appData.settings.items) {
            settingsList.innerHTML = this.appData.settings.items.map(item => {
                if (item.type === 'action') {
                    return `
                        <div class="settings-item" data-action="${item.id}">
                            <i class="${item.icon}"></i>
                            <span>${item.title}</span>
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    `;
                } else if (item.type === 'link') {
                    return `
                        <a href="${item.url}" class="settings-item" target="_blank" rel="noopener">
                            <i class="${item.icon}"></i>
                            <span>${item.title}</span>
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    `;
                } else if (item.type === 'info') {
                    return `
                        <div class="settings-item">
                            <i class="${item.icon}"></i>
                            <span>${item.title}</span>
                            <span class="version">${item.value}</span>
                        </div>
                    `;
                }
                return '';
            }).join('');
        }
    }

    setupEventListeners() {
        console.log('Configurando event listeners...');
        
        // Menu button
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Menu button clicked');
                this.toggleMenu();
            });
        }

        // Menu overlay
        const menuOverlay = document.getElementById('menuOverlay');
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => {
                console.log('Menu overlay clicked');
                this.closeMenu();
            });
        }

        // Close modal buttons
        const closeNewsModal = document.getElementById('closeNewsModal');
        const closeEventModal = document.getElementById('closeEventModal');
        
        if (closeNewsModal) {
            closeNewsModal.addEventListener('click', () => this.hideNewsModal());
        }
        
        if (closeEventModal) {
            closeEventModal.addEventListener('click', () => this.hideEventModal());
        }

        // Exit modal buttons
        const cancelExit = document.getElementById('cancelExit');
        const confirmExit = document.getElementById('confirmExit');
        
        if (cancelExit) {
            cancelExit.addEventListener('click', () => this.hideExitModal());
        }
        
        if (confirmExit) {
            confirmExit.addEventListener('click', () => {
                if (window.navigator && window.navigator.app) {
                    window.navigator.app.exitApp();
                } else {
                    window.close();
                }
            });
        }

        // Global click handler
        document.addEventListener('click', (e) => {
            console.log('Click detected on:', e.target);
            
            // Navigation items
            if (e.target.closest('.nav-item[data-page]')) {
                e.preventDefault();
                const navItem = e.target.closest('.nav-item[data-page]');
                const page = navItem.dataset.page;
                console.log('Navigation to:', page);
                this.navigateToPage(page);
                this.closeMenu();
                return;
            }

            // Back buttons
            if (e.target.closest('.back-btn[data-target]')) {
                e.preventDefault();
                const backBtn = e.target.closest('.back-btn[data-target]');
                const target = backBtn.dataset.target;
                console.log('Back to:', target);
                this.navigateToPage(target);
                return;
            }

            // See all buttons
            if (e.target.closest('.see-all-btn[data-target]')) {
                e.preventDefault();
                const seeAllBtn = e.target.closest('.see-all-btn[data-target]');
                const target = seeAllBtn.dataset.target;
                console.log('See all:', target);
                this.navigateToPage(target);
                return;
            }

            // Filter tabs
            if (e.target.closest('.filter-tab[data-filter]')) {
                e.preventDefault();
                const filterTab = e.target.closest('.filter-tab[data-filter]');
                const filter = filterTab.dataset.filter;
                console.log('Filter:', filter);
                this.setFilter(filter);
                return;
            }

            // Settings actions
            if (e.target.closest('.settings-item[data-action]')) {
                e.preventDefault();
                const settingsItem = e.target.closest('.settings-item[data-action]');
                const action = settingsItem.dataset.action;
                console.log('Settings action:', action);
                if (action === 'update') {
                    this.forceUpdate();
                }
                return;
            }

            // News cards
            if (e.target.closest('.card[data-news-id]')) {
                e.preventDefault();
                const card = e.target.closest('.card[data-news-id]');
                const newsId = parseInt(card.dataset.newsId);
                console.log('News clicked:', newsId);
                this.showNewsModal(newsId);
                return;
            }

            // Event cards
            if (e.target.closest('.card[data-event-id]')) {
                e.preventDefault();
                const card = e.target.closest('.card[data-event-id]');
                const eventId = parseInt(card.dataset.eventId);
                console.log('Event clicked:', eventId);
                this.showEventModal(eventId);
                return;
            }

            // Modal backgrounds
            if (e.target.classList.contains('modal')) {
                console.log('Modal background clicked');
                this.closeAllModals();
                return;
            }

            // Banner indicators
            if (e.target.closest('.indicator[data-index]')) {
                e.preventDefault();
                const indicator = e.target.closest('.indicator[data-index]');
                const index = parseInt(indicator.dataset.index);
                console.log('Banner indicator clicked:', index);
                this.setBanner(index);
                return;
            }
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Prevent context menu on long press (mobile)
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    startBannerCarousel() {
        console.log('Iniciando carousel de banners...');
        
        if (!this.appData || !this.appData.banners || this.appData.banners.length === 0) {
            console.log('Nenhum banner encontrado');
            const bannerCarousel = document.getElementById('bannerCarousel');
            if (bannerCarousel) {
                bannerCarousel.style.display = 'none';
            }
            return;
        }

        // Clear existing interval
        if (this.bannerInterval) {
            clearInterval(this.bannerInterval);
        }

        // Reset current banner
        this.currentBanner = 0;

        // Update banners
        this.updateBanners();

        // Auto-rotate banners only if there's more than one
        if (this.appData.banners.length > 1) {
            this.bannerInterval = setInterval(() => {
                this.nextBanner();
            }, 5000);
        }
    }

    updateBanners() {
        console.log('Atualizando banners...');
        
        const bannerContainer = document.getElementById('bannerContainer');
        const bannerIndicators = document.getElementById('bannerIndicators');
        
        if (!bannerContainer || !this.appData.banners) return;

        // Create banners
        bannerContainer.innerHTML = this.appData.banners.map((banner, index) => `
            <div class="banner ${index === 0 ? 'active' : ''}" style="background-image: url('${banner.image}')">
                <div class="banner-content">
                    <h2>${banner.title}</h2>
                    <p>${banner.description}</p>
                </div>
            </div>
        `).join('');

        // Create indicators if more than one banner
        if (bannerIndicators && this.appData.banners.length > 1) {
            bannerIndicators.innerHTML = this.appData.banners.map((_, index) => `
                <span class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
            `).join('');
            bannerIndicators.style.display = 'flex';
        } else if (bannerIndicators) {
            bannerIndicators.style.display = 'none';
        }

        console.log('Banners atualizados:', this.appData.banners.length);
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
        console.log('Toggling menu...');
        const sideMenu = document.getElementById('sideMenu');
        const menuOverlay = document.getElementById('menuOverlay');
        
        if (sideMenu && menuOverlay) {
            const isOpen = sideMenu.classList.contains('open');
            
            if (isOpen) {
                this.closeMenu();
            } else {
                sideMenu.classList.add('open');
                menuOverlay.classList.add('active');
                console.log('Menu opened');
            }
        }
    }

    closeMenu() {
        console.log('Closing menu...');
        const sideMenu = document.getElementById('sideMenu');
        const menuOverlay = document.getElementById('menuOverlay');
        
        if (sideMenu) sideMenu.classList.remove('open');
        if (menuOverlay) menuOverlay.classList.remove('active');
    }

    navigateToPage(page) {
        console.log('Navegando para:', page);
        
        // Update current page
        this.currentPage = page;
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(`${page}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Update navigation active state
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
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
            case 'settings':
                // Settings already rendered
                break;
        }
    }

    renderHomeContent() {
        console.log('Renderizando conteúdo da home...');
        this.renderNews(true);
        this.renderAgenda(true);
    }

    renderNews(isHome = false) {
        if (!this.appData || !this.appData.news) return;
        
        const targetGrid = isHome ? document.getElementById('newsGrid') : document.getElementById('allNewsGrid');
        if (!targetGrid) return;
        
        const newsToShow = isHome ? this.appData.news.slice(0, 3) : this.appData.news;
        
        targetGrid.innerHTML = newsToShow.map(news => `
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

    renderAllNews() {
        console.log('Renderizando todas as notícias...');
        this.renderNews(false);
    }

    renderAgenda(isHome = false) {
        if (!this.appData || !this.appData.agenda) return;
        
        const targetGrid = isHome ? document.getElementById('agendaGrid') : document.getElementById('allAgendaGrid');
        if (!targetGrid) return;
        
        let agendaToShow = this.appData.agenda;
        
        if (!isHome) {
            // Apply filter
            const now = new Date();
            agendaToShow = this.appData.agenda.filter(event => {
                const eventDate = new Date(event.date);
                return this.currentFilter === 'future' ? eventDate >= now : eventDate < now;
            });
        } else {
            // Show only next 3 events for home
            agendaToShow = this.appData.agenda.slice(0, 3);
        }
        
        targetGrid.innerHTML = agendaToShow.map(event => `
            <div class="card" data-event-id="${event.id}">
                <div class="card-image" style="background-image: url('${event.image}')"></div>
                <div class="card-content">
                    <div class="card-date">${this.formatDate(event.date)}</div>
                    <h3 class="card-title">${event.title}</h3>
                    <p class="card-description">${event.description}</p>
                    <div class="card-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${event.location}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderAllAgenda() {
        console.log('Renderizando toda a agenda...');
        this.renderAgenda(false);
    }

    setFilter(filter) {
        console.log('Definindo filtro:', filter);
        this.currentFilter = filter;
        
        // Update filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // Re-render agenda
        this.renderAllAgenda();
    }

    showNewsModal(newsId) {
        console.log('Mostrando modal de notícia:', newsId);
        
        if (!this.appData || !this.appData.news) return;
        
        const news = this.appData.news.find(n => n.id === newsId);
        if (!news) return;
        
        const newsModal = document.getElementById('newsModal');
        const newsModalContent = document.getElementById('newsModalContent');
        
        if (newsModalContent) {
            newsModalContent.innerHTML = `
                <div class="modal-image" style="background-image: url('${news.image}')"></div>
                <div class="modal-date">${this.formatDate(news.date)}</div>
                <h2 class="modal-title">${news.title}</h2>
                <div class="modal-description">${news.content || news.description}</div>
            `;
        }
        
        if (newsModal) {
            newsModal.classList.add('active');
        }
    }

    showEventModal(eventId) {
        console.log('Mostrando modal de evento:', eventId);
        
        if (!this.appData || !this.appData.agenda) return;
        
        const event = this.appData.agenda.find(e => e.id === eventId);
        if (!event) return;
        
        const eventModal = document.getElementById('eventModal');
        const eventModalContent = document.getElementById('eventModalContent');
        
        if (eventModalContent) {
            eventModalContent.innerHTML = `
                <div class="modal-image" style="background-image: url('${event.image}')"></div>
                <div class="modal-date">${this.formatDate(event.date)}</div>
                <h2 class="modal-title">${event.title}</h2>
                <div class="modal-description">${event.description}</div>
                <div class="modal-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${event.location}
                </div>
                ${event.time ? `<div class="modal-time"><i class="fas fa-clock"></i> ${event.time}</div>` : ''}
            `;
        }
        
        if (eventModal) {
            eventModal.classList.add('active');
        }
    }

    hideNewsModal() {
        console.log('Escondendo modal de notícia');
        const newsModal = document.getElementById('newsModal');
        if (newsModal) {
            newsModal.classList.remove('active');
        }
    }

    hideEventModal() {
        console.log('Escondendo modal de evento');
        const eventModal = document.getElementById('eventModal');
        if (eventModal) {
            eventModal.classList.remove('active');
        }
    }

    hideExitModal() {
        const exitModal = document.getElementById('exitModal');
        if (exitModal) {
            exitModal.classList.remove('active');
        }
    }

    closeAllModals() {
        console.log('Fechando todos os modais');
        this.hideNewsModal();
        this.hideEventModal();
        this.hideExitModal();
    }

    async forceUpdate() {
        console.log('Forçando atualização...');
        
        const updateBtn = document.querySelector('[data-action="update"]');
        if (updateBtn) {
            const originalText = updateBtn.querySelector('span').textContent;
            updateBtn.querySelector('span').textContent = this.appData.texts.buttons.updating || 'A atualizar...';
            updateBtn.style.opacity = '0.6';
            updateBtn.style.pointerEvents = 'none';
            
            try {
                await this.loadData();
                this.renderMenu();
                this.renderSettings();
                this.renderHomeContent();
                this.startBannerCarousel();
                
                // Show success message
                this.showToast(this.appData.texts.modals.updateSuccess || 'Conteúdo atualizado com sucesso!');
                
            } catch (error) {
                console.error('Erro na atualização:', error);
                this.showToast(this.appData.texts.modals.updateError || 'Erro ao atualizar conteúdo');
            } finally {
                updateBtn.querySelector('span').textContent = originalText;
                updateBtn.style.opacity = '1';
                updateBtn.style.pointerEvents = 'auto';
            }
        }
    }

    showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 100);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-PT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    loadSampleData() {
        console.log('Carregando dados de exemplo...');
        this.appData = {
            app: {
                name: "Centro Académico Tradicionalista",
                shortName: "CAT",
                version: "1.0.3",
                logo: "img/CATlogo.png",
                colors: {
                    primary: "#9c2336",
                    primaryDark: "#7a1c2a",
                    primaryLight: "#b8394d"
                }
            },
            menu: {
                navigation: [
                    { id: "home", title: "Início", icon: "fas fa-home" },
                    { id: "news", title: "Notícias", icon: "fas fa-newspaper" },
                    { id: "agenda", title: "Agenda", icon: "fas fa-calendar" }
                ],
                participant: [
                    { title: "Tornar-se Participante", icon: "fas fa-user-plus", url: "#" }
                ]
            },
            settings: {
                items: [
                    { title: "Atualizar Conteúdo", icon: "fas fa-sync-alt", type: "action", id: "update" },
                    { title: "Website Oficial", icon: "fas fa-globe", type: "link", url: "#" },
                    { title: "Contactos", icon: "fas fa-envelope", type: "link", url: "#" },
                    { title: "Versão", icon: "fas fa-info-circle", type: "info", value: "1.0.3" }
                ]
            },
            banners: [
                {
                    id: 1,
                    image: "img/869annosmp.png",
                    title: "869 Anos Manifestis Probatum",
                    description: "Celebração dos 869 anos da Bula Manifestis Probatum"
                }
            ],
            news: [
                {
                    id: 1,
                    title: "Exemplo de Notícia",
                    description: "Esta é uma notícia de exemplo...",
                    date: "2025-01-15",
                    image: "img/CATlogo.png",
                    content: "Conteúdo completo da notícia de exemplo."
                }
            ],
            agenda: [
                {
                    id: 1,
                    title: "Evento de Exemplo",
                    description: "Este é um evento de exemplo...",
                    date: "2025-02-15",
                    time: "19:00-21:00",
                    location: "Local de Exemplo",
                    image: "img/CATlogo.png"
                }
            ],
            texts: {
                sections: { participant: "Participante" },
                buttons: { updating: "A atualizar...", seeAll: "Ver todas", back: "Voltar" },
                modals: {
                    updateSuccess: "Conteúdo atualizado com sucesso!",
                    updateError: "Erro ao atualizar conteúdo"
                },
                filters: { future: "Futuros", past: "Passados" }
            }
        };
    }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando app...');
    app = new CentroAcademicoApp();
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('App em background');
        if (app && app.bannerInterval) {
            clearInterval(app.bannerInterval);
        }
    } else {
        console.log('App em foreground');
        if (app && app.appData && app.appData.banners && app.appData.banners.length > 1) {
            app.startBannerCarousel();
        }
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('App online');
    if (app) {
        app.showToast('Ligação restabelecida');
    }
});

window.addEventListener('offline', () => {
    console.log('App offline');
    if (app) {
        app.showToast('Sem ligação à internet');
    }
});

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registado:', registration);
            })
            .catch((registrationError) => {
                console.log('Falha no registo SW:', registrationError);
            });
    });
}

// Handle back button on Android
document.addEventListener('backbutton', (e) => {
    e.preventDefault();
    
    if (app) {
        // Check if any modal is open
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            app.closeAllModals();
            return;
        }
        
        // Check if menu is open
        const sideMenu = document.getElementById('sideMenu');
        if (sideMenu && sideMenu.classList.contains('open')) {
            app.closeMenu();
            return;
        }
        
        // Check current page
        if (app.currentPage !== 'home') {
            app.navigateToPage('home');
            return;
        }
        
        // Show exit confirmation
        const exitModal = document.getElementById('exitModal');
        if (exitModal) {
            exitModal.classList.add('active');
        }
    }
}, false);

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Prevent pull to refresh
document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) { return; }
        const scrollY = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
    if (scrollY === 0) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    const scrollY = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
    if (scrollY === 0) {
        e.preventDefault();
    }
}, { passive: false });

// Handle device orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (app) {
            app.updateBanners();
        }
    }, 500);
});

// Handle app install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('Install prompt available');
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or banner
    const installBanner = document.createElement('div');
    installBanner.className = 'install-banner';
    installBanner.innerHTML = `
        <div class="install-content">
            <span>Instalar aplicação</span>
            <button class="install-btn" id="installBtn">Instalar</button>
            <button class="install-close" id="installClose">×</button>
        </div>
    `;
    installBanner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #9c2336;
        color: white;
        padding: 10px;
        z-index: 9999;
        transform: translateY(-100%);
        transition: transform 0.3s;
    `;
    
    document.body.appendChild(installBanner);
    
    setTimeout(() => {
        installBanner.style.transform = 'translateY(0)';
    }, 1000);
    
    document.getElementById('installBtn').addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('Install outcome:', outcome);
            deferredPrompt = null;
            installBanner.remove();
        }
    });
    
    document.getElementById('installClose').addEventListener('click', () => {
        installBanner.remove();
    });
});

// Handle successful app install
window.addEventListener('appinstalled', () => {
    console.log('App installed successfully');
    if (app) {
        app.showToast('Aplicação instalada com sucesso!');
    }
});

// Handle app updates
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('App updated');
        if (app) {
            app.showToast('Aplicação atualizada. Reinicie para ver as alterações.');
        }
    });
}

// Performance monitoring
window.addEventListener('load', () => {
    if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
    }
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (app) {
        app.showToast('Ocorreu um erro. Tente novamente.');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    if (app) {
        app.showToast('Erro de ligação. Verifique a sua internet.');
    }
});

// Memory management
window.addEventListener('beforeunload', () => {
    if (app && app.bannerInterval) {
        clearInterval(app.bannerInterval);
    }
});

// Touch gestures for banner navigation
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    const bannerCarousel = document.getElementById('bannerCarousel');
    if (bannerCarousel && bannerCarousel.contains(e.target)) {
        touchStartX = e.changedTouches[0].screenX;
    }
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const bannerCarousel = document.getElementById('bannerCarousel');
    if (bannerCarousel && bannerCarousel.contains(e.target)) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }
}, { passive: true });

function handleSwipe() {
    if (!app || !app.appData || !app.appData.banners || app.appData.banners.length <= 1) return;
    
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next banner
            app.nextBanner();
        } else {
            // Swipe right - previous banner
            const prevIndex = app.currentBanner === 0 ? 
                app.appData.banners.length - 1 : 
                app.currentBanner - 1;
            app.setBanner(prevIndex);
        }
        
        // Reset auto-rotation
        if (app.bannerInterval) {
            clearInterval(app.bannerInterval);
            app.bannerInterval = setInterval(() => {
                app.nextBanner();
            }, 5000);
        }
    }
}

// Accessibility improvements
document.addEventListener('keydown', (e) => {
    // Tab navigation
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
    
    // Arrow key navigation for banners
    if (app && app.appData && app.appData.banners && app.appData.banners.length > 1) {
        if (e.key === 'ArrowLeft') {
            const bannerCarousel = document.getElementById('bannerCarousel');
            if (document.activeElement && bannerCarousel && bannerCarousel.contains(document.activeElement)) {
                e.preventDefault();
                const prevIndex = app.currentBanner === 0 ? 
                    app.appData.banners.length - 1 : 
                    app.currentBanner - 1;
                app.setBanner(prevIndex);
            }
        } else if (e.key === 'ArrowRight') {
            const bannerCarousel = document.getElementById('bannerCarousel');
            if (document.activeElement && bannerCarousel && bannerCarousel.contains(document.activeElement)) {
                e.preventDefault();
                app.nextBanner();
            }
        }
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// Lazy loading for images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        }
    });
});

// Observe images when they're added to the DOM
const observeImages = () => {
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
};

// Call observeImages after content updates
const originalRenderNews = CentroAcademicoApp.prototype.renderNews;
CentroAcademicoApp.prototype.renderNews = function(...args) {
    originalRenderNews.apply(this, args);
    setTimeout(observeImages, 100);
};

const originalRenderAgenda = CentroAcademicoApp.prototype.renderAgenda;
CentroAcademicoApp.prototype.renderAgenda = function(...args) {
    originalRenderAgenda.apply(this, args);
    setTimeout(observeImages, 100);
};

// Debug mode
if (window.location.search.includes('debug=true')) {
    console.log('Debug mode enabled');
    window.app = app;
    
    // Add debug panel
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debugPanel';
    debugPanel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 10000;
        max-width: 200px;
    `;
    
    const updateDebugInfo = () => {
        if (app) {
            debugPanel.innerHTML = `
                <strong>Debug Info</strong><br>
                Page: ${app.currentPage}<br>
                Banner: ${app.currentBanner}<br>
                Filter: ${app.currentFilter}<br>
                Data loaded: ${!!app.appData}<br>
                News count: ${app.appData?.news?.length || 0}<br>
                Events count: ${app.appData?.agenda?.length || 0}<br>
                Banners count: ${app.appData?.banners?.length || 0}
            `;
        }
    };
    
    document.body.appendChild(debugPanel);
    setInterval(updateDebugInfo, 1000);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CentroAcademicoApp;
}
