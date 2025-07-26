FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i --frozen-lockfile;

COPY tests ./
COPY playwright.config.ts .

CMD ["npx", "playwright", "test"]
