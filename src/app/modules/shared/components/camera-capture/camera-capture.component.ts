import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Modal } from "bootstrap";
import { error } from 'console';
import * as faceapi from 'face-api.js';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-camera-capture',
  templateUrl: './camera-capture.component.html',
  styleUrls: ['./camera-capture.component.scss'],
})
export class CameraCaptureComponent implements OnInit {

  @ViewChild('modalCaptura') modalCaptura!: ElementRef;
  @ViewChild('video',{ static: true }) public video!: ElementRef;
  @ViewChild('canvas',{ static: true }) public canvasRef!: ElementRef;
  @ViewChild('loader') loader!: ElementRef;
  @ViewChild('canvas') canvasPhoto!: ElementRef<HTMLCanvasElement>;
  @ViewChild('imgPreview') imgPreview!: ElementRef<HTMLCanvasElement>;
  @Output() photo = new EventEmitter<Object>();
  @Output() mediaPermission = new EventEmitter<boolean>();
  
  stream!: MediaStream;
  image_data_url: string = '';
  imageFile!: File | null;
  modal!: Modal;
  detection: any;
  resizedDetections: any;
  canvas: any;
  canvasEl: any;
  displaySize: any;
  videoInput: any;
  tzoffset = (new Date()).getTimezoneOffset() * 60000;
  startDateTime!: string;
  sendStatus: number = 0;
  tipoErro: string = '';
  interval!: any;
 
  WIDTH = 465;
  HEIGHT = 320;

  constructor(
    private elRef: ElementRef,
  ) { }

  async ngOnInit(): Promise<void> {
   
  }

