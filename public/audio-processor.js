class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs) {
    const input = inputs[0];
    
    if (input.length > 0) {
      const inputChannel = input[0];
      
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex] = inputChannel[i];
        this.bufferIndex++;
        
        if (this.bufferIndex >= this.bufferSize) {
          // Convert Float32Array to Int16Array for transmission
          const int16Buffer = new Int16Array(this.bufferSize);
          for (let j = 0; j < this.bufferSize; j++) {
            int16Buffer[j] = Math.max(-1, Math.min(1, this.buffer[j])) * 0x7FFF;
          }
          
          // Send audio data to main thread
          this.port.postMessage(int16Buffer.buffer);
          
          // Reset buffer
          this.bufferIndex = 0;
        }
      }
    }
    
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
