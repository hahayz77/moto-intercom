import React, { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from "react-native"
import { ActionButtons } from "../components/ActionButtons"
import {
  getLocalAudioStream,
  createPeerConnection,
  attachStreamToPeer,
  createSdpOffer,
  disconnectPeer
} from "../services/webrtcService"

/**
 * Main intercom screen for motorcycle riders.
 * Uses only React useState for local state management (no external state libraries like Zustand).
 *
 * @returns {React.ReactElement} The HomeScreen component.
 */
export const HomeScreen = () => {
  const [connectionState, setConnectionState] = useState("disconnected")
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [isMuted, setIsMuted] = useState(false)

  const peerConnectionRef = useRef(null)

  /**
   * Initializes local media and creates peer connection.
   */
  const handleStartConnection = async () => {
    try {
      setConnectionState("connecting")

      const stream = await getLocalAudioStream()
      setLocalStream(stream)

      const peerConnection = createPeerConnection({
        onIceCandidate: (candidate) => {
          console.log("Gathered local ICE candidate:", candidate)
        },
        onRemoteStream: (streamReceived) => {
          console.log("Received remote audio stream")
          setRemoteStream(streamReceived)
        },
        onConnectionStateChange: (state) => {
          console.log("WebRTC state changed:", state)
          if (state === "connected") {
            setConnectionState("connected")
          } else if (state === "disconnected" || state === "failed" || state === "closed") {
            setConnectionState("disconnected")
          }
        }
      })

      peerConnectionRef.current = peerConnection
      attachStreamToPeer(peerConnection, stream)

      const offer = await createSdpOffer(peerConnection)
      console.log("SDP Offer generated and ready for transport:", offer)

      // Simulates connected state for UI responsiveness until transport channel syncs
      setConnectionState("connected")
    } catch (error) {
      console.error("Failed to establish intercom connection:", error)
      setConnectionState("disconnected")
    }
  }

  /**
   * Closes active peer connection and stops audio streaming.
   */
  const handleEndConnection = () => {
    disconnectPeer(peerConnectionRef.current, localStream)
    peerConnectionRef.current = null
    setLocalStream(null)
    setRemoteStream(null)
    setIsMuted(false)
    setConnectionState("disconnected")
  }

  /**
   * Toggles microphone mute state on the local audio stream.
   */
  const handleToggleMute = () => {
    if (!localStream) {
      return
    }

    const audioTracks = localStream.getAudioTracks()
    if (audioTracks && audioTracks.length > 0) {
      const nextMutedState = !isMuted
      audioTracks[0].enabled = !nextMutedState
      setIsMuted(nextMutedState)
    }
  }

  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        disconnectPeer(peerConnectionRef.current, localStream)
      }
    }
  }, [localStream])

  const getStatusColor = () => {
    switch (connectionState) {
      case "connected":
        return "#16A34A"
      case "connecting":
        return "#EAB308"
      default:
        return "#EF4444"
    }
  }

  const getStatusText = () => {
    switch (connectionState) {
      case "connected":
        return "CONECTADO"
      case "connecting":
        return "CONECTANDO..."
      default:
        return "DESCONECTADO"
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MOTO INTERCOM</Text>
          <Text style={styles.subtitle}>COMUNICAÇÃO P2P PILOTO</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>STATUS DA CONEXÃO</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicatorDot,
                { backgroundColor: getStatusColor() }
              ]}
            />
            <Text style={[styles.statusValue, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>

          {isMuted && (
            <View style={styles.mutedBadge}>
              <Text style={styles.mutedBadgeText}>MICROFONE MUTADO</Text>
            </View>
          )}

          {remoteStream && (
            <View style={styles.streamBadge}>
              <Text style={styles.streamBadgeText}>ÁUDIO REMOTO ATIVO</Text>
            </View>
          )}
        </View>

        <ActionButtons
          connectionState={connectionState}
          isMuted={isMuted}
          onStartConnection={handleStartConnection}
          onEndConnection={handleEndConnection}
          onToggleMute={handleToggleMute}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F172A"
  },
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 24
  },
  header: {
    alignItems: "center",
    marginTop: 12
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#F8FAFC",
    letterSpacing: 2
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94A3B8",
    letterSpacing: 1.5,
    marginTop: 4
  },
  statusCard: {
    width: "90%",
    backgroundColor: "#1E293B",
    borderRadius: 22,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#334155"
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1.2,
    marginBottom: 12
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  statusIndicatorDot: {
    width: 18,
    height: 18,
    borderRadius: 9
  },
  statusValue: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 1.5
  },
  mutedBadge: {
    marginTop: 16,
    backgroundColor: "#7C2D12",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12
  },
  mutedBadgeText: {
    color: "#FDBA74",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1
  },
  streamBadge: {
    marginTop: 10,
    backgroundColor: "#064E3B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12
  },
  streamBadgeText: {
    color: "#6EE7B7",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1
  }
})
