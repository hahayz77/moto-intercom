import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices
} from "react-native-webrtc"

/**
 * WebRTC configuration including STUN servers for NAT traversal and candidate discovery.
 */
const rtcConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    },
    {
      urls: "stun:stun1.l.google.com:19302"
    }
  ]
}

/**
 * Service to manage WebRTC peer-to-peer audio communication.
 *
 * WebRTC Pairing Lifecycle:
 * 1. Stream Acquisition:
 *    - Offerer & Answerer request microphone access via `mediaDevices.getUserMedia`.
 * 2. Peer Connection Initialization:
 *    - Instantiates `RTCPeerConnection` with STUN ICE servers.
 *    - Registers callbacks for connection status, ICE candidates, and incoming remote tracks.
 * 3. Offer Generation (Initiator / Offerer):
 *    - Initiator calls `createOffer()`.
 *    - Initiator sets its local description (`setLocalDescription(offer)`).
 *    - The offer SDP is sent to the remote peer via the chosen signaling channel (e.g. Wi-Fi Direct socket).
 * 4. Answer Handling (Receiver / Answerer):
 *    - Receiver receives the offer SDP and sets remote description (`setRemoteDescription(offer)`).
 *    - Receiver calls `createAnswer()`.
 *    - Receiver sets its local description (`setLocalDescription(answer)`).
 *    - Receiver transmits the answer SDP back to the initiator.
 *    - Initiator receives the answer and sets remote description (`setRemoteDescription(answer)`).
 * 5. ICE Candidate Exchange:
 *    - As connectivity paths are discovered, `onicecandidate` triggers candidate events on both peers.
 *    - Each candidate is serialized and transmitted to the partner peer via signaling.
 *    - Remote peer adds candidate using `addIceCandidate(candidate)`.
 * 6. Audio Track Streaming:
 *    - Audio tracks added via `addTrack` flow bidirectional with low latency once ICE completes.
 */

/**
 * Requests the local user's microphone audio stream.
 * @returns {Promise<MediaStream>} The acquired audio media stream.
 */
export const getLocalAudioStream = async () => {
  try {
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: false
    })
    return stream
  } catch (error) {
    console.error("Failed to acquire local audio stream:", error)
    throw error
  }
}

/**
 * Creates and configures a new RTCPeerConnection instance.
 *
 * @param {Object} options Connection callback handlers.
 * @param {Function} options.onIceCandidate Callback when an ICE candidate is gathered.
 * @param {Function} options.onRemoteStream Callback when remote audio stream is received.
 * @param {Function} options.onConnectionStateChange Callback on connection state transitions.
 * @returns {RTCPeerConnection} Configured RTCPeerConnection instance.
 */
export const createPeerConnection = ({
  onIceCandidate,
  onRemoteStream,
  onConnectionStateChange
}) => {
  const peerConnection = new RTCPeerConnection(rtcConfiguration)

  peerConnection.onicecandidate = (event) => {
    if (event.candidate && onIceCandidate) {
      onIceCandidate(event.candidate)
    }
  }

  peerConnection.ontrack = (event) => {
    if (event.streams && event.streams[0] && onRemoteStream) {
      onRemoteStream(event.streams[0])
    }
  }

  peerConnection.onconnectionstatechange = () => {
    if (onConnectionStateChange) {
      onConnectionStateChange(peerConnection.connectionState)
    }
  }

  return peerConnection
}

/**
 * Attaches local audio tracks to the peer connection.
 *
 * @param {RTCPeerConnection} peerConnection Active peer connection.
 * @param {MediaStream} localStream Local audio stream to broadcast.
 */
export const attachStreamToPeer = (peerConnection, localStream) => {
  if (!peerConnection || !localStream) {
    return
  }

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream)
  })
}

/**
 * Generates an SDP Offer to initiate the P2P handshake.
 *
 * Pairing Flow - Step 1 (Offerer):
 * Generates offer description, applies it as local description, and returns it
 * for serialization across the signaling transport.
 *
 * @param {RTCPeerConnection} peerConnection Active peer connection instance.
 * @returns {Promise<RTCSessionDescription>} The generated local SDP offer.
 */
export const createSdpOffer = async (peerConnection) => {
  try {
    const offerSession = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false
    })
    await peerConnection.setLocalDescription(offerSession)
    return offerSession
  } catch (error) {
    console.error("Error creating WebRTC offer:", error)
    throw error
  }
}

/**
 * Handles an incoming SDP Offer and generates an SDP Answer.
 *
 * Pairing Flow - Step 2 (Answerer):
 * Receives the offer from the caller, applies it as the remote description,
 * generates an answer, sets it as local description, and returns it.
 *
 * @param {RTCPeerConnection} peerConnection Active peer connection instance.
 * @param {RTCSessionDescription|Object} offerSdp The received offer SDP from signaling.
 * @returns {Promise<RTCSessionDescription>} The generated local SDP answer.
 */
export const handleIncomingOffer = async (peerConnection, offerSdp) => {
  try {
    const remoteDescription = new RTCSessionDescription(offerSdp)
    await peerConnection.setRemoteDescription(remoteDescription)

    const answerSession = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answerSession)

    return answerSession
  } catch (error) {
    console.error("Error processing incoming offer and creating answer:", error)
    throw error
  }
}

/**
 * Processes an incoming SDP Answer from the answering peer.
 *
 * Pairing Flow - Step 3 (Offerer):
 * Offerer applies the answer received from the remote peer as remote description,
 * completing the SDP handshake.
 *
 * @param {RTCPeerConnection} peerConnection Active peer connection instance.
 * @param {RTCSessionDescription|Object} answerSdp The received answer SDP from signaling.
 * @returns {Promise<void>}
 */
export const handleIncomingAnswer = async (peerConnection, answerSdp) => {
  try {
    const remoteDescription = new RTCSessionDescription(answerSdp)
    await peerConnection.setRemoteDescription(remoteDescription)
  } catch (error) {
    console.error("Error processing incoming answer:", error)
    throw error
  }
}

/**
 * Adds a received ICE Candidate to the active peer connection.
 *
 * Pairing Flow - Step 4 (Both Peers):
 * Whenever an ICE candidate is received through the signaling channel,
 * this function injects it to discover network paths.
 *
 * @param {RTCPeerConnection} peerConnection Active peer connection instance.
 * @param {RTCIceCandidate|Object} iceCandidate Candidate payload received from peer.
 * @returns {Promise<void>}
 */
export const registerIceCandidate = async (peerConnection, iceCandidate) => {
  try {
    if (!peerConnection || !iceCandidate) {
      return
    }
    const candidate = new RTCIceCandidate(iceCandidate)
    await peerConnection.addIceCandidate(candidate)
  } catch (error) {
    console.error("Error adding remote ICE candidate:", error)
    throw error
  }
}

/**
 * Releases media tracks and closes the peer connection.
 *
 * @param {RTCPeerConnection} peerConnection Active peer connection instance to close.
 * @param {MediaStream} localStream Local stream whose tracks should be stopped.
 */
export const disconnectPeer = (peerConnection, localStream) => {
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      track.stop()
    })
  }

  if (peerConnection) {
    peerConnection.close()
  }
}
