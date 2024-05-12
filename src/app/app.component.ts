import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//ts-ignore
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VideoPlayerComponent, CommonModule, FormsModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('buttonStart') buttonStart;
  @ViewChild('buttonStop') buttonStop;
  @ViewChild('buttonSwitch') buttonSwitch;

  @ViewChild('videoLive') videoLive;
  @ViewChild('videoRecorded') videoRecorded;

  @Input() maxLength = 7000;
  @Input() maxSize = 2000000;

  recordedBlobs = [];
  recordedBlobSize = 0;
  requestDataInterval = null;
  mediaRecordStopInterval = null;
  stream = null;

  front = false;
  first_time = true;
  mediaRecorder;

  ngOnInit() {}

  ngAfterViewInit(): void {
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: this.front ? "environment" : "user", height:250, width:350 },
    }).then(data => {
      this.stream = data
      this.initVideoPlayer(this.stream)
    });
  }

  switchStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop()
        track.enabled = false
      })
    }

    this.front = !this.front;

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: this.front ? "environment" : "user" },
    }).then( data => {this.stream = data 
      this.initVideoPlayer(this.stream) })
   
  }

  startVideo() {
    this.mediaRecorder.start() // <4>
    this.mediaRecordStopInterval = setInterval(()=>  { 
      clearInterval(this.requestDataInterval)
      this.mediaRecorder.stop()
     }, this.maxLength +1000)
    
    this.buttonStart.nativeElement.setAttribute('disabled', '')
    this.buttonStop.nativeElement.removeAttribute('disabled')
  }

  stopVideo() {
    this.mediaRecorder.stop()
    this.buttonStart.nativeElement.removeAttribute('disabled')
    this.buttonStop.nativeElement.setAttribute('disabled', '')
  }

  initVideoPlayer(stream) {
    try {
    let track = stream.getVideoTracks()[0];
    track.applyConstraints({
      advanced: [{ torch: true }]
    });
  } catch(e) {}


    //@ts-ignore
    this.videoLive.nativeElement.srcObject = stream

    if (!MediaRecorder.isTypeSupported('video/webm')) { // <2>
      console.warn('video/webm is not supported')
    }

    this.mediaRecorder = new MediaRecorder(this.stream, { // <3>
      mimeType: 'video/webm',
    })

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
        this.recordedBlobSize += event.data.size
        if (this.recordedBlobSize > this.maxSize) {
          console.log(this.recordedBlobSize)
          this.mediaRecorder.stop() // <5>
        }
      }
    }

    this.mediaRecorder.onstart = (e) => {
      this.requestDataInterval = setInterval(() => this.mediaRecorder.requestData(), 1000)
    }

    this.mediaRecorder.onstop = (e) => {
      clearInterval(this.mediaRecordStopInterval)
      const blob = new Blob(this.recordedBlobs, { type: "audio/ogg; codecs=opus" });
      //@ts-ignore
      this.videoRecorded.nativeElement.src = URL.createObjectURL(blob) // <6>
    }
  }
}



export const config = {
  maxLength: 7000,
  maxSize: 2000000
}