export interface AudioRecorderWorkletNode extends AudioWorkletNode {
  port: MessagePort;
}

export interface AudioPlayerWorkletNode extends AudioWorkletNode {
  port: MessagePort;
}

// Audio recorder setup
export async function startAudioRecorderWorklet(
  audioRecorderHandler: (pcmData: ArrayBuffer) => void
): Promise<[AudioRecorderWorkletNode, AudioContext, MediaStream]> {
  // Create an AudioContext
  const audioRecorderContext = new AudioContext({ sampleRate: 16000 });
  console.log("AudioContext sample rate:", audioRecorderContext.sampleRate);

  // Load the AudioWorklet module
  await audioRecorderContext.audioWorklet.addModule('/pcm-recorder-processor.js');

  // Request access to the microphone
  const micStream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1 },
  });
  const source = audioRecorderContext.createMediaStreamSource(micStream);

  // Create an AudioWorkletNode that uses the PCMProcessor
  const audioRecorderNode = new AudioWorkletNode(
    audioRecorderContext,
    "pcm-recorder-processor"
  ) as AudioRecorderWorkletNode;

  // Connect the microphone source to the worklet.
  source.connect(audioRecorderNode);
  audioRecorderNode.port.onmessage = (event) => {
    // Convert to 16-bit PCM
    const pcmData = convertFloat32ToPCM(event.data);
    // Send the PCM data to the handler.
    audioRecorderHandler(pcmData);
  };

  return [audioRecorderNode, audioRecorderContext, micStream];
}

// Audio player setup
export async function startAudioPlayerWorklet(): Promise<[AudioPlayerWorkletNode, AudioContext]> {
  const audioPlayerContext = new AudioContext({ sampleRate: 24000 });
  
  // Load the AudioWorklet module
  await audioPlayerContext.audioWorklet.addModule('/pcm-player-processor.js');
  
  // Create an AudioWorkletNode that uses the PCMPlayerProcessor
  const audioPlayerNode = new AudioWorkletNode(
    audioPlayerContext,
    "pcm-player-processor"
  ) as AudioPlayerWorkletNode;
  
  // Connect to speakers
  audioPlayerNode.connect(audioPlayerContext.destination);
  
  return [audioPlayerNode, audioPlayerContext];
}

// Convert Float32 samples to 16-bit PCM.
function convertFloat32ToPCM(inputData: Float32Array): ArrayBuffer {
  // Create an Int16Array of the same length.
  const pcm16 = new Int16Array(inputData.length);
  for (let i = 0; i < inputData.length; i++) {
    // Multiply by 0x7fff (32767) to scale the float value to 16-bit PCM range.
    pcm16[i] = inputData[i] * 0x7fff;
  }
  // Return the underlying ArrayBuffer.
  return pcm16.buffer;
}

// Decode Base64 data to Array
export function base64ToArray(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Stop microphone
export function stopMicrophone(micStream: MediaStream): void {
  micStream.getTracks().forEach((track) => track.stop());
  console.log("stopMicrophone(): Microphone stopped.");
}
