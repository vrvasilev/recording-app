import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild, effect, signal } from '@angular/core';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css'
})
export class VideoPlayerComponent {

  @ViewChild('videoLive') videoLive;
  @ViewChild('videoRecorded') videoRecorded;

  @Input() maxLength = 7000;
  @Input() maxSize = 5000000;

  mediaRecorder: MediaRecorder = null;
  outputMimeType;
  frontCameraFlag: boolean = true;
  stream;

  recordedBlobs = [];
  recordedBlobSize = 0;
  requestDataInterval = null;
  mediaRecordStopInterval = null;
  firstPhase: boolean = true;
  secondPhase: boolean = false;
  thirdPhase: boolean = false;

  switchVideoRecording: boolean = false;
  audio = new Audio("https://www.fesliyanstudios.com/play-mp3/780");

  switchTorch = signal(false);

  currentDuration: number = 0;
  currentDurationInterval = null;
  ngOnInit() {
    //@ts-ignore
    // navigator.permissions.query({ name: "camera" }).then((result) => {
    //   if (result.state === "granted") {
    //     alert('Camera is allowed')
    //   } else if (result.state === "prompt") {
    //     alert('Camera permission is disableb')
    //   }
    // });

    if (MediaRecorder.isTypeSupported('video/mp4')) {
      this.outputMimeType = { mimeType: 'video/mp4', videoBitsPerSecond: 1000000 };
    } else {
      console.error("ERROR: Is this really an IOS device??");
      this.outputMimeType = { mimeType: 'video/webm' };
    }
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: this.frontCameraFlag ? "user" : "environment" },
      audio: true
    }).then(data => {
      this.stream = data
      this.initVideoPlayer(this.stream)
    });
  }

  initVideoPlayer(stream) {
    this.videoLive.nativeElement.srcObject = stream

    this.mediaRecorder = new MediaRecorder(this.stream, this.outputMimeType)

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
        this.recordedBlobSize += event.data.size
        if (this.recordedBlobSize > this.maxSize) {
          this.mediaRecorder.stop()
        }
      }
    }

    this.mediaRecorder.onstart = (e) => {
      this.requestDataInterval = setInterval(() => this.mediaRecorder.requestData(), 1000)
    }

    this.mediaRecorder.onstop = (e) => {
      clearInterval(this.requestDataInterval);
      clearInterval(this.currentDurationInterval);
      clearInterval(this.mediaRecordStopInterval)
      const blob = new Blob(this.recordedBlobs, { type: "video/mp4" });
      this.videoRecorded.nativeElement.src = URL.createObjectURL(blob);
      this.recordedBlobs = [];
      this.switchTorch.set(false);

    }
  }

  startVideo() {
    this.mediaRecorder.start()
    this.firstPhase = false;
    this.secondPhase = true;
    this.switchVideoRecording = false;

    this.currentDurationInterval = setInterval(() => this.currentDuration += 1000, 1000)

    this.mediaRecordStopInterval = setInterval(() => {
      clearInterval(this.requestDataInterval)
      this.stopVideo();
      clearInterval(this.mediaRecordStopInterval);
    }, this.maxLength + 1000)
  }

  stopVideo() {
    this.mediaRecorder.stop();
    this.secondPhase = false;
    this.thirdPhase = true;
    this.switchVideoRecording = true;
  }


  switchStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop()
        track.enabled = false
      })
    }
    this.frontCameraFlag = !this.frontCameraFlag;

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: this.frontCameraFlag ? "user" : "environment" },
      audio: true,//possible iphone problem
    }).then(data => {
      this.stream = data
      this.initVideoPlayer(this.stream)
      this.audio.play();
    })
  }

  torchEffect = effect(() => {
    console.log('here')
    let switchValue =this.switchTorch();
    if (this.stream) {
      let track = this.stream.getVideoTracks()[0];
      try {
        track.applyConstraints({
          advanced: [{ torch: switchValue }]
        });
      } catch (e) { }
    }
  })

  applyTorch() {
    this.switchTorch.set(!this.switchTorch());
  }

  tryAgain() {
    this.currentDuration = 0;
    this.firstPhase = true;
    this.thirdPhase = false;
    this.switchVideoRecording = false;
  }

  done() { }
}
