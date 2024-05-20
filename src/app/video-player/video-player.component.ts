import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewChild, computed, effect, signal } from '@angular/core';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css',
  // changeDetection: ChangeDetectionStrategy.OnPush,

})
export class VideoPlayerComponent {

  @ViewChild('videoLive') videoLive;
  @ViewChild('videoRecorded') videoRecorded;

  @Input() maxLength: number = 7000;
  @Input() maxSize: number = 500;

  mediaRecorder: MediaRecorder;
  outputMimeType: MediaRecorderOptions;
  stream: MediaStream;

  frontCameraFlag = signal(true);
  desktopCameraFlag = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);


  recordedBlobs: Blob[] = [];
  recordedBlobSize: number = 0;
  requestDataInterval = null;
  mediaRecordStopInterval = null;

  firstPhase = signal(true);
  secondPhase = signal(false);
  thirdPhase = computed(() => !(this.firstPhase() || this.secondPhase()));

  switchVideoRecording = signal(false);
  audio = new Audio("https://www.fesliyanstudios.com/play-mp3/780");

  switchTorch = signal(false);

  currentDuration: number = 0;
  currentDurationInterval = null;

  constructor(private ref: ChangeDetectorRef) {

  }

  ngOnInit() {
    console.log(this.desktopCameraFlag)
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
      video: { facingMode: this.frontCameraFlag() ? "user" : "environment" },
      audio: true
    }).then(data => {
      this.stream = data
      this.initVideoPlayer(this.stream)
    });
  }

  initVideoPlayer(stream: MediaStream) {
    this.videoLive.nativeElement.srcObject = stream
    this.videoLive.nativeElement.muted = true

    this.mediaRecorder = new MediaRecorder(this.stream, this.outputMimeType)

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
        this.recordedBlobSize += event.data.size
        console.log(this.recordedBlobSize )

        if (this.recordedBlobSize / 1000 > this.maxSize) {
          this.recordedBlobSize = 0
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
      this.secondPhase.set(false);
      this.switchVideoRecording.set(true);
      this.ref.detectChanges();
    }
  }

  startVideo(): void {

    this.mediaRecorder.start()
    this.firstPhase.set(false);
    this.secondPhase.set(true);

    this.currentDurationInterval = setInterval(() => {this.currentDuration += 1000
      this.ref.detectChanges();
    }, 1000)

    this.mediaRecordStopInterval = setInterval(() => {
      clearInterval(this.requestDataInterval)
      this.stopVideo();
      clearInterval(this.mediaRecordStopInterval);
    }, this.maxLength + 1000)
    this.ref.detectChanges();

  }

  stopVideo(): void {
    this.mediaRecorder.stop();
  }


  switchStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop()
        track.enabled = false
      })
    }
    this.frontCameraFlag.set(!this.frontCameraFlag());

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: this.frontCameraFlag() ? "user" : "environment" },
      audio: true,//possible iphone problem
    }).then(data => {
      this.stream = data
      this.initVideoPlayer(this.stream)
      this.audio.play();
    })
    this.ref.detectChanges();

  };

  torchEffect = effect(() => {
    let switchValue = this.switchTorch();
    if (this.stream) {
      let track: MediaStreamTrack = this.stream.getVideoTracks()[0];
      try {
        track.applyConstraints({
          advanced: [{ torch: switchValue } as MediaTrackConstraints]
        });
      } catch (e) { }
    }
  })

  applyTorch(): void {
    this.switchTorch.set(!this.switchTorch());
    this.ref.detectChanges();

  }

  tryAgain(): void {
    this.currentDuration = 0;
    this.firstPhase.set(true);
    this.switchVideoRecording.set(false);
    this.ref.detectChanges();

  }

  done() { }
}