  async iniciarCamera() {
    this.imageFile = null;
    this.loader.nativeElement.classList.remove('fade-out');
    this.loader.nativeElement.classList.remove('d-none');
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      this.modal = new Modal(this.modalCaptura.nativeElement);
      this.modal.show();
      this.modalCaptura.nativeElement.addEventListener('hidden.bs.modal', () => {
        this.cancelarFoto();
      })
      await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri('../../assets/models'),
      await faceapi.nets.faceLandmark68Net.loadFromUri('../../assets/models'),
      await faceapi.nets.faceRecognitionNet.loadFromUri('../../assets/models'),
      await faceapi.nets.faceExpressionNet.loadFromUri('../../assets/models'),])
      .then(
        () => this.startVideo()
        )
    } else {
      alert('sem suporte')
    }
  }

  async startVideo() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({  
        video: {
          width: 800 ,
          height: 600 ,
          frameRate: 30 ,
          facingMode: "user",
          noiseSuppression: true
        }
      });
      this.videoInput = this.video.nativeElement;
      this.videoInput.setAttribute("playsinline", true);
      this.videoInput.controls = false;
      this.videoInput.srcObject = this.stream;
      this.videoInput.controls = false;
       this.videoInput.controlsList = "nodownload";
      this.mediaPermission.emit(true);
      setTimeout(() => {
        this.loader.nativeElement.classList.add('d-none');
      }, 300)
      this.detect_Faces()
      .then(() => {
        this.loader.nativeElement.classList.add('fade-out');
      });
    } catch (error) {
      this.loader.nativeElement.classList.remove('fade-out');
      this.loader.nativeElement.classList.remove('d-none');
      console.log("Erro ao acessar a câmera: ", error);
      this.mediaPermission.emit(false);
      this.modal.hide();
    }
  }

  async detect_Faces() {
    const detectAgent = navigator.userAgent;
    this.elRef.nativeElement.querySelector('video').style.display = 'block';
    this.canvasRef.nativeElement.style.display = 'block';
    if (detectAgent.toUpperCase().includes('MOBILE') || detectAgent.toUpperCase().includes('IPHONE') || (detectAgent.toUpperCase().includes('MOBILE') && detectAgent.toUpperCase().includes('ANDROID')) || (detectAgent.toUpperCase().includes('MOBILE') && detectAgent.toUpperCase().includes('IOS'))) {
      this.elRef.nativeElement.querySelector('video').addEventListener('play', async () => {
        this.canvas = faceapi.createCanvasFromMedia(this.videoInput);
        this.canvasEl = this.canvasRef.nativeElement;
        this.WIDTH = 240;
        // this.imgPreview.nativeElement.style.width = '200';
        this.canvasEl.appendChild(this.canvas);
        this.canvas.parentNode.style.position = 'relative';
        this.canvas.setAttribute('id', 'canvass');
        this.canvas.setAttribute(
            'style',`position: absolute;
            top: 0%;
            left: 0%;
            transform: translateX(-100%);`
        );
        this.displaySize = {
            width: 240,
            height: 320,
        };
        faceapi.matchDimensions(this.canvas, this.displaySize);
        this.interval = setInterval(async () => {
          this.detection = await faceapi.detectAllFaces(this.videoInput,  new  faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
          this.resizedDetections = faceapi.resizeResults(
              this.detection,
              this.displaySize
            );
          this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width,this.canvas.height);
          faceapi.draw.drawDetections(this.canvas, this.resizedDetections);
          // faceapi.draw.drawFaceLandmarks(this.canvas, this.resizedDetections);
          // faceapi.draw.drawFaceExpressions(this.canvas, this.resizedDetections);
        }, 800);
        this.loader.nativeElement.classList.add('fade-out');
        });
        this.videoInput.addEventListener('ended', () => {
          clearInterval(this.interval);
          this.videoInput.removeEventListener('click', this.interval);
        });
    } else {
      this.WIDTH = 460;
      this.HEIGHT = 320;
      this.elRef.nativeElement.querySelector('video').addEventListener('play', async () => {
      this.canvas = faceapi.createCanvasFromMedia(this.videoInput);
      this.canvasEl = this.canvasRef.nativeElement;
      this.canvasEl.appendChild(this.canvas);
      this.canvas.parentNode.style.position = 'relative';
      this.canvas.setAttribute('id', 'canvass');
      this.canvas.setAttribute(
          'style',`position: absolute;
          top: 0%;
          left: 0%;
          transform: translateX(-100%);`
      );
      this.displaySize = {
          width: this.videoInput.width,
          height: this.videoInput.height,
      };
      faceapi.matchDimensions(this.canvas, this.displaySize);
      this.interval = setInterval(async () => {
        this.detection = await faceapi.detectAllFaces(this.videoInput,  new  faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        this.resizedDetections = faceapi.resizeResults(
            this.detection,
            this.displaySize
          );
        this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width,this.canvas.height);
        faceapi.draw.drawDetections(this.canvas, this.resizedDetections);
        // faceapi.draw.drawFaceLandmarks(this.canvas, this.resizedDetections);
        // faceapi.draw.drawFaceExpressions(this.canvas, this.resizedDetections);
      }, 1000);
      this.loader.nativeElement.classList.add('fade-out');
      });
    }
    this.videoInput.addEventListener('click', () => {
      this.videoInput.play();
    });
    this.videoInput.addEventListener('ended', () => {
      clearInterval(this.interval);
      this.videoInput.removeEventListener('click', this.interval);
    });
  }

  finalizarCaptura() {
    clearInterval(this.interval);
    this.videoInput.removeAllListeners();
    this.videoInput.srcObject = undefined;
    if (this.elRef.nativeElement) {
      this.elRef.nativeElement.querySelector('video').removeAllListeners();
      this.elRef.nativeElement.querySelector('canvas').remove();
    }
  }

  tirarFoto() {
    this.canvas.getContext('2d')?.drawImage(this.video.nativeElement, 0, 0, this.canvas.width, this.canvas.height);
   	this.image_data_url = this.canvas.toDataURL('image/jpeg');
    this.imageFile = this.dataURLtoFile(this.image_data_url, 'photo');
  }

  repetirFoto() {
    this.image_data_url = '';
    this.photo.emit({string: this.image_data_url, file: ''});
  }

  cancelarFoto() {
    const tracks = this.stream.getTracks();
    tracks.forEach(track => track.stop());
    this.canvas = undefined;
    this.canvasEl = undefined;
    clearInterval(this.interval);
    this.videoInput.srcObject = undefined;
    if (this.elRef.nativeElement) {
      this.elRef.nativeElement.querySelector('video').removeAllListeners();
      this.elRef.nativeElement.querySelector('canvas').remove();
    }
    this.modal.hide();
  }

  salvarImagem() {
    this.canvas.getContext('2d')?.drawImage(this.video.nativeElement, 0, 0, this.canvas.width, this.canvas.height);
   	this.image_data_url = this.canvas.toDataURL('image/jpeg');
    this.imageFile = this.dataURLtoFile(this.image_data_url, 'photo');
    this.photo.emit({string: this.image_data_url, file: this.imageFile});
    clearInterval(this.interval)
    const tracks = this.stream.getTracks();
    tracks.forEach(track => track.stop());
    this.canvas = undefined;
    this.canvasEl = undefined;
    this.videoInput.srcObject = undefined;
    this.elRef.nativeElement.querySelector('video').removeAllListeners();
    this.elRef.nativeElement.querySelector('canvas').remove();
    this.modal.hide();
  }

  dataURLtoFile(dataurl: string, filename: string) {
 
    var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)![1],
    bstr = atob(arr[1]), 
    n = bstr.length, 
    u8arr = new Uint8Array(n);
        
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type:mime});
  }    

}
