import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timer } from 'rxjs';
import { NgxRecordingLibComponent } from 'ngx-recording-lib';
//ts-ignore
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VideoPlayerComponent, CommonModule, FormsModule, NgxRecordingLibComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  recording = signal(true);
  duration = signal(10000);
  size = signal(5000);
  preview = signal(false);

  recordingStarting(): void {
    this.recording.set(false)
  }

  cancelRecording(event): void {
    this.recording.set(true)
  }

  recordingFile(event): void {
    console.log(event)
  }

  // @ViewChild('buttonStart') buttonStart;
  // @ViewChild('buttonStop') buttonStop;
  // @ViewChild('buttonSwitch') buttonSwitch;

  // @ViewChild('videoLive') videoLive;
  // @ViewChild('videoRecorded') videoRecorded;

  // @Input() maxLength = 7000;
  // @Input() maxSize = 5000000;

  // recordedBlobs = [];
  // recordedBlobSize = 0;
  // requestDataInterval = null;
  // mediaRecordStopInterval = null;
  // stream = null;
  // loaded = false;

  // front = false;
  // first_time = true;
  // mediaRecorder;
  // outputMimeType;

  // ngOnInit() {
  //   navigator.permissions.query({ name: "camera" }).then((result) => {
  //     if (result.state === "granted") {
  //       alert('Camera is allowed')
  //     } else if (result.state === "prompt") {
  //       alert('Camera permission is disableb')
  //     }
  //   });

  //   if (MediaRecorder.isTypeSupported('video/mp4')) {
  //     this.outputMimeType = { mimeType: 'video/mp4', videoBitsPerSecond: 1000000 };
  //   } else {
  //     console.error("ERROR: Is this really an IOS device??");
  //     this.outputMimeType = { mimeType: 'video/webm' };
  //   }
  //   navigator.mediaDevices.getUserMedia({
  //     video: { facingMode: this.front ? "user" : "environment", height: 250, width: 350 },
  //     audio: true
  //   }).then(data => {
  //     this.stream = data
  //     this.initVideoPlayer(this.stream)
  //   });
  // }

  // ngOnChanges(changes: SimpleChanges): void {
  //   console.log(changes)
  //   this.ngOnInit();
  // }

  // switchStream() {
  //   if (this.stream) {
  //     this.stream.getTracks().forEach(track => {
  //       track.stop()
  //       track.enabled = false
  //     })
  //   }

  //   this.front = !this.front;

  //   navigator.mediaDevices.getUserMedia({
  //     video: { facingMode: this.front ? "environment" : "user" },
  //   }).then(data => {
  //     this.stream = data
  //     this.initVideoPlayer(this.stream)
  //   })

  // }

  // startVideo() {
  //   this.mediaRecorder.start() 
  //   this.mediaRecordStopInterval = setInterval(()=>  { 
  //     clearInterval(this.requestDataInterval)
  //     this.mediaRecorder.stop()
  //     clearInterval(this.mediaRecordStopInterval);
  //    }, this.maxLength + 1000)

  //   this.buttonStop.nativeElement.classList.add('btn-danger')
  //   this.buttonStart.nativeElement.setAttribute('disabled', '')
  //   this.buttonStop.nativeElement.removeAttribute('disabled')
  // }

  // stopVideo() {
  //   this.mediaRecorder.stop()
  //   this.buttonStop.nativeElement.classList.remove('btn-danger')

  //   this.buttonStart.nativeElement.removeAttribute('disabled')
  //   this.buttonStop.nativeElement.setAttribute('disabled', '')
  // }

  // initVideoPlayer(stream) {
  //     try {
  //     let track = stream.getVideoTracks()[0];
  //     track.applyConstraints({
  //       advanced: [{ torch: true }]
  //     });
  //   } catch(e) {}
  //   this.loaded = true;


  //   this.videoLive.nativeElement.srcObject = stream

  //   this.mediaRecorder = new MediaRecorder(this.stream, this.outputMimeType)

  //   this.mediaRecorder.ondataavailable = (event) => {
  //     console.log('here 1 ')
  //     if (event.data && event.data.size > 0) {
  //       this.recordedBlobs.push(event.data);
  //       this.recordedBlobSize += event.data.size
  //       if (this.recordedBlobSize > this.maxSize) {
  //         console.log(this.recordedBlobSize)
  //         this.mediaRecorder.stop() // <5>
  //       }
  //     }
  //   }

  //   this.mediaRecorder.onstart = (e) => {
  //     this.requestDataInterval = setInterval(() => this.mediaRecorder.requestData(), 1000)
  //   }

  //   this.mediaRecorder.onstop = (e) => {
  //     console.log('here 2 ')
  //     clearInterval(this.requestDataInterval)
  //     const blob = new Blob(this.recordedBlobs, { type: "video/mp4" });
  //     this.videoRecorded.nativeElement.src = URL.createObjectURL(blob);
      
  //   this.buttonStop.nativeElement.classList.remove('btn-danger')

  //   this.buttonStart.nativeElement.removeAttribute('disabled')
  //   this.buttonStop.nativeElement.setAttribute('disabled', '')
  //     this.recordedBlobs = [];
  //   }
  // }
}