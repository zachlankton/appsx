import { MainLayout } from "./Layout";

let offer: any = { offer: null, answer: null, candidates: [] };
const txtAreaRef: any = {};
const pRef: any = {};
const peerConnection = new RTCPeerConnection();
window.peerConnection = peerConnection;

peerConnection.addEventListener("connectionstatechange", () => {
  if (peerConnection.connectionState === "connected") {
    // Peers connected!
    console.log("Peers connected!");
  }
});

// Listen for local ICE candidates on the local RTCPeerConnection
peerConnection.addEventListener("icecandidate", (event) => {
  if (event.candidate) {
    offer.candidates.push(event.candidate);
    pRef.elm.innerText = JSON.stringify(offer);
    console.log(event.candidate);
  }
});

// Listen for remote ICE candidates and add them to the local RTCPeerConnection
// signalingChannel.addEventListener("message", async (message) => {
//   if (message.iceCandidate) {
//     try {
//       await peerConnection.addIceCandidate(message.iceCandidate);
//     } catch (e) {
//       console.error("Error adding received ice candidate", e);
//     }
//   }
// });

export function Page() {
  const startRtc = async () => {
    const remoteVideo =
      (document.querySelector("#remote-video") as HTMLVideoElement) || null;

    console.log({ remoteVideo });

    peerConnection.addEventListener("track", async (event) => {
      if (!remoteVideo) return;
      const [remoteStream] = event.streams;
      remoteVideo.srcObject = remoteStream;
    });

    const openMediaDevices = async (constraints) => {
      return await navigator.mediaDevices.getUserMedia(constraints);
    };

    try {
      const localStream = await openMediaDevices({ video: true, audio: true });
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });
      console.log("Got MediaStream:", localStream);
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }

    offer.offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer.offer);
    console.log("Created offer:", offer);
    pRef.elm.innerText = JSON.stringify(offer);
  };

  const nextRtc = async () => {
    const message = JSON.parse(txtAreaRef.elm.value);
    const answerOrOffer = message.answer ? message.answer : message.offer;
    peerConnection.setRemoteDescription(
      new RTCSessionDescription(answerOrOffer)
    );

    if (message.candidates.length > 0) {
      for (let i = 0; i < message.candidates.length; i++) {
        const candidate = message.candidates[i];

        try {
          await peerConnection.addIceCandidate(candidate);
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      }
    }

    if (message.answer) return;

    offer.answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(offer.answer);
    pRef.elm.innerText = JSON.stringify(offer);
  };

  return (
    <>
      <h1>Hello</h1>
      <Btn onClick={startRtc}>Start</Btn>
      <br />
      <p ref={pRef}></p>
      <textarea ref={txtAreaRef}></textarea>
      <br />
      <Btn onClick={nextRtc}>Next</Btn>
      <video id="remote-video"></video>
    </>
  );
}

function Btn(props) {
  return (
    <button
      type="button"
      {...props}
      class="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      {props.children}
    </button>
  );
}

export const Layout = MainLayout;
