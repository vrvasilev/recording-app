import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css'
})
export class VideoPlayerComponent {

  @ViewChild('buttonStart') buttonStart;
  @ViewChild('buttonStop') buttonStop;
  @ViewChild('buttonSwitch') buttonSwitch;

  @ViewChild('videoLive') videoLive;
  @ViewChild('videoRecorded') videoRecorded;

  @Input() maxLength = 7000;
  @Input() maxSize = 5000000;

  mediaRecorder: MediaRecorder = null;
  outputMimeType;
  frontCameraFlag: boolean = false;
  stream;

  recordedBlobs = [];
  recordedBlobSize = 0;
  requestDataInterval = null;
  mediaRecordStopInterval = null;
  firstPhase: boolean = true;
  secondPhase: boolean = false;
  thirdPhase: boolean = false;
  switchVideoRecording: boolean = false;
  switchTorch: boolean = false;

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

    this.mediaRecorder.ondataavailable = (event: BlobEvent ) => {
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
      const blob = new Blob(this.recordedBlobs, { type: "video/mp4" });
      this.videoRecorded.nativeElement.src = URL.createObjectURL(blob);
      this.recordedBlobs = [];
    }
  }

  startVideo() {
    this.mediaRecorder.start()
    this.firstPhase = false;
    this.secondPhase = true;
    this.switchVideoRecording = false;

    this.currentDurationInterval = setInterval( ()  => this.currentDuration += 1000, 1000)

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
      video: { facingMode: this.frontCameraFlag ? "environment" : "user" },
    }).then(data => {
      this.stream = data
      this.initVideoPlayer(this.stream)
    })
  }

  applyTorch() {
    this.switchTorch = !this.switchTorch;
    try {
      let track = this.stream.getVideoTracks()[0];
      track.applyConstraints({
        advanced: [{ torch: this.switchTorch }]
      });
    } catch (e) { }
  }

  tryAgain() {
    this.firstPhase = true;
    this.thirdPhase = false;
    this.switchVideoRecording = false;
  }

  done() {}
}
