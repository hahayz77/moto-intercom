# Fase 1: Setup e Estrutura Inicial
1. Crie o projeto Expo limpo: `npx create-expo-app moto-intercom -t blank`
2. Instale pacotes básicos: `npm install @react-navigation/native @react-navigation/native-stack expo-dev-client`
3. Crie a estrutura de diretórios: `/src/screens`, `/src/services`, `/src/components`

# Fase 2: Dependências de Áudio e Rede
1. Instale o motor de áudio P2P: `npm install react-native-webrtc`
2. Instale o gerenciador de Wi-Fi: `npm install react-native-wifi-p2p` (para gerenciamento de conexões no Android)
3. Configure o `app.json` adicionando permissões rigorosas para Microfone (para o WebRTC) e Localização/Rede Local (para o escaneamento Wi-Fi).

# Fase 3: Desenvolvimento da Lógica de Conexão (Regras: Arrow functions, sem ponto e vírgula, variáveis em inglês, uso estrito de JSDocs)
1. Crie `src/services/webrtcService.js`. Este arquivo deve conter JSDocs detalhando o fluxo de pareamento (Offer, Answer e ICE Candidates).
2. Crie `src/screens/HomeScreen.js`. Utilize apenas `useState` para gerenciar os estados locais (`connectionState`, `localStream`, `remoteStream`). Não utilize Zustand.
3. Desenvolva `src/components/ActionButtons.js` focando em botões de grande área de toque para facilitar o uso com luvas de motociclista.

# Fase 4: Integração Nativa
1. Execute o comando nativo: `npx expo prebuild`
2. Modifique o `AndroidManifest.xml` (Android) para incluir permissões de Wi-Fi Direct e background audio.
3. Modifique o `Info.plist` (iOS) para incluir `NSLocalNetworkUsageDescription` e `UIBackgroundModes` focado em áudio.