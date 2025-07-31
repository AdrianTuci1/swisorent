# Car Rental Backend API

Backend pentru o firmă de închirieri auto cu suport pentru AWS DynamoDB.

## Caracteristici

- **Gestionarea mașinilor**: Adăugare, editare, ștergere și listare mașini
- **Gestionarea rezervărilor**: Creare, editare, ștergere și listare rezervări
- **Verificarea disponibilității**: Query-uri eficiente pentru verificarea disponibilității mașinilor într-o anumită perioadă
- **AWS DynamoDB**: Bază de date NoSQL pentru performanță și scalabilitate

## Structura proiectului

```
car-rental-backend/
├── config/
│   └── database.js          # Configurația DynamoDB
├── models/
│   ├── Car.js              # Model pentru mașini
│   └── Reservation.js      # Model pentru rezervări
├── routes/
│   ├── cars.js             # Rute pentru mașini
│   └── reservations.js     # Rute pentru rezervări
├── server.js               # Server principal
├── package.json
├── env.example
└── README.md
```

## Instalare

1. Clonează repository-ul
2. Instalează dependențele:
   ```bash
   npm install
   ```

3. Creează fișierul `.env` bazat pe `env.example`:
   ```bash
   cp env.example .env
   ```

4. Configurează variabilele de mediu în `.env`:
   ```
   PORT=3000
   NODE_ENV=development
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   DYNAMODB_TABLE_RESERVATIONS=car-rental-reservations
   DYNAMODB_TABLE_CARS=car-rental-cars
   ```

## Configurarea DynamoDB

### Tabele necesare

1. **cars** table:
   - Primary Key: `id` (String)
   - Atribute:
     - `licensePlate` (String)
     - `model` (String)
     - `price` (Number)
     - `color` (String)
     - `isActive` (Boolean)
     - `createdAt` (String)
     - `updatedAt` (String)

2. **reservations** table:
   - Primary Key: `id` (String)
   - GSI: `carId-index` cu `carId` ca partition key
   - Atribute:
     - `carId` (String)
     - `licensePlate` (String)
     - `model` (String)
     - `customerName` (String)
     - `phone` (String)
     - `startDate` (String)
     - `endDate` (String)
     - `createdAt` (String)

### Crearea tabelelor în AWS Console

1. Accesează AWS DynamoDB Console
2. Creează tabelul `car-rental-cars`:
   - Partition key: `id` (String)
   - Settings: Customize settings
   - Read/Write capacity: On-demand

3. Creează tabelul `car-rental-reservations`:
   - Partition key: `id` (String)
   - Settings: Customize settings
   - Read/Write capacity: On-demand

4. Adaugă GSI pentru `car-rental-reservations`:
   - Index name: `carId-index`
   - Partition key: `carId` (String)

## Rularea aplicației

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Mașini

- `GET /api/cars` - Lista toate mașinile
- `GET /api/cars/available?startDate=2024-01-01&endDate=2024-01-05` - Mașini disponibile într-o perioadă
- `GET /api/cars/:id` - Detalii mașină
- `POST /api/cars` - Adaugă mașină nouă
- `PUT /api/cars/:id` - Actualizează mașină
- `DELETE /api/cars/:id` - Șterge mașină

### Rezervări

- `GET /api/reservations` - Lista toate rezervările
- `GET /api/reservations/date-range?startDate=2024-01-01&endDate=2024-01-05` - Rezervări într-o perioadă
- `GET /api/reservations/car/:carId` - Rezervări pentru o mașină
- `GET /api/reservations/:id` - Detalii rezervare
- `POST /api/reservations` - Creează rezervare nouă
- `PUT /api/reservations/:id` - Actualizează rezervare
- `DELETE /api/reservations/:id` - Șterge rezervare

### Altele

- `GET /health` - Health check
- `GET /` - Informații API

## Exemple de utilizare

### Adăugare mașină
```bash
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "B123ABC",
    "model": "BMW X5",
    "price": 150.00,
    "color": "Negru",
    "isActive": true
  }'
```

### Căutare mașini disponibile
```bash
curl "http://localhost:3000/api/cars/available?startDate=2024-01-01&endDate=2024-01-05"
```

### Creare rezervare
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "carId": "1703123456789",
    "customerName": "Ion Popescu",
    "phone": "0722123456",
    "startDate": "2024-01-01",
    "endDate": "2024-01-05"
  }'
```

## Query-uri pentru disponibilitate

Sistemul folosește query-uri eficiente pentru verificarea disponibilității:

1. **Pentru mașini disponibile**: Scanează toate mașinile active și filtrează cele care nu au rezervări în perioada cerută
2. **Pentru verificarea disponibilității**: Folosește GSI `carId-index` pentru query-uri rapide pe rezervările unei mașini
3. **Pentru rezervări în perioadă**: Filtrează rezervările care se suprapun cu perioada cerută

## Performanță

- **DynamoDB**: Performanță consistentă indiferent de volumul de date
- **GSI**: Query-uri rapide pentru rezervări pe mașină
- **Filtrare eficientă**: Verificarea disponibilității se face la nivel de bază de date

## Dezvoltare

Pentru a adăuga funcționalități noi:

1. Extinde modelele în `models/`
2. Adaugă rute în `routes/`
3. Actualizează documentația

## Licență

ISC 