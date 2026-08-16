# --- build stage ---
# Gradle Wrapper 로 bootJar 를 만든다. JDK 21(프로젝트 toolchain 과 동일).
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x gradlew && ./gradlew clean bootJar -x test --no-daemon

# --- run stage ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
# Render 는 PORT 를 주입하고 app 은 ${PORT} 에 바인딩한다. EXPOSE 는 문서용.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
