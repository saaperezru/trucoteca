import RTCConnection from './RTCConnection';

document.getElementById("sdp-form").onsubmit = (event) => {
  event.preventDefault();
  let rtc;
  const sdp = (document.getElementById("sdp-textarea") as HTMLTextAreaElement).value;
  if(sdp.length){
    rtc = new RTCConnection('chat', JSON.parse(sdp));
  } else {
    rtc = new RTCConnection('chat');
  }
  rtc.getSdp().then((sdp) => { console.log(JSON.stringify(sdp)); });
  rtc.getDataChannel().then(console.log);
};

function getAnswer(pastedAnswer) {
  data = JSON.parse(pastedAnswer);
  answer = new webrtc.RTCSessionDescription(data);
  pc.setRemoteDescription(answer);
}

createOffer().then((offer) => {
  offer.getSdp();
  return offer.answer()
})

getOffer(offer).then((offer) => {
  offer.getSdp();
  return offer.dataChannel();
})