import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';
import { iPersonSave, iUserparams } from '../shared/interfaces/default.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenGenerateService } from '../shared/services/token-generate.service';

@Component({
  selector: 'app-user-photo',
  templateUrl: './user-photo.component.html',
  styleUrls: ['./user-photo.component.scss']
})
export class UserPhotoComponent implements OnInit, OnDestroy {

  @ViewChild('video',{ static: true }) public video!: ElementRef;
  @ViewChild('canvas',{ static: true }) public canvasRef!: ElementRef;
  @ViewChild('loader') loader!: ElementRef;
  @ViewChild('canvas') canvasPhoto!: ElementRef<HTMLCanvasElement>;

  userParamsUrl: string = '?tipoIngresso=avulso&nome=Carlos Miguel&dataNascimento=1985-12-31&localizador=95xcKo3&idBilhete=484886-23,448499-88,585645-77&dataCheckin=2023-04-04'
  stream!: MediaStream;
  image_data_url: string = '';
  detection: any;
  resizedDetections: any;
  canvas: any;
  canvasEl: any;
  displaySize: any;
  videoInput: any;
  savePerson!: iPersonSave;
  userParams!: iUserparams;
  tzoffset = (new Date()).getTimezoneOffset() * 60000;
  startDateTime!: string;
  sendStatus: number = 0;
  tipoErro: string = '';


  WIDTH = 640;
  HEIGHT = 520;

  constructor(
    private elRef: ElementRef,
    private route: ActivatedRoute,
    private enviar: TokenGenerateService,
    private router: Router
  ) { }
 
  async ngOnInit(): Promise<void> {
    this.startDateTime = new Date(Date.now() - this.tzoffset).toISOString();
    this.route.queryParamMap
      .subscribe((params) => {
        const string = JSON.stringify({...params})
        if (params && JSON.parse(string).params) {
          this.userParams = JSON.parse(string).params
          console.log(this.userParams)
        }
      }
    );
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri('../../assets/models'),
      await faceapi.nets.faceLandmark68Net.loadFromUri('../../assets/models'),
      await faceapi.nets.faceRecognitionNet.loadFromUri('../../assets/models'),
      await faceapi.nets.faceExpressionNet.loadFromUri('../../assets/models'),])
      .then(
        () => this.startVideo()
              .then(
                () => {
                  this.loader.nativeElement.classList.add('fade-out');
                  setTimeout(() => {
                    this.loader.nativeElement.classList.add('d-none');

                  }, 500)
                }
              )
        )
    } else {
      alert('sem suporte')
    }
    
  }

  async startVideo() {
    this.stream = await navigator.mediaDevices
        .getUserMedia({  video: {
            width: 800 ,
            height: 600 ,
            frameRate: 30 ,
            facingMode: "environment",
            noiseSuppression: true
        }
      });
        this.videoInput = this.video.nativeElement;
        navigator.mediaDevices.getUserMedia(
          { video: {}, audio: false },
        ).then (
          (stream) => (this.videoInput.srcObject = stream),
          (err) => console.log(err)
        )
        this.detect_Faces();
  }

  async detect_Faces() {
    this.elRef.nativeElement.querySelector('video').addEventListener('play', async () => {
      this.canvas = faceapi.createCanvasFromMedia(this.videoInput);
      this.canvasEl = this.canvasRef.nativeElement;
      this.canvasEl.appendChild(this.canvas);
      this.canvas.setAttribute('id', 'canvass');
      this.canvas.setAttribute(
         'style',`position: absolute;
         top: -5%;
         left: 50%;
         transform: translateX(-50%);`
      );
      this.displaySize = {
         width: this.videoInput.width,
         height: this.videoInput.height,
      };
      faceapi.matchDimensions(this.canvas, this.displaySize);
      setInterval(async () => {
        this.detection = await faceapi.detectAllFaces(this.videoInput,  new  faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        this.resizedDetections = faceapi.resizeResults(
           this.detection,
           this.displaySize
         );
        this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width,this.canvas.height);
        faceapi.draw.drawDetections(this.canvas, this.resizedDetections);
        // faceapi.draw.drawFaceLandmarks(this.canvas, this.resizedDetections);
        // faceapi.draw.drawFaceExpressions(this.canvas, this.resizedDetections);
     }, 100);
     });
    }

  ngOnDestroy(): void {
    this.stream.getTracks()[0].stop();
  }


  tirarFoto() {
    this.canvas.getContext('2d')?.drawImage(this.videoInput, 0, 0, this.canvas.width, this.canvas.height);
   	this.image_data_url = this.canvas.toDataURL('image/jpeg');
     this.stream.getTracks()[0].stop();
     sessionStorage.setItem('_userParams', JSON.stringify(this.userParams));
    sessionStorage.setItem('_foto', JSON.stringify(this.image_data_url));
    this.sendStatus = 1;
    this.stream.getTracks()[0].stop();
    setTimeout(() => {
      this.sendStatus = 2;
    }, 2000);
    setTimeout(() => {
      this.router.navigate(['cadastroIngresso']);
    }, 4000);
  }

  repetirFoto() {
    this.image_data_url = '';
    this.sendStatus = 0;
  }

  getToken() {
    this.sendStatus = 1;
    if (this.image_data_url != '' && this.userParams) {
      this.enviar.getToken()
      .subscribe({
        next: (response: string) => {
          if (response) {
            this.enviar.token = response;
            // this.sendPerson(response);
          }
        },
        error: (error: Error) => {
          this.tipoErro = 'Falha na captura do token.'
          this.sendStatus = 3;
          console.log(error);
        }
      })
    }
  }

  // sendPerson(token: string) {
  //   this.enviar.enviarDados(token, this.savePerson)
  //   .subscribe({
  //     next: (response: string) => {
  //       if (response) {
  //         this.enviar.token = response;
  //         this.sendStatus = 2;
  //       }
  //     },
  //     error: (error: Error) => {
  //       this.tipoErro = 'Falha no envio da imagem e dados.'
  //       this.sendStatus = 3;
  //       console.log(error);
  //     }
  //   })
  // }

}
