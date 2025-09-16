# DAREMON Radio ETS

Oficjalne radio firmowe DAREMON ETS - Progressive Web App z funkcjami zarządzania projektami.

## Funkcje

- 🎵 **Radio Online** - Odtwarzanie 147 utworów MP3
- 📋 **Zarządzanie Projektami** - System Kanban i Gantt
- 📅 **Planowanie Maszyn** - Kalendarz i harmonogramowanie
- 🔄 **PWA** - Działa offline, instalowalne na urządzeniach
- 🎨 **GSAP Animacje** - Nowoczesne animacje z fallbackiem
- 🌓 **Tryb Ciemny/Jasny** - Przełączalne motywy
- 🌐 **Międzynarodowość** - Obsługa Polski i Holenderski

## Szybkie Uruchomienie

### Wymagania
- Node.js >= 18.0.0
- pnpm (zalecane) lub npm

### Instalacja

```bash
# Klonowanie repozytorium
git clone <repo-url>
cd Radio_DAREMON_ETS

# Instalacja zależności
pnpm install
# lub
npm install
```

### Rozwój

```bash
# Uruchomienie serwera developerskiego (Vite)
pnpm dev
# lub
npm run dev

# Dostęp: http://localhost:8000
```

### Budowanie

```bash
# Budowanie dla produkcji
pnpm build
# lub  
npm run build

# Podgląd buildu
pnpm preview
# lub
npm run preview
```

### Alternatywne uruchomienie (Python)

```bash
# Serwer HTTP (fallback)
pnpm serve
# lub
npm run serve
```

## Struktura Projektu

```
├── index.html              # Główna strona radia
├── machine-planning.html   # Planowanie maszyn  
├── project-management.html # Zarządzanie projektami
├── project-panel.html      # Panel projektów
├── app.js                  # Główna logika aplikacji
├── project-panel.js        # Logika zarządzania projektami
├── styles.css              # Główne style
├── project-panel.css       # Style panelu projektów
├── sw.js                   # Service Worker (PWA)
├── manifest.json           # Manifest PWA
├── playlist.json           # 147 utworów muzycznych
├── vite.config.js          # Konfiguracja Vite
├── /icons/                 # Ikony PWA
├── /locales/              # Pliki tłumaczeń (pl/nl)
├── /music/                # Pliki MP3 (147 utworów)
└── /public/               # Zasoby statyczne
```

## Playlist i Muzyka

Aplikacja obsługuje 147 utworów MP3 zdefiniowanych w `playlist.json`. Pliki powinny być umieszczone w folderze `/music/` według wzorca:
- `/music/Utwor (1).mp3`
- `/music/Utwor (2).mp3`
- ... 
- `/music/Utwor (147).mp3`

## PWA (Progressive Web App)

Aplikacja jest w pełni funkcjonalna PWA:
- ✅ Service Worker dla cache'owania i pracy offline
- ✅ Manifest.json z ikonami
- ✅ Instalowalna na urządzeniach mobilnych i desktop
- ✅ Responsywny design

## Technologie

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Build Tool**: Vite
- **Animacje**: GSAP (z fallbackiem)
- **PWA**: Service Worker, Web App Manifest
- **Zarządzanie Pakietów**: pnpm/npm

## Rozwój

### Testowanie

```bash
# Walidacja plików JSON
pnpm validate
# lub
npm run validate

# Linting (placeholder)
pnpm lint

# Testy (placeholder) 
pnpm test
```

### Struktura Komponentów

- **Radio Player** - `app.js` - główny odtwarzacz z GSAP
- **Project Management** - `project-panel.js` - system Kanban/Gantt
- **Service Worker** - `sw.js` - cache offline i PWA
- **Internationalization** - `/locales/` - tłumaczenia PL/NL

## Licencja

MIT License - DAREMON Team

## Wsparcie

Dla zespołu ETS - aplikacja demonstracyjna do celów wewnętrznych.