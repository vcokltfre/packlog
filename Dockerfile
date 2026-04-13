FROM node:20-alpine as build_frontend

WORKDIR /app

COPY src/dashboard/package.json src/dashboard/package-lock.json ./
RUN npm ci

COPY src/dashboard/ ./
RUN npm run build

FROM golang:1.26-bookworm

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

COPY --from=build_frontend /app/dist ./src/dashboard/dist

RUN go build -o packlog .

EXPOSE 8080

CMD ["./packlog", "run"]
