class CentroAcademicoApp {
    constructor() {
        this.currentPage = 'home';
        this.currentBanner = 0;
        this.bannerInterval = null;
        this.newsData = [];
        this.agendaData = [];
        this.currentFilter = 'future';
        
        this.init();
    }

    init() {
        this.showSplashScreen();
        this.setupEventListeners();
        this.loadSampleData();
        this.startBannerCarousel();
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
        document.getElementById('menuBtn').addEventListener('click', () => {
            this.toggleMenu();
        });

        // Menu overlay
        document.getElementById('menuOverlay').addEventListener('click', () => {
            this.closeMenu();
        });

        // Navigation items
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateToPage(page);
                this.closeMenu();
            });
        });

        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                this.navigateToPage(target);
            });
        });

        // See all buttons
        document.querySelectorAll('.see-all-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                this.navigateToPage(target);
            });
        });

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const filter = tab.dataset.filter;
                this.setFilter(filter);
            });
        });

        // Join button
        document.getElementById('joinBtn').addEventListener('click', (e) => {
            e.preventDefault();
            window.open('https://docs.google.com/forms/d/19uH0J-vqJgFcI3pnGGYU3jXccyD7N5gILXuxEOJJO78/viewform?edit_requested=true', '_blank');
        });

        // Exit confirmation
        document.getElementById('cancelExit').addEventListener('click', () => {
            this.hideExitModal();
        });

        document.getElementById('confirmExit').addEventListener('click', () => {
            window.close();
        });

        // Modal close buttons
        document.getElementById('closeNewsModal').addEventListener('click', () => {
            this.hideNewsModal();
        });

        document.getElementById('closeEventModal').addEventListener('click', () => {
            this.hideEventModal();
        });

        // Banner indicators
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.setBanner(index);
            });
        });

        // Handle browser back button and app exit
        window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            this.showExitModal();
            return '';
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    loadSampleData() {
        // Sample news data
        this.newsData = [
            {
                id: 1,
                title: "Celebração dos 869 annos da Manifestis Probatum",
                description: "Dia 23 de Maio de 2025 o Centro Académico Tradicionalista celebrou os 846 annos da bula manifestis...",
                date: "2025-05-23",
                image: "img/manifestisprobatumimg.jpg",
                content: "Dia 23 de Maio de 2025 o Centro Académico Tradicionalista celebrou os 846 annos da bula manifestis probatum lançada por sua sanctidade Papa Alexandre III, participámos da missa das 19:00 na Egreja de Nossa Senhora Concepção Velha, e posteriormente um momento de comes e bebes entre membros e não-membros do Centro."
            }
        ];

        // Sample agenda data
        this.agendaData = [
            {
                id: 1,
                title: "Manifestis Probatum",
                description: "Celebração da Bula Manifestis Probatum, Sancta Missa e jantar/convívio com membros e simpatizantes do CAT.",
                date: "2025-05-23",
                time: "19:00-20:30",
                location: "Igreja de Nossa Senhora da Conceição Velha",
                image: "img/869annosmp.png",
                type: "meeting"
            }
        ];
    }

    startBannerCarousel() {
        this.bannerInterval = setInterval(() => {
            this.nextBanner();
        }, 5000);
    }

    nextBanner() {
        const banners = document.querySelectorAll('.banner');
        const indicators = document.querySelectorAll('.indicator');
        
        banners[this.currentBanner].classList.remove('active');
        indicators[this.currentBanner].classList.remove('active');
        
        this.currentBanner = (this.currentBanner + 1) % banners.length;
        
        banners[this.currentBanner].classList.add('active');
        indicators[this.currentBanner].classList.add('active');
    }

    setBanner(index) {
        const banners = document.querySelectorAll('.banner');
        const indicators = document.querySelectorAll('.indicator');
        
        banners[this.currentBanner].classList.remove('active');
        indicators[this.currentBanner].classList.remove('active');
        
        this.currentBanner = index;
        
        banners[this.currentBanner].classList.add('active');
        indicators[this.currentBanner].classList.add('active');
        
        // Reset interval
        clearInterval(this.bannerInterval);
        this.startBannerCarousel();
    }

    toggleMenu() {
        const menu = document.getElementById('sideMenu');
        const overlay = document.getElementById('menuOverlay');
        
        menu.classList.toggle('open');
        overlay.classList.toggle('active');
    }

    closeMenu() {
        const menu = document.getElementById('sideMenu');
        const overlay = document.getElementById('menuOverlay');
        
        menu.classList.remove('open');
        overlay.classList.remove('active');
    }

    navigateToPage(pageName) {
        // Hide current page
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        document.getElementById(pageName + 'Page').classList.add('active');

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNav = document.querySelector(`[data-page="${pageName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }

        this.currentPage = pageName;

        // Load page-specific content
        switch(pageName) {
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
        this.renderNewsGrid(this.newsData.slice(0, 3), 'newsGrid');
        this.renderAgendaGrid(this.getFilteredAgenda('future').slice(0, 3), 'agendaGrid');
    }

    renderNewsGrid(newsItems, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        newsItems.forEach(news => {
            const card = this.createNewsCard(news);
            container.appendChild(card);
        });
    }

    renderAgendaGrid(agendaItems, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        agendaItems.forEach(event => {
            const card = this.createAgendaCard(event);
            container.appendChild(card);
        });
    }

    createNewsCard(news) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-image" style="background-image: url('${news.image}')"></div>
            <div class="card-content">
                <div class="card-date">${this.formatDate(news.date)}</div>
                <div class="card-title">${news.title}</div>
                <div class="card-description">${news.description}</div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.showNewsDetail(news);
        });

        return card;
    }

    createAgendaCard(event) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-image" style="background-image: url('${event.image}')"></div>
            <div class="card-content">
                <div class="card-date">${this.formatDate(event.date)} • ${event.time}</div>
                <div class="card-title">${event.title}</div>
                <div class="card-description">${event.description}</div>
                <div class="card-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${event.location}
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.showEventDetail(event);
        });

        return card;
    }

    renderAllNews() {
        this.renderNewsGrid(this.newsData, 'allNewsGrid');
    }

    renderAllAgenda() {
        const filteredEvents = this.getFilteredAgenda(this.currentFilter);
        this.renderAgendaGrid(filteredEvents, 'allAgendaGrid');
    }

    getFilteredAgenda(filter) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.agendaData.filter(event => {
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
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Re-render agenda
        this.renderAllAgenda();
    }

    showNewsDetail(news) {
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

    showEventDetail(event) {
        const modal = document.getElementById('eventModal');
        const content = document.getElementById('eventModalContent');
        
        content.innerHTML = `
            <div class="modal-image" style="background-image: url('${event.image}')"></div>
            <div class="modal-date">${this.formatDate(event.date)} • ${event.time}</div>
            <h2 class="modal-title">${event.title}</h2>
            <div class="modal-description">${event.description}</div>
            <div class="modal-location">
                <i class="fas fa-map-marker-alt"></i>
                ${event.location}
            </div>
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
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        return date.toLocaleDateString('pt-PT', options);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CentroAcademicoApp();
});

// Handle page visibility change (for mobile apps)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // App is in background
        console.log('App moved to background');
    } else {
        // App is in foreground
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
