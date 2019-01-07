const peerConnectionDefaultConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stunserver.org' }
  ],
  // optional: {
  //   DtlsSrtpKeyAgreement: false,
  //   RtpDataChannels: true
  // }
};
var sdpConstraints = { optional: [{ RtpDataChannels: true }] };

interface RTCConnectionInterface {
  getSdp(): Promise<RTCSessionDescription>,
  getDataChannel(): Promise<RTCDataChannel>
}

export default class RTCConnection implements RTCConnectionInterface {

  private pc: RTCPeerConnection;
  private sdp: Promise<RTCSessionDescription>;
  private dataChannel: Promise<RTCDataChannel>;

  constructor(channelName: string, peerSdp?: RTCSessionDescription, config: RTCConfiguration = peerConnectionDefaultConfig) {
    this.pc = new RTCPeerConnection(config);
    this.pc.oniceconnectionstatechange = (e) => {
      var state = this.pc.iceConnectionState;
      //if (state === "connected") emit("awaiting")
    }
    this.sdp = new Promise((resolve, reject) => {
      this.pc.onicecandidate = (e) => {
        console.info("[onicecandidate] Got new ICE candidate, waiting for more ...", e);
        if (e.candidate) { return; }
        resolve(this.pc.localDescription);
      }
    });
    if (peerSdp === undefined) {
      this.dataChannel = new Promise((resolve, reject) => {
        const dc = this.pc.createDataChannel(
          channelName
          //, { reliable: true }
          );
        this.pc.createOffer().then((e) => this.pc.setLocalDescription(e));
        dc.onopen = () => resolve(dc);
      })
    } else {
      this.dataChannel = new Promise((resolve, reject) => {
        this.pc.setRemoteDescription(new RTCSessionDescription(peerSdp));
        this.pc.createAnswer(
          (answerDesc) => this.pc.setLocalDescription(answerDesc),
          (err) => reject(err),
          // sdpConstraints,
        );
        this.pc.ondatachannel = (e) => {
          const dc = e.channel;
          dc.onopen = () => resolve(dc);
        };
      })
    }
    this.pc.onsignalingstatechange = (s) => console.info('signalingStateChange', s)
    this.pc.oniceconnectionstatechange = (s) => console.info('iceConnectionStateChange', s)
    this.pc.onicegatheringstatechange = (s) => console.info('iceGatheringStateChange', s)
  }

  getSdp() : Promise<RTCSessionDescription>{
    return this.sdp;
  }

  getDataChannel() : Promise<RTCDataChannel>{
    return this.dataChannel;
  }
}
