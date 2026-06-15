@echo off
title Spring Boot Backend Runner
cd %~dp0

if exist ".maven\apache-maven-3.9.6" (
    echo [Info] Local Maven installation found.
    goto run
)

if exist "maven.zip" (
    del maven.zip
)

echo [Info] Local Maven not found. Downloading Apache Maven 3.9.6 from Maven Central...
curl.exe -L -o maven.zip "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip"

if not exist "maven.zip" (
    echo [Error] Failed to download Maven zip. Please ensure you have internet connection.
    pause
    exit /b 1
)

echo [Info] Extracting Maven zip...
powershell -Command "Expand-Archive -Path 'maven.zip' -DestinationPath '.maven' -Force"
del maven.zip

:run
echo [Info] Running Spring Boot Backend using local Maven...
.maven\apache-maven-3.9.6\bin\mvn spring-boot:run
