# 📲 Guia de Instalação no Celular: Android e iOS

Este guia detalha o passo a passo de como compilar, transferir e instalar o aplicativo **Moto Intercom** diretamente no seu smartphone (físico), cobrindo tanto o ecossistema **Android** quanto **iOS**.

---

## 📌 Contexto Importante (Desenvolvimento em Windows)

Como o projeto está sendo desenvolvido em ambiente **Windows**:
- **Android:** Você pode gerar o instalador (`.apk`) **localmente** pelo computador via cabo USB / Gradle, ou pela **nuvem** com EAS Build.
- **iOS:** A Apple exige o compilador do macOS (Xcode) para gerar o pacote final. Portanto, no Windows, o caminho recomendado é compilar na nuvem com **EAS Build** (que constrói nos servidores da Expo sem precisar de um Mac) ou copiar os arquivos para um Mac físico.

---

## 🤖 PARTE 1: Como passar para o Celular ANDROID

Você tem **3 opções práticas**. Escolha a que for mais conveniente:

### Opção A: Instalação Direta via Cabo USB (Mais rápida para testar agora)

1. **Ative o Modo Desenvolvedor no celular:**
   - Acesse **Configurações > Sobre o telefone**.
   - Toque 7 vezes seguidas em **"Número da versão"** (ou "Versão da MIUI/Build number") até aparecer a mensagem *"Você agora é um desenvolvedor"*.
   - Volte em **Configurações > Opções do desenvolvedor** e ative a opção **"Depuração USB"** (*USB Debugging*).
2. **Conecte o celular ao computador via cabo USB:**
   - No celular, selecione o modo *"Transferência de arquivos"* e autorize a mensagem na tela: *"Permitir depuração USB neste computador? -> Sempre permitir"*.
3. **Execute o comando no terminal:**
   No diretório do projeto, execute:
   ```bash
   npx expo run:android
   ```
4. **O que vai acontecer:**
   O Expo compilará o app nativo, instalará automaticamente no seu smartphone e abrirá o aplicativo pronto para uso.

---

### Opção B: Gerar o arquivo `.apk` Manualmente (Para passar via WhatsApp / Drive / Cabo)

Se você quiser ter o arquivo `.apk` em mãos para enviar para outros celulares de amigos ou garupa:

1. Abra o terminal na pasta `android` do projeto:
   ```bash
   cd android
   ```
2. Execute o comando de compilação do Gradle:
   - No Windows (PowerShell / CMD):
     ```bash
     .\gradlew assembleDebug
     ```
3. O instalador APK será gerado no seguinte caminho:
   ```text
   android/app/build/outputs/apk/debug/app-debug.apk
   ```
4. **Como passar para o celular:**
   - Copie o arquivo `app-debug.apk` e envie para o celular por **WhatsApp**, **Google Drive**, **Telegram** ou arrastando via **Cabo USB**.
   - No celular, toque no arquivo e selecione **Instalar** (se o Android solicitar, permita a opção *"Instalar apps de fontes desconhecidas"*).

---

### Opção C: Gerar APK na Nuvem via EAS Build (Sem precisar de Android Studio)

O Expo possui o serviço gratuito na nuvem **EAS Build**, que gera o APK sem usar o hardware da sua máquina:

1. **Instale o CLI do EAS globalmente:**
   ```bash
   npm install -g eas-cli
   ```
2. **Faça login na sua conta Expo (gratuita):**
   ```bash
   eas login
   ```
   *(Se não tiver conta, crie rapidamente em [expo.dev](https://expo.dev/signup)).*
3. **Configure o build inicial:**
   ```bash
   eas build:configure
   ```
4. **Gere o APK instalável para Android:**
   ```bash
   eas build --platform android --profile preview
   ```
5. Ao concluir, o terminal exibirá um **QR Code** e um **link direto para download do `.apk`**. Basta abrir a câmera do celular, escanear e baixar o app.

---

## 🍏 PARTE 2: Como passar para o Celular iOS (iPhone)

A Apple possui um sistema restrito de segurança que impede a instalação de arquivos soltos sem assinatura digital de desenvolvedor. Veja as formas disponíveis:

### Opção A: Pela Nuvem via EAS Build (Recomendado para Windows)

Como você está no Windows, esta é a forma oficial de gerar o app para iPhone:

1. **Instale o CLI e autentique:**
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. **Gere a compilação de desenvolvimento/preview:**
   ```bash
   eas build --platform ios --profile preview
   ```
3. **Requisitos da Apple:**
   - O EAS solicitará o login da sua conta **Apple Developer**.
   - Ele registrará automaticamente o identificador do seu iPhone (UDID) via perfil Ad-Hoc.
   - Ao final, será disponibilizado um link para instalar o app diretamente no iPhone através do Safari.

---

### Opção B: Usando um Mac Físico com Xcode (Se tiver acesso a um Mac)

Se você tiver ou puder usar um computador Mac:

1. Compacte e copie toda a pasta do projeto `moto-intercom` para o Mac (via pendrive, Git ou nuvem).
2. No Mac, abra o terminal na pasta do projeto e instale as dependências:
   ```bash
   npm install
   npx expo prebuild
   ```
3. Conecte o iPhone via cabo ao Mac.
4. Execute o comando:
   ```bash
   npx expo run:ios --device
   ```
5. O Xcode compilará o aplicativo e o instalará diretamente no iPhone conectado.
   *(No iPhone, acesse **Ajustes > Geral > Gerenciamento de VPN e Dispositivo** para confiar no certificado de desenvolvedor).*

---

## 🛠️ Checklist ao abrir o aplicativo no Celular

Ao abrir o **Moto Intercom** no seu aparelho pela primeira vez:

1. **Conceda todas as permissões solicitadas:**
   - 🎙️ **Microfone:** Obrigatório para captura de áudio da conversa.
   - 📍 **Localização e Dispositivos Próximos:** Obrigatório pelo sistema Android para conseguir localizar outros aparelhos via Wi-Fi Direct.
2. **Otimização de Bateria (Android):**
   - Acesse **Configurações do Celular > Aplicativos > Moto Intercom > Bateria**.
   - Altere de *"Otimizado"* para **"Sem restrições"** (para garantir que o sistema operacional não encerre a conversa de áudio em segundo plano enquanto você pilota).
3. **Conexão dos Pilotos:**
   - Abra o app em ambos os celulares.
   - Toque em **INICIAR INTERCOM**.
   - O status mudará para `CONECTADO` e o áudio estará disponível em tempo real.
