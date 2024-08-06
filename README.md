# KODA Task
## Wyszukiwarka Lotów i Asystent Podróżnych

---

## Screens

<p float="left">
<img src="/screens/koda-task_1.png" alt="koda-task_1" width="220"/>
<img src="/screens/koda-task_2.png" alt="koda-task_2" width="220"/>
<img src="/screens/koda-task_3.png" alt="koda-task_3" width="220"/>
</p>

---

## Opis Projektu

Projekt to wirtualny asystent, który umożliwia wyszukiwanie lotów z Wrocławia przy użyciu SerpAPI Google Flights. Dodatkowo, dzięki implementacji metody Retrieval-Augmented Generation (RAG), odpowiedzi są wzbogacane o dodatkowe informacje dla podróżnych, pobierane z oficjalnej strony lotniska we Wrocławiu.

Projekt został podzielony na dwa główne moduły: serwer i klient, które znajdują się odpowiednio w katalogach `/server` i `/client`.

### Technologie

- **Serwer:** Node.js, Express, TypeScript, Cheerio, LangChain, Huggingface, Pinecone, CORS, Helmet
- **Klient:** Vite, Vue.js, Typescript, UnoCSS
- **Inne:** ESLint, Prettier, Husky + Lint staged, Dotenv

### Skalowalność

Projekt został zaprojektowany w sposób łatwy do skalowania. Nowe modele LLM można dodać poprzez rozszerzenie klasy `LLMBaseClass`, która definiuje podstawową strukturę systemu. Dodanie nowych klas obsługujących inne modele LLM pozwala na rozbudowę funkcjonalności projektu o nowe algorytmy i rozwiązania.

---

## Wymagania

Przed rozpoczęciem, upewnij się, że masz zainstalowane:

- Node.js (rekomendowane jest użycie [Bun](https://bun.sh/) dla lepszej wydajności)
- Docker (lub Podman dla lepszej wydajności) do uruchomienia kontenerów

---

## Instrukcje Instalacji i Uruchomienia

### Krok 1: Klonowanie repozytorium

```bash
git clone https://github.com/latinox33/koda-task
cd koda-task
```

### Krok 2: Instalacja zależności

W katalogu głównym projektu uruchom:
```bash
npm install
# lub
bun install #recommended
```

### Krok 3: Konfiguracja zmiennych środowiskowych

Przed uruchomieniem serwera, utwórz plik `.env` na podstawie pliku `.env.dist` i uzupełnij go odpowiednimi wartościami.

```dotenv
# Server
SERVER_PORT=3000
SERVER_HOST=localhost # 0.0.0.0 for Docker

# Client
VITE_PORT=5173
VITE_HOST=localhost # 0.0.0.0 for Docker
VITE_API_ORIGIN=http://localhost:3000 # http://0.0.0.0:3000 for Docker

# LLM
SERPAPI_API_KEY=your_serpapi_api_key
PINECONE_API_KEY=your_pinecone_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
PINECONE_INDEX=quickstart
```

### Krok 4: Uruchomienie projektu

Wersja rekomendowana:

Aby uruchomić projekt w trybie developerskim, wykonaj następujące kroki:
```bash
npm run dev
# lub
bun run dev # recommended
```
Uruchomiony zostanie jednocześnie serwer i klient.
Jeżeli zależy nam na uruchomieniu tylko jednej warstwy, należy wykonać następujące kroki:

#### Dla serwera
```bash
cd server
npm run dev
# lub
bun run dev #recommended
```
#### Dla klienta
```bash
cd client
npm run dev
# lub
bun run dev #recommended
```

### Uruchomienie przy użyciu Docker/Podman
Projekt zawiera konfigurację dla Docker/Podman, co pozwala na łatwe uruchomienie aplikacji w środowisku kontenerowym. Aby uruchomić projekt:

```bash
docker-compose up --build
# lub
podman-compose up --build #recommended
```
