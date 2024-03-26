#Použitý je oficiálny obraz Node.js 14-alpine pre menšiu veľkosť obrazu.
FROM node:14-alpine
#  Pracovný adresár v kontajneri je nastavený na /app.
WORKDIR /app
# Závislosti definované v package.json a package-lock.json sú inštalované pomocou npm.
COPY package*.json ./

RUN npm install
#Kód React aplikácie je skopírovaný a následne zostavený príkazom npm run build.
COPY . .

RUN npm run build
#Aplikácia je dostupná na porte 3000.
EXPOSE 3000
#Aplikácia je spustená s príkazom npm start.
CMD ["npm", "start"]
