# Hello Render

Minimal Spring Boot app for free deploy on [Render.com](https://render.com).

## Run locally
```bash
./mvnw spring-boot:run
```

## Deploy on Render
- Build Command:
  ```
  ./mvnw clean package -DskipTests
  ```
- Start Command:
  ```
  java -jar target/*.jar --server.port=$PORT
  ```
