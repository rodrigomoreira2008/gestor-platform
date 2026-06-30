FROM mcr.microsoft.com/dotnet/sdk:9.0

WORKDIR /workspace

COPY apps/backend apps/backend

RUN dotnet restore apps/backend/Gestor.Api.csproj

COPY . .

EXPOSE 8080
