import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

/**
 * High-visibility, large-touch-target action buttons optimized for riders wearing motorcycle gloves.
 *
 * @param {Object} props Component properties.
 * @param {string} props.connectionState Current status ("disconnected", "connecting", "connected").
 * @param {boolean} props.isMuted Mute status of the rider's microphone.
 * @param {Function} props.onStartConnection Callback to start intercom pairing/connection.
 * @param {Function} props.onEndConnection Callback to terminate intercom connection.
 * @param {Function} props.onToggleMute Callback to toggle microphone mute state.
 * @returns {React.ReactElement} Action buttons component.
 */
export const ActionButtons = ({
  connectionState,
  isMuted,
  onStartConnection,
  onEndConnection,
  onToggleMute
}) => {
  const isConnected = connectionState === "connected"
  const isConnecting = connectionState === "connecting"

  return (
    <View style={styles.container}>
      {!isConnected ? (
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isConnecting}
          onPress={onStartConnection}
          style={[
            styles.touchTargetButton,
            styles.connectButton,
            isConnecting && styles.disabledButton
          ]}
        >
          <Text style={styles.buttonLabel}>
            {isConnecting ? "CONECTANDO..." : "INICIAR INTERCOM"}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onEndConnection}
          style={[styles.touchTargetButton, styles.disconnectButton]}
        >
          <Text style={styles.buttonLabel}>ENCERRAR INTERCOM</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!isConnected}
        onPress={onToggleMute}
        style={[
          styles.touchTargetButton,
          isMuted ? styles.unmuteButton : styles.muteButton,
          !isConnected && styles.disabledButton
        ]}
      >
        <Text style={styles.buttonLabel}>
          {isMuted ? "ATIVAR MIC" : "MUTAR MIC"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 18,
    marginVertical: 16
  },
  touchTargetButton: {
    minHeight: 74,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  connectButton: {
    backgroundColor: "#16A34A"
  },
  disconnectButton: {
    backgroundColor: "#DC2626"
  },
  muteButton: {
    backgroundColor: "#D97706"
  },
  unmuteButton: {
    backgroundColor: "#2563EB"
  },
  disabledButton: {
    backgroundColor: "#4B5563",
    opacity: 0.6
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  }
})
