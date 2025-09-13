# FlavorFlow - Installation Guide for Your Husband's Laptop

## Prerequisites
- Node.js (version 18 or higher)
- Git

## Installation Steps

### 1. Get the Code
**Option A: If you share via GitHub**
```bash
git clone https://github.com/yourusername/food-recipe-app.git
cd food-recipe-app
```

**Option B: If you share the folder directly**
- Copy the entire project folder to his laptop
- Open terminal/command prompt in that folder

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the App
```bash
npm run build
npm start
```

### 4. Access the App
- Open browser and go to: http://localhost:3000
- Install as PWA using the install button

## What He'll Have
- ✅ Full offline functionality
- ✅ Recipe management
- ✅ Pantry tracking
- ✅ Works like a native app
- ✅ His own local data storage

## Syncing Data Between Devices
*Note: Currently each installation has its own data. For shared data, you'd need to implement cloud storage (Supabase, Firebase, etc.)*
