# Fågelrapport

* Circle CI
[![CircleCI](https://circleci.com/gh/almrooth/ramverk2-app.svg?style=svg)](https://circleci.com/gh/almrooth/ramverk2-app)


* Scrutinizer
[![Build Status](https://scrutinizer-ci.com/g/almrooth/ramverk2-app/badges/build.png?b=master)](https://scrutinizer-ci.com/g/almrooth/ramverk2-app/build-status/master)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/almrooth/ramverk2-app/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/almrooth/ramverk2-app/?branch=master)
[![Code Coverage](https://scrutinizer-ci.com/g/almrooth/ramverk2-app/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/almrooth/ramverk2-app/?branch=master)

Fågelrapport är en JavaScripapplikation med användarhantering som skyddas av inloggning.
Som användare kan man registrera sig och logga in. Man kan posta observationer och även chatta med andra inloggade. Man kan även redigera och ta bort sina egna observationer samt redigera sin profil och ändra sitt lösenord.

Applikationen innehåller även en administrationsdel där en administratör kan logga in och redigera och ta bort användare och observationer. En administratör kan även skapa nya användare och administratörer samt ge ändra användares roll (user/admin).

## Tekniker

### Back-end
Till backend använder sig applikationen av JavaScript-ramverket Express.js. En server som gör det enkelt att sätta upp olika routes och hantera requests och responses. Till denna har flera så kallade middlewares integrerats för att åstadkomma lite olik funktionalitet som att parsa ut form-data ur requests eller hantera sessioner.

På det hela har det varit en angenäm bekantskap och att det är så pass litet men ändå kan byggas ut till väldigt stor gör express till ett bra val för serverddelen.

En lite lurig sak som kan kännas lite konstig är att det inte riktigt finns någon enhetlig struktur på middlewares och hur de ska integreras och konfigureras mm. Något som verkar vara mer upp till dem som skapar dem. Det gör att det inte riktigt blir helt enhetligt.

### Front-end (vyer)
För att skapa vyer har jag använt mig av templatespråket Handlebars.js. Valet av detta framför exemplevis Pug var på grund av att man kan skriva sina vyer i ren och fin HTML och bara droppa in variabler innanför måsvingar där de behövs. Man kan även importera HTML-filer in i varandra vilket gör att man kan dela upp och skapa olika layouter och mindre moduler. Detta till skillnad från Pug där man måste lära sig som ett helt nytt språk för att skriva sina vyer.

Så här i efterhand tror jag dock att jag i framtiden kommer skriva mitt front-end i något JavaScript-ramverk istället som React eller Vue. Detta då det enklar möjliggör dynamisk hantering av data och lättare användning av JavaScriptkod i vyerna.

## Beroenden

För att kunna använda sig av applikationen krävs följande beroenden.
* En MongoDB-databas
* Node och Npm

## Variabler
Vilken port och sökväg till databasen använder sig av kan modiferas efter behov enlig nedan.

Namn|Standardvärde|Beskrivning
---|---|---
DBWEBB_PORT|1337|Porten som servern startar upp på och som du anger i webbläsaren.
DBWEBB_DSN|mongodb://127.0.0.1:27017/birdreport|Sökväg till databasen

## Installation

1. Börja med att klona repot till valfri katalog
```
$ git clone https://github.com/almrooth/ramverk2-app.git
```

2. Installera de beroenden och packet som finns
```
$ npm install
```

---
### Valfritt
Om du vill förbereda databasen med en vanlig användare och en administratör kan du köra `seeders/userSeeder.js`.
```
$ node seeders/userSeeder
```
Då skapas följande användare som kan användas för att logga in

Användare|Lösenord|Roll
---|---|--
|doe|doe|user (vanlig användare)
|admin|admin|admin (administratör)
---

3. För att starta
Applikationen starta automatiskt upp och lyssnar på port `1337`
```
$ npm start
```
För att använda applikationen öppna en webbläsare och gå in på `http://localhost:1337`

## Köra applikationen i Docker-kontainrar

Applikationen kan även köras i Dockerkontainrar. Det kräver att docker och docker-compose finns installerat.

1. För att starta
```
$ npm run start-docker
```

2. För att stoppa
```
$ npm run stop-docker
```

Som standard startar applikationen upp sig och tillhörande databas i kontainrar och exponerar sig på port 1337.

Om du vill ändra port eller använda dig av en annan databas får du uppdatera docker-compose.yml och kontainern 'express' med önskade variablerna `DBWEBB_PORT` och `DBWEBB_DSN`.

## Testning

Stor vikt har lagts vid att enhetstesta applikationen. Speciellt de routrar och middleware som finns. Delar som inte täcks av tester är filerna för chatservern (`src/chat`) samt importerad JavaScript/moduler samt importerad CSS.

### Verktyg

#### ESLint
Eslint har använts för att hålla koll på JavaScript-koden och se till att den följer standard och inga syntaxfel uppstår. För detta ändamål är ESLint ett väl fungerande verktyg och med dess integration i de utvecklingsverktyg som använts har de varti till stor hjälp för att minska slarvfel, misstag och felaktig syntax.

#### Stylelint
Stylelint används som ESLint fast för CSS-kod. Det har fungerat mycket bra och ser till att CSS-koden är så ren och rätt som möjligt.

#### Jest & Supertest
Testverktyget Jest och Supertest har använts för att skriva de enhetstester som finns.

Jest innehåller bra funktioner för assertion samt även bra funktioner för att mocka funktioner mm.

Supertest används används specifikt för att gör anrop till applikationen och hantera requests/responses. Här finns även funktioner för att simulera en webbläsare och dess sessioner så att data och ev inloggningar inte försvinner mellan requests.

Verktygen har fungerat mycket bra och har varit relativt lätta att arbeta med. Mestadels tack var en bra befintlig dokumentation.

### Köra tester
För att köra alla tester
```
$ npm test
```

För att köra eslint
```
$ npm run eslint
```

För att köra stylelint
```
$ npm run stylelint
```

### Kodtäckning
En kodtäckning på 94% har uppnåts för applikationen.

Efter att ha kört testerna kan kodtäckningen för applikationen ses genom att öppna upp `coverage/lcov-report/index.html`.

### Tester i Docker
Testern kan köras i 3 olika node-versioner med hjälp av dockerkontainrar.

* node version latest
```
$ npm run test-docker
```
* node version 8
```
$ npm run test-docker1
```
* node version 7
```
$ npm run test-docker2
```

## CI-flöde
Applikationen och dess repo är kopplad till ett CI-flöde som autmatiskt kör tester vid varje push till GitHub. Detta för att se till att utvecklingen sker med hög kvalitet och att fel i koden tidigt uppmärksammas och då lätt kan hanteras. Just att tester körs vid varje push gör att man inte kan missa eventuella fel i koden så länge man pushar upp koden regelbundet.

Som byggtjänst har CircleCi använts och för att granska kodkvalitet och täckning har Scrutinizer använts.

En kodtäckning på 94% och en kodkvalitet på 9.75 har uppnätts enligt Scrutinizer. Något som jag är väldigt nöjd med och har jobbat hårt för.


## Realtid
Applikationen har en realtidsdel i form av en chattfunktion. Funktionen använder sig av WebSockets för att kommunicera med servern och pusha ut meddelanden till de tillgängliga klienterna.

WebSockets-delen har generellt fungerat bra även om det tog ett tag att sätta sig in i hur koden ska skrivas hanteras på både server och client.

## Databas
Som databas har MongoDB använts. Det är en NoSQL-databas som därmed inte sätter några begränsningar i hur datan som lagras sparas och vilka kolummner som därmed kan finnas. Detta möjliggör snabb lagring av data på ett enkelt sätt men gör samtidigt att och gör att man inte i förväg måste bestämma sig för hur tabellerna ska se ut.

Detta är både positivt och negativt då det möjliggör snabb utveckling men samtidigt kräver att man på annat håll har koll på den datan som finns och hur den ser ut. Det gör också att relationer mellan tabller och olika dataset får hanteras i koden utanför databsen istället. Något som har både sina för och nackdelar.

På det hela taget är dock MongoDB en trevlig bekantskap som jag kommer använda i framtiden. Kanske mest i enklare applikationer där man inte har så många tabeller med olika data att förhålla sig till. SQL-databaser och dess relationer och kopplingar mellan tabller känns fortfarande väldigt användbart och gör att man kan styra upp dataflödet på ett hel annat sätt. Något som jag säkerligen kommer använda i lite större projekt framåt.

## Egen modul
Applikationen använder sig av den egna modulen 'mongo-crud-simple' som tagits fram under tidigare kursmoment. Modulen används både för att hantera användare och observationer och gjorde det lätt och smidigt att koppla sig mot databasen och hämta samt hantera data.

[mongo-crud-simple](https://www.npmjs.com/package/mongo-crud-simple) på NPM

Just NPM som paketverktyg har under utvecklingens gång varit väldig smidigt. Det går fort och lätt att hämta ner och integrera olika moduler och det finns ett stort utbud att välja från. Något som gör att man inte behöver uppfinna hjulet varje gång. Något som därmed kan vara lite lurigt med NPM är att det är lätt att låta bli att granska den kod som man hämtar ned vilket kan få till följd att man får ner skadlig och illasinnad kod i värsta fall.
