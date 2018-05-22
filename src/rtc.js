const EventEmitter = require('events')
const peerConnectionDefaultConfig = {
    iceServers: [
        {url:'stun:stun.l.google.com:19302'},
        {url:'stun:stun1.l.google.com:19302'},
        {url:'stun:stun2.l.google.com:19302'},
        {url:'stun:stun3.l.google.com:19302'},
        {url:'stun:stun4.l.google.com:19302'},
        {url:'stun:stunserver.org'}
    ],
    optional: {
        DtlsSrtpKeyAgreement: false, 
        RtpDataChannels: true
    }
};
var sdpConstraints = { optional: [{RtpDataChannels: true}]  };

class P2PConnection extends EventEmitter {
    constructor(offer) {
        super()
        const pc = new RTCPeerConnection(peerConnectionDefaultConfig);
        const emit = this.emit
        const _initDataChannel = this._initDataChannel
        pc.oniceconnectionstatechange = (e) => {
          var state = pc.iceConnectionState;
          if (state == "connected") emit("awaiting")
        };
        pc.onicecandidate = (e) => {
          if (e.candidate) return;
          emit("sdp", JSON.stringify(pc.localDescription));
        }
        pc.onsignalingstatechange = (s) => console.info('signalingStateChange', s)
        pc.oniceconnectionstatechange = (s) => console.info('iceConnectionStateChange', s)
        pc.onicegatheringstatechange = (s) => console.info('iceGatheringStateChange', s)
        if(offer == null) {
            const dc = pc.createDataChannel("chat", {reliable: true});
            pc.createOffer().then(function(e) {
              pc.setLocalDescription(e)
            });
            _initDataChannel(dc)
        } else {
            pc.setRemoteDescription(new RTCSessionDescription(offer))
            pc.createAnswer((answerDesc) => {
              pc.setLocalDescription(answerDesc)
            }, () => console.warn("Couldn't create offer"), sdpConstraints);
            pc.ondatachannel  = (e) => _initDataChannel(e.channel);
        }
        this._pc = pc
    }

    _initDataChannel(dc){
        dc.onopen = () => {
            emit("connected")
        };
        dc.onmessage = function(e) {
            if (e.data) emit("message",e.data);
        }
    }

    connect(answer) {
        this._pc.setRemoteDescription(new webrtc.RTCSessionDescription(answer));
    }
}
