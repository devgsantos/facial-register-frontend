import { AfterContentInit, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Toast } from 'bootstrap';
import { iChekTicket, iDefaultResponse, iDocumento, iJokerList, iPartialTicketItem, iPersonSave, iUserparams } from '../shared/interfaces/default.interface';
import { TokenGenerateService } from '../shared/services/token-generate.service';
import { Modal } from 'bootstrap'
import { ActivatedRoute, Router } from '@angular/router';
import { ApiTicketService } from '../shared/services/api-ticket.service';
import { EMPTY, Subject, from, of, throwError } from 'rxjs';
import { concatMap, catchError, finalize, filter, mergeMap, map, timeoutWith, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss']
})
export class TicketFormComponent implements OnInit, AfterViewInit {

  form!: FormGroup;
  @ViewChild('toastDiv', { static: false }) toastDiv!: ElementRef;
  @ViewChild('toastDiv', { static: false }) toastDivError!: ElementRef;
  @ViewChild('modalElem') modalElem!: ElementRef;
  @ViewChild('confirmModal') confirmModal!: ElementRef;

  loading: boolean = false;
  loadingText: string = '';
  startText: string = 'Iniciando plataform de checkin.';
  success: boolean = true;
  validCPFs: boolean[] = [];
  validDatas: boolean[] = [];
  dataLimite!: string;
  validosParaEnvio!: any;
  ticketsRecuperados: iPartialTicketItem[] = [];
  confirmaEnviados!: any;
  dataVisita = new Date();
  utilizadoresEnvio: any[] = [];
  warningMessage: string = '';
  warningMessages: string[] = [];
  aEnviarQtd!: number;
  permissionGranted!: boolean;
  cpfDuplicado: boolean = false;
  cpfDuplicadoTodos: boolean = false;
  confirmaEnvioUnico: boolean = false;
  envioUnico!: any;
  utilizadoresSend!: any;
  checkEnviados: any[] = [];
  contarEnviados: number = 0;
  todosEnviados: any[] = [];

  user!: FormGroup;

  tzoffset = (new Date()).getTimezoneOffset() * 60000;

  userParamsUrl: string = '?tipoIngresso=avulso&nome=Carlos Miguel&dataNascimento=1985-12-31&localizador=95xcKo3&idBilhete=585645-78&dataCheckin=2023-04-04';

  toast!: Toast;
  toastError!: Toast;
  descToast!: string;
  descToastError!: string;
  photo: string = '';
  savePerson!: iPersonSave;
  startDateTime!: string;
  numBilhetes!: string[];
  userParams!: iUserparams;
  foto!: string | null;
  modal!: Modal;
  fotosutilizadores: any[] = [];
  comprovante!: iDocumento;
  utilizadoresObject!: any;
  errosArray: any[] = [];
  token!: string;
  noImage: string = '../../../assets/img/sem_imagem.png';

  constructor(
    private fb: FormBuilder,

    // TESTE
    private enviar: TokenGenerateService,
    // PRODUÇÂO
    private ticket: ApiTicketService,

    private route: ActivatedRoute,
    private el: ElementRef,
    private router: Router
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Define a hora para 00:00:00.000
    const localDateString = today.toISOString().split('T')[0];
    this.dataLimite = localDateString;
    this.startDateTime = today.toISOString().split('T')[0];
    this.form =this.fb.group({
      tipoIngresso: new FormControl('', Validators.required),
      nome: new FormControl('', Validators.required),
      dataNascimento: new FormControl('', Validators.required),
      localizador: new FormControl('', Validators.required),
      idBilhete: new FormControl('', Validators.required),
      dataCheckin: new FormControl('', Validators.required),
      cpf: new FormControl('', Validators.required),
      utilizadores: this.fb.array([])
    });
    this.utilizadoresObject = this.form.controls['utilizadores'].value;
    this.utilizadoresObject.dataCheckin = this.form.controls['dataCheckin'].value;
    document.body.style.overflow = 'hidden';
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.route.queryParams
      .subscribe((params) => {
        const token = params['token'];
        if (token) {
          this.token = token;
          this.decryptToken(token);
        }
      }
    )
    setTimeout(() => {
      this.toast = new Toast(this.toastDiv.nativeElement,
        {
          delay: 5000
        }  
      );
      console.log()
    }, 1500)
    // console.log(JSON.stringify(this.form.getRawValue()))
    setTimeout(() => {
    }, 2000)
  }

  decryptToken(token: string) {
    this.ticket.decryptToken(token)
    .subscribe({
      next: (response: iDefaultResponse) => {
        if (response.status === true) {
          this.userParams = response.dados as iUserparams;
          document.body.style.overflow = 'auto';
          let array = this.userParams.idBilhete.split(',');
          let validArray = []
          for (let a of array) {
            if (a !== '') {
              validArray.push(a)
            }
          }
          this.numBilhetes = validArray;
          this.form.patchValue({
            tipoIngresso: this.userParams.tipoIngresso,
            nome: this.userParams.nome,
            dataNascimento: this.userParams.dataNascimento,
            localizador: this.userParams.localizador,
            idBilhete: this.userParams.idBilhete.split(',')[0],
            dataCheckin: this.userParams.dataCheckin,
            cpf: this.userParams.cpf
          });
          this.dataVisita = new Date(this.form.controls['dataCheckin'].value)
          console.log(this.form.value)
          this.el.nativeElement.querySelectorAll('.read-only').forEach((element: any) => {
            element.setAttribute('disabled', '')
          });
          this.ticket.getToken()
          .subscribe({
            next: (response: string) => {
              this.ticket.token = response;
              this.checkExistingTicket();
            }
          })
        } else {
          this.startText = `A página não está mais disponível. Link expirado. 
            Em caso de dúvidas entre em contato com nossa central de atendimento através do telefone (85) 4012-3030, Whatsapp (85) 9.8171-7021.`;
        }
      },
      error: (error: any) => {
        this.startText = `A página não está mais disponível. Link expirado. 
          Em caso de dúvidas entre em contato com nossa central de atendimento através do telefone (85) 4012-3030, Whatsapp (85) 9.8171-7021.`;
        this.toast = new Toast(this.toastDiv.nativeElement);
        this.toast.hide();
        console.log(error);
        this.descToast = 'Falha no envio dos dados.';
        this.toast.show();
      }
    })
  }

  get utilizadores() {
    return <FormArray> this.form.get('utilizadores');
  }
  
  addUtilizadoresNovos() {
    for (let i = 0; i < (this.numBilhetes!.length); i++) {
      this.utilizadores.push(this.fb.group({
        nome: ['', Validators.required],
        dataNascimento: ['', this.dataNascimentoValidator()],
        cpf: [''],
        unikeId: [''],
        foto:  [''],
        fotoFile:  ['', Validators.required],
        dataCheckin:  [this.userParams.dataCheckin, Validators.required],
        localizador:  [this.userParams.localizador, Validators.required],
        idBilhete:  [this.numBilhetes[i], Validators.required],
        tipoIngresso:  [this.userParams.tipoIngresso, Validators.required],
        comprovanteResidencia: ['', Validators.required],
        comprovanteBase64: ['', Validators.required],
        validado: [false]
      }));
    }
  }

  addUtilizadores(tickets: iPartialTicketItem[]) {
    this.ticketsRecuperados = tickets;
    for (let i = 0; i < (this.confirmaEnviados!.length); i++) {
      // (<HTMLImageElement>document.querySelector(`#preview-${i}`)).src
        // const ticket = tickets![i];
        const ticket = tickets.find((p: any) => p.idBilhete === this.confirmaEnviados[i].idBilhete);
        const nomeValidators = ticket ? [] : [Validators.required];
        const dataNascimentoValidators = ticket ? [] : this.dataNascimentoValidator();
        
        const formGroup = this.fb.group({
          nome: [ticket ? ticket.nome : '', nomeValidators],
          dataNascimento: [ticket ? ticket.dataNascimento : '', dataNascimentoValidators],
          cpf: [ticket ? ticket.cpf : ''],
          foto: [ticket ? ticket.foto : ''],
          fotoFile: ['', Validators.required],
          dataCheckin: [this.userParams.dataCheckin, Validators.required],
          localizador: [this.userParams.localizador, Validators.required],
          idBilhete: [ticket ? ticket.idBilhete : this.confirmaEnviados[i].idBilhete, Validators.required],
          tipoIngresso: [this.userParams.tipoIngresso, Validators.required],
          comprovanteResidencia: ['', nomeValidators],
          comprovanteBase64: ['', nomeValidators],
          validado: [ticket ? true : false]
        });

        if (ticket) {
          formGroup.disable();
        }
    
        this.utilizadores.push(formGroup);
    }
  }

  dataNascimentoValidator() {
    const hoje = new Date();
    
    return Validators.compose([
      Validators.required,
      (control: FormControl) => {
        const dataNascimento = new Date(control.value);
        if (dataNascimento > hoje) {
          return { dataInvalida: true };
        }
        return null; // Data válida
      }
    ]);
  }

  isCpfRequired(controle: AbstractControl): boolean {
    const dataNascimento = controle.get('dataNascimento')?.value;
    if (dataNascimento) {
      const hoje = new Date();
      const nascimento = new Date(dataNascimento);
      const idade = hoje.getFullYear() - nascimento.getFullYear();
      const cpf = controle.get('cpf')?.value;
      const cpfValido = this.validateCpf(cpf)
      if (idade > 12 && !cpfValido) {
        controle.get('cpf')?.setErrors({ requiredCpf: true });
        return true;
      }
    }
    controle.get('cpf')?.setErrors(null);
    return false;
  }

  loadImage(i: number) {
    return 
  }

  checkExistingTicket() {
    const data: iChekTicket = {
      localizador: this.form.value.localizador,
      cpfTitular: this.form.value.cpf
    }
    this.ticket.checkPartialTicket(data)
    .subscribe({
      next: (response: any) => {
        this.confirmaEnviados = [];
          this.numBilhetes.forEach(b => {
            this.confirmaEnviados.push({
              idBilhete: b,
              finalizado: false
            })
          });
        const {status, message, dados} = response
        if (status === true) {
          if (dados.length > 0) {
            let array: string[] = []
            dados.forEach((d: any) => {
              array.push(d.idBilhete)
            });
            for (let c of this.confirmaEnviados) {
              // Verifique se o idBilhete do usuário está presente no array de tickets
              if (array.includes(c.idBilhete)) {
                // Se estiver presente, defina o valor "finalizado" como true
                c.finalizado = true;
              }
            }
            this.addUtilizadores(dados);
          } else {
            this.addUtilizadoresNovos();
          }
        } else {
          this.addUtilizadoresNovos();
        }
      }
    })
  }

  get utilizadoresTouched() {
    const utilizadoresArray = this.form.get('utilizadores') as FormArray;
    const utilizadoresTouched = [];
  
    for (let i = 0; i < utilizadoresArray.length; i++) {
      const utilizadorGroup = utilizadoresArray.at(i) as FormGroup;
  
      if (utilizadorGroup.touched) {
        utilizadoresTouched.push(utilizadorGroup.value);
      }
    }
  
    return utilizadoresTouched;
  }

  get utilizadoresValidos() { 
    const utilizadoresArray = this.form.get('utilizadores') as FormArray;
    const utilizadoresValidos = [];
  
    for (let i = 0; i < utilizadoresArray.length; i++) {
      const utilizadorGroup = utilizadoresArray.at(i) as FormGroup;
  
      if (utilizadorGroup.valid && utilizadorGroup.touched) {
        utilizadoresValidos.push(utilizadorGroup.value);
      }
    }
  
    return utilizadoresValidos;
  }

  validateCpfForm(control: FormControl): ValidationErrors | null {
    let strCPF = control.value
    if (!strCPF || strCPF === '') {
      return null; // Não há erro se o CPF não foi preenchido
    }
    let Soma;
    let Resto;
    Soma = 0;
    if (strCPF.length < 11) return { invalidCpf: true };
    if (strCPF === "00000000000") return { invalidCpf: true };
    if (strCPF === "11111111111") return { invalidCpf: true };
    if (strCPF === "99999999999") return { invalidCpf: true };
  
    for (let i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;
  
      if ((Resto === 10) || (Resto === 11))  Resto = 0;
      if (Resto != parseInt(strCPF.substring(9, 10)) ) return { invalidCpf: true };
  
    Soma = 0;
      for (let i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring( i-1, i)) * (12 - i);
      Resto = (Soma * 10) % 11;
  
      if ((Resto === 10) || (Resto === 11))  Resto = 0;
      if (Resto != parseInt(strCPF.substring(10, 11) ) ) return { invalidCpf: true };
      return null;
  }

  validateAgeForm(control: FormControl): ValidationErrors | null {
    const dataNascimento = control.parent?.get('dataNascimento')?.value
    if (!dataNascimento) {
      return null;
    }
    const hoje = new Date();
    const dataNasc = new Date(dataNascimento);
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mes = hoje.getMonth() - dataNasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
      idade--;
    }
    if (idade > 12 && control.value === '') {
      return { invalidCpf: true };
    } else {
      return null;
    }
  }

  checkInvalids() {
    const utilInvalidos = [];
    for (let [index, c] of (this.utilizadores as FormArray).controls.entries()) {
      let a: any = c;
      let b  = index;
      const campos = [];
      const innerControls = c as FormGroup;
      for (const i in innerControls.controls) {
        if (innerControls.controls[i].invalid) {
          campos.push(i); // Armazene informações sobre o controle inválido
        }
      }
      utilInvalidos.push({utilizador: index + 1, campos})
    }
    console.log(utilInvalidos)
    return utilInvalidos
  }

  conditionalRequired() {
    for (let c of this.utilizadores.value) {
      const index = this.utilizadores.value.indexOf(c);
      const isAbove = this.checkYears(c.dataNascimento);
      const elem = document.getElementById('dtNasc-' + index)
      const validate = this.validateCpf(c.cpf);
      if (isAbove === true && c.dataNascimento !== '' && validate === false) {
        this.utilizadores.at(parseInt(index)).get('cpf')?.setValidators(Validators.required);
        elem!.style.display = 'block';
      } else {
        this.utilizadores.at(parseInt(index)).get('cpf')?.removeValidators(Validators.required);
        elem!.style.display = 'none';
      }
      this.utilizadores.at(parseInt(index)).get('cpf')?.updateValueAndValidity();
    }
  }

  validateCpfFn(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let strCPF = control.value
      if (!strCPF || strCPF === '') {
        return null; // Não há erro se o CPF não foi preenchido
      }
      let Soma;
      let Resto;
      Soma = 0;
      if (strCPF.length < 11) return { invalidCpf: true };
      if (strCPF === "00000000000") return { invalidCpf: true };
      if (strCPF === "11111111111") return { invalidCpf: true };
      if (strCPF === "99999999999") return { invalidCpf: true };
    
      for (let i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
      Resto = (Soma * 10) % 11;
    
        if ((Resto === 10) || (Resto === 11))  Resto = 0;
        if (Resto != parseInt(strCPF.substring(9, 10)) ) return { invalidCpf: true };
    
      Soma = 0;
        for (let i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring( i-1, i)) * (12 - i);
        Resto = (Soma * 10) % 11;
    
        if ((Resto === 10) || (Resto === 11))  Resto = 0;
        if (Resto != parseInt(strCPF.substring(10, 11) ) ) return { invalidCpf: true };
        return null;
    };
  }

  validateAllCpf() {
    this.validCPFs = [];
    for (let [index, c] of (this.utilizadores as FormArray).controls.entries()) {
      if (c.get('cpf')?.value && c.get('cpf')?.value.length > 0) {
        this.validCPFs.push(this.validateCpf(c.get('cpf')?.value));
      }
    }
  }

  checkAge() {
    this.validDatas = [];
    for (let [index, c] of (this.utilizadores as FormArray).controls.entries()) {
      if (c.value.dataNascimento != null && c.value.dataNascimento != '' && c.value.dataNascimento != undefined) {
        if (c.get('dataNascimento')?.value && c.get('dataNascimento')?.value.length > 0 && c.get('cpf')?.value.length >= 11) {
          this.validDatas.push(this.checkYears(c.get('dataNascimento')?.value));
        }
      }
    }
  }

  checkPreviousCPF(e: any) {
    let cpf = e.target.value.replace(/\./g,'');
    let digitados = this.utilizadores.value;
    this.cpfDuplicado = false;
    this.cpfDuplicadoTodos = false;
    let cpfSet = [];
    cpfSet = this.utilizadores.value.filter((p: any) => p.cpf !== e && p.cpf !== '')
    // for (let element of this.utilizadores.value) {
    //   if (element.cpf !== '') {
    //     cpfSet.push(element.cpf);
    //   }
    // }
    let check = [];
    for (let r of this.ticketsRecuperados) {
      if (r.cpf !== '') {
        if (r.cpf === cpf) {
          check.push(true);
        } else {
          check.push(false);
        }
      }
    }
    for (let [index,element] of this.utilizadores.value.entries()) {
      if (cpfSet.includes(element.cpf) && index !== cpfSet.indexOf(element.cpf)) {
        check.push(true);
      } else {
        check.push(false);
      }
    }
    let count = check.reduce((accumulator, currentValue) => {
      if (currentValue === true) {
        return accumulator + 1;
      } else {
        return accumulator;
      }
    }, 0);
    if (count > 0) {
      this.cpfDuplicado = true;
      this.cpfDuplicadoTodos = true;
    } else {
      this.cpfDuplicado = false;
      this.cpfDuplicadoTodos = false;
    }
  }

  checkPreviousCPFOnSend() {
    let digitados = this.utilizadores.value;
    this.cpfDuplicado = false;
    this.cpfDuplicadoTodos = false;
    let cpfSet = [];
    let check = []
    // for (const element of this.utilizadores.value) {
    //   let filter = this.utilizadores.value.filter((p: any) => p.cpf !== element.cpf && p.cpf !== '')
    //   cpfSet.push(filter[0].cpf)
    //   // if (element.cpf !== '' && element.cpf !== undefined && element.cpf !== null) {
    //   //   cpfSet.push(element.cpf);
    //   // }
    // }
    for (let [index, obj] of this.utilizadores.value.entries()) {
      const cpf = obj.cpf;
      if (cpf && cpfSet[index]) {
        cpfSet.push(true); // Encontrou um valor repetido não vazio
      } else {
        cpfSet.push(false);
      }
   }
    for (let r of this.ticketsRecuperados) {
      for (let d of digitados) {
        if (r.cpf !== '') {
          if (r.cpf === d.cpf) {
            check.push(true);
           } else {
            check.push(false);
          }
        }
      }
    }
    for (let [index,element] of this.utilizadores.value.entries()) {
      if (cpfSet.includes(element.cpf) && index !== cpfSet.indexOf(element.cpf)) {
        check.push(true);
      } else {
        check.push(false);
      }
    }
    let count = check.reduce((accumulator, currentValue) => {
      if (currentValue === true) {
        return accumulator + 1;
      } else {
        return accumulator;
      }
    }, 0);
    if (count > 0) {
      this.cpfDuplicado = true;
      this.cpfDuplicadoTodos = true;
    } else {
      this.cpfDuplicado = false;
      this.cpfDuplicadoTodos = false;
    }
  }

  checkYears(dataNascimento: string) {
    if (!dataNascimento) {
      return false;
    }
    const hoje = new Date();
    const dataNasc = new Date(dataNascimento);
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mes = hoje.getMonth() - dataNasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
      idade--;
    }
    return idade > 12;
  }

  checkYearsValidatorFn(): ValidatorFn  {
    return (control: AbstractControl): ValidationErrors | null => {
      const dataNascimento = control.value;

      if (!dataNascimento) {
        return null; // Não há erro se o CPF não foi preenchido
      }
      const hoje = new Date();
      const dataNasc = new Date(dataNascimento);
      let idade = hoje.getFullYear() - dataNasc.getFullYear();
      const mes = hoje.getMonth() - dataNasc.getMonth();
      if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
        idade--;
      }
      idade > 12;

      if (idade > 12) {
        return { invalidCpf: true }; // CPF inválido
      }
        return null; // CPF válido
    };
  }

  checkCPFDuplic() {
    let cpfs: string[] = []
    let hasDuplicateCPF = false
    for (let [index, dado] of (this.utilizadores as FormArray).controls.entries()) {
      const cpf = dado.value.cpf

      if (cpfs.includes(cpf) && cpf != '') {
        // CPF duplicado encontrado
        hasDuplicateCPF = true;
        break;
      }
      if (cpf != ''){
        cpfs.push(cpf);
      }
    }

    return hasDuplicateCPF
  }

  saveDocument(event: any, index: number) {
    const fileUpload: any = event.target?.files[0];
    if (fileUpload) {
      if (fileUpload.type.includes('video')) {
        this.utilizadores.at(index).get('comprovanteResidencia')?.setValue('');
        this.utilizadores.at(index).get('comprovanteBase64')?.setValue('');
        this.descToast = `Arquivos de vídeo não são permitidos. Por favor, tire uma foto de um comprovante de endereço ou anexe um arquivo ou foto.`
        this.toast.show();
      } else {
        var reader = new FileReader();
        console.log("filesUpload OK");
        reader.onload = (event: any) => {
          this.toBase64(index, event.target.result)
        }
        reader.readAsDataURL(fileUpload);
      }
    }
   
  }


  removeutilizadores(index: number) {
    this.utilizadores.removeAt(index);
    console.log(this.utilizadores.value);
  }

  toBase64(index: number, base64: string) {
    const filePath = this.utilizadores.at(index).get('comprovanteResidencia')?.value;
    const cpf = ( this.utilizadores.at(index).get('cpf')?.value == "" ? this.utilizadores.at(index).get('idBilhete')?.value : this.utilizadores.at(index).get('cpf')?.value ) 
    const fileExtension = filePath.substring(filePath.lastIndexOf('.') );

    this.utilizadores.at(index).get('comprovanteBase64')!.patchValue({
      key: cpf + '-' + this.utilizadores.at(index).get('localizador')?.value + '-' + new Date().getTime() + fileExtension,
      representacaoArquivo: base64
    })
  }

  getPhoto(img: any, tipo: string, id?: number) {
    // this.utilizadores.at(id!).get('foto')?.setValue(img.string);
    this.utilizadores.at(id!).get('unikeId')?.setValue('');
    this.utilizadores.at(id!).get('fotoFile')?.setValue(img.file);
    this.getPreviewImage(img.file, id!)
  }

  getInvalidCampos(formulario: AbstractControl): string[] {
    const camposInvalidos: string[] = [];
    if (formulario instanceof FormGroup) {
      for (const nomeCampo in formulario.controls) {
        if (formulario.controls[nomeCampo].invalid) {;
          if (nomeCampo === 'foto') {
            camposInvalidos.push('Foto')
          } else if (nomeCampo === 'comprovanteResidencia') {
            camposInvalidos.push('Comprovante de Residência')
          } else if (nomeCampo === 'comprovanteBase64') {
            camposInvalidos.push('Comprovante de Residência')
          } else if (nomeCampo === 'fotoFile') {
            camposInvalidos.push('Foto')
          } else if (nomeCampo === 'dataNascimento') {
            camposInvalidos.push('Data de Nascimento')  
          } else if (nomeCampo === 'cpf') {
            camposInvalidos.push('CPF')  
          } else {
            camposInvalidos.push(nomeCampo);
          }
        }
      }
    }
    const uniqueSet = new Set(camposInvalidos);
    const uniqueArray = Array.from(uniqueSet)
    this.errosArray = uniqueArray
    return uniqueArray;
  }

  // async photosutilizadores() {
  //   for await (let d of this.utilizadores.value) {
  //     this.sendUtilizadoresTicket(d)
  //   }
  // }

  // checkErrors(user: AbstractControl) {
  //   let field = '';
  //   if (user instanceof FormGroup) {
  //     for (const nomeCampo in user.controls) {
  //       if (user.controls.hasOwnProperty(nomeCampo)) {
  //         const controle = user.controls[nomeCampo];
  //         if (controle.valid) {
  //           console.log(`Campo ${nomeCampo} é válido.`);
  //         } else {
  //           console.log(`Campo ${nomeCampo} não é válido.`);
  //           if (user?.invalid) {
  //             if (this.el.nativeElement.querySelector("[for=" + nomeCampo + "]")) {
  //               field = this.el.nativeElement.querySelector("[for=" + nomeCampo + "]").innerText;
  //               this.errosArray.push(field.replace(' *',''))
  //             }
  //             if (nomeCampo === 'foto') {
  //               this.errosArray.push('Foto')
  //             }
  //             if (nomeCampo === 'comprovanteResidencia') {
  //               this.errosArray.push('Comprovante de Residência')
  //             }
  //             if (nomeCampo === 'fotoFile') {
  //               this.errosArray.push('Foto')
  //             }
  //             console.log(`Campo ${field !== '' ? field : nomeCampo} inválido do Utilizador ${b + 1}`);
  //             // this.warningMessage = `Há campos inválidos: ${Array.from(new Set(this.errosArray)).join(', ')}. Para maiores de 12 anos, o CPF também é obrigatório.`
  //             this.el.nativeElement.querySelector("#error-" + user + "").style.display = 'block'
  //             this.el.nativeElement.querySelector("#error-" + user + "").innerText = `Há campos inválidos: ${Array.from(new Set(this.errosArray)).join(', ')}. Para maiores de 12 anos, o CPF também é obrigatório.`
  //             setTimeout(() => {
  //               // this.warningMessage = '';
  //               this.el.nativeElement.querySelector("#error-" + user + "").style.display = 'none'
  //             }, 20000)
              
  //             // this.warningMessage = `Campos obrigatórios faltando no utilizador ${userIndex + 1}. Por favor, preencha-os: ${Array.from(new Set(this.errosArray)).join('; ')}.`
  //           }
  //         }
  //       }
  //     }
  //   } else if (user instanceof FormArray) {
  //     // Iterar sobre os controles dentro do FormArray
  //     for (const controle of user.controls) {
  //       if (controle.valid) {
  //         console.log(`Controle no FormArray é válido.`);
  //       } else {
  //         console.log(`Controle no FormArray não é válido.`);
  //       }
  //     }
  //   }
  //   this.errosArray = [];
  //   console.log(this.form.value);
  //   if (userIndex) {
  //     this.el.nativeElement.querySelector("#error-" + userIndex + "").innerText = '';
  //   }
  //   // this.el.nativeElement.querySelector("#errorTodos").innerText = '';
  //   for (let [index, c] of (this.utilizadores as FormArray).controls.entries()) {
  //     let a: any = c;
  //     let b  = index;
  //     if (a.invalid) {
  //       Object.keys(a.controls).forEach(key => {
  //         const innerControl = c.get(key);
  //         if (userIndex >= 0) {
  //           if (innerControl?.invalid) {
  //             if (this.el.nativeElement.querySelector("[for=" + key + "]")) {
  //               field = this.el.nativeElement.querySelector("[for=" + key + "]").innerText;
  //               this.errosArray.push(field.replace(' *',''))
  //             }
  //             if (key === 'foto') {
  //               this.errosArray.push('Foto')
  //             }
  //             if (key === 'comprovanteResidencia') {
  //               this.errosArray.push('Comprovante de Residência')
  //             }
  //             if (key === 'fotoFile') {
  //               this.errosArray.push('Foto')
  //             }
  //             console.log(`Campo ${field !== '' ? field : key} inválido do Utilizador ${b + 1}`);
  //             if (userIndex >= 0) {
  //               if (b === userIndex) {
  //                 // this.warningMessage = `Há campos inválidos: ${Array.from(new Set(this.errosArray)).join(', ')}. Para maiores de 12 anos, o CPF também é obrigatório.`
  //                 this.el.nativeElement.querySelector("#error-" + userIndex + "").style.display = 'block'
  //                 this.el.nativeElement.querySelector("#error-" + userIndex + "").innerText = `Há campos inválidos: ${Array.from(new Set(this.errosArray)).join(', ')}. Para maiores de 12 anos, o CPF também é obrigatório.`
  //                 setTimeout(() => {
  //                   // this.warningMessage = '';
  //                   this.el.nativeElement.querySelector("#error-" + userIndex + "").style.display = 'none'
  //                 }, 20000)
  //               }
  //             }
              
  //             // this.warningMessage = `Campos obrigatórios faltando no utilizador ${userIndex + 1}. Por favor, preencha-os: ${Array.from(new Set(this.errosArray)).join('; ')}.`
  //           }
  //         } else {
  //           if (innerControl?.invalid) {
  //             let field = '';
  //             if (this.el.nativeElement.querySelector("[for=" + key + "]")) {
  //               field = this.el.nativeElement.querySelector("[for=" + key + "]").innerText;
  //               this.errosArray.push(field.replace(' *',''))
  //             }
  //             if (key === 'foto') {
  //               this.errosArray.push('Foto')
  //             }
  //             if (key === 'comprovanteResidencia') {
  //               this.errosArray.push('Comprovante de Residência')
  //             }
  //             console.log(`Campo ${field !== '' ? field : key} inválido do Utilizador ${b + 1}`);
  //             this.warningMessage = `Há campos inválidos: ${Array.from(new Set(this.errosArray)).join(', ')}. Para maiores de 12 anos, o CPF também é obrigatório.`
  //             // this.el.nativeElement.querySelector("#errorTodos").style.display = 'block';
  //             setTimeout(() => {
  //               this.warningMessage = '';
  //               // this.el.nativeElement.querySelector("#errorTodos").style.display = 'none';
  //               // this.el.nativeElement.querySelector("#errorTodos").innerText = '';
  //               field = '';
  //             }, 20000)
                        
  //             // this.warningMessage = `Campos obrigatórios faltando no utilizador ${userIndex + 1}. Por favor, preencha-os: ${Array.from(new Set(this.errosArray)).join('; ')}.`
              
  //           }
  //         }
          
  //       });
  //     }
  //   }this.confirmaEnvioUnico
  // }

  scrollToInvalid() {
    for (let [index, c] of (this.utilizadores as FormArray).controls.entries()) {
      let a: any = c
      let b  = index;
     
    }
  }

  confirmarEnvioUnico(confirm: boolean) {
    this.confirmaEnvioUnico = confirm
    if (confirm === true) {
      this.modal.hide();
      this.startRequests();
    } else {
      this.modal.hide();
    }
  }

  async enviarCada(data?: any) {
    let enviados = []
    for (let [index, c] of (this.utilizadores as FormArray).controls.entries()) {
      let enviar = await this.startRequests(data);
      enviados.push(enviar)
    }
  }

  onlyUnique(value: any, index: any, array: any) {
    return array.indexOf(value) === index;
  }

  revalidarTickets(data: any, foto?: boolean) {
    if (foto) {
      this.ticket.ticketRevalidation(data)
      .subscribe({
        next: (resposta: any) => {
          if (resposta.status === true) {
            const revalidar = this.utilizadoresSend;
            this.toast.show();
            this.loadingText = `Ingresso de ${data.nome} pendente de validação. Esta página será recarregada para que você reinicie o processo dos ingressos inválidos.`
            // setTimeout(() => {
            //   window.location.reload(); 
            // }, 5000) 
          } else {
            this.loading = false;
            this.loadingText = `Ingresso de ${data.nome} pendente de validação. Esta página será recarregada para que você reinicie o processo dos ingressos inválidos.`
            this.descToast = `Ingresso de ${data.nome} pendente de validação. Tire uma nova foto e tente novamente.`;
            this.toast.show();
            // this.form.reset();
            // this.photo = '';
            // setTimeout(() => {
            //   window.location.reload();
            // }, 5000) 
          }
        },
        error: (err: any) => {
          if (err) {
            this.loadingText = `Falha revalidar ingresso de ${data.nome}. Esta página será recarregada em 5 segundos. Caso seu token ou ingresso esteja inválido, entre em contato com nossa equipe.`
            this.form.reset();
            this.photo = '';
            setTimeout(() => {
              window.location.reload();
            }, 5000) 
          }
        }
      })
    } else {
      this.ticket.ticketRevalidation(data)
      .subscribe({
        next: (resposta: any) => {
          if (resposta.status === true) {
            this.loadingText = `Ingresso de ${data.nome} pendente de validação.`
            setTimeout(() => {
              this.loading = false;
              this.toast.show();
            }, 3000) 
          } else {
            this.loadingText = `Ingresso de ${data.nome} pendente de validação.`
            setTimeout(() => {
              this.loading = false;
              this.toast.show();
            }, 3000) 
          }
        },
        error: (err: any) => {
          if (err) {
            this.loadingText = `Falha revalidar ingresso de ${data.nome}. Esta página será recarregada em 10 segundos. Caso seu token ou ingresso esteja inválido, entre em contato com nossa equipe.`
            this.photo = '';
            setTimeout(() => {
              window.location.reload();
            }, 5000) 
          }
        }
      })
    }
    
  }

  validateCpf(strCPF: string) {
    let Soma;
    let Resto;
    Soma = 0;
    if (strCPF.length < 11) return false;
    if (strCPF === "00000000000") return false;
    if (strCPF === "11111111111") return false;
    if (strCPF === "99999999999") return false;
  
    for (let i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;
  
      if ((Resto === 10) || (Resto === 11))  Resto = 0;
      if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;
  
    Soma = 0;
      for (let i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring( i-1, i)) * (12 - i);
      Resto = (Soma * 10) % 11;
  
      if ((Resto === 10) || (Resto === 11))  Resto = 0;
      if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
      return true;
  
  }

  inputFile(index: number) {
    this.el.nativeElement.querySelector('#comprovante-' + index).click();
  }

  mediaPermission(e: boolean) {
    this.permissionGranted = e;
  }

  // Foto para base64 legado
  // async insertBase64toUsers() {
  //   for (let [index, c] of (this.utilizadores as FormArray).controls.entries()) {
  //     let a: any = c
  //     let b  = index;
  //     for (let key of Object.keys(a.controls)) {
  //       if (key === 'foto') {
  //         const file = c.get('fotoFile')?.value;
  //         if (file) {
  //           const base64 = await this.fileToBase64(file);
  //          c.get(key)?.setValue(base64);
  //         }
  //         else {
  //           c.get(key)?.setValue('');
  //         }
  //       }
  //     }
  //   }

  obterValorCampo(formulario: FormGroup, campo: string): any {
    const rawValue = formulario.getRawValue();
    return rawValue[campo];
  }
  
  async insertBase64toUsers(utilizadoresValidos: any) {

    if (utilizadoresValidos.length > 0) {
      for (let index = 0; index < utilizadoresValidos.length; index++) {
        const utilizador = utilizadoresValidos[index];
        for (let key of Object.keys(utilizador)) {
          if (key === 'foto') {
            const file = utilizador.fotoFile;
            if (file) {
              const base64 = await this.fileToBase64(file);
              utilizador.foto = base64;
            } else {
              utilizador.foto = '';
            }
          }
        }
      }
      this.validosParaEnvio = utilizadoresValidos;
    } else {
      return
    }
  }

  removeBase64toUsers() {
    for (let [index, c] of (this.utilizadores as FormArray).controls.entries()) {
      let a: any = c
      let b  = index;
      for (let key of Object.keys(a.controls)) {
        if (key === 'foto') {
          c.get(key)?.setValue('');
        }
      }
    }
  }

  async getPreviewImage(file: File, id: number) {
    const idPreview = `#preview-${id}`
    const elem = this.el.nativeElement.querySelector(idPreview)
    let string = await this.fileToBase64(file) as string;
    elem.src = 'data:image/jpeg;base64,'+ string;
  }

  async fileToBase64(file: File) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((<string>reader.result).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }


  validateNascForm(control: FormControl): ValidationErrors | null {
    const dataNascimento = control.value;

    if (!dataNascimento) {
      return null; // Não há erro se o CPF não foi preenchido
    }
    const hoje = new Date();
    const dataNasc = new Date(dataNascimento);
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mes = hoje.getMonth() - dataNasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
      idade--;
    }
    idade > 12;

    if (idade > 12) {
      return { invalidCpf: true }; // CPF inválido
    }
      return null; // CPF válido
  }

  async startRequests(idBilhete?: string) {
    this.checkPreviousCPFOnSend();
    let utilizadorEnvioUnico!: AbstractControl;
    const stopProcess$ = new Subject();
    if (this.cpfDuplicado === true) {
      return
    }
    // this.validateAllCpf();
    // this.checkAge();
    if (idBilhete) {
      for (const controle of this.utilizadores.controls) {
        if (controle.get('idBilhete')?.value === idBilhete) {
          // Você encontrou o controle com o idBilhete igual a '123'
          utilizadorEnvioUnico = controle; // Aqui está o formulário que você estava procurando
          break; // Você pode parar o loop, já que encontrou o que estava procurando
        }
      }
    }
    if (this.validDatas.includes(true) && this.validCPFs.includes(false)) {
      this.descToast = `Existem utilizadores maiores de 12 anos. Por favor, verifique se o CPF referente está inválido ou vazio.`;
      this.toast.show();
      return
    }
    if (this.validCPFs.includes(false)) {
      this.descToast = `Existem CPF com valor inválido. Por favor, verifique se estão digitados corretamente.`;
      this.toast.show();
      return
    }

    if ( this.checkCPFDuplic() ) {
      this.descToast = `Existem CPFs duplicados no formulário. Por favor, verifique os valores inseridos.`;
      this.toast.show();
      return;
    }

    // Verificação de CPF Duplicado
    const utilizadoresValidos = this.utilizadoresValidos;
    const utilizadoresTouched = this.utilizadoresTouched;
    if (idBilhete) {
      if (utilizadorEnvioUnico.invalid) {
        return
      }
    }

    if (utilizadoresValidos.length > 0 &&(utilizadoresValidos.length < utilizadoresTouched.length) && !idBilhete && this.confirmaEnvioUnico === false) {
      this.modal = new Modal(this.confirmModal.nativeElement);
      this.modal.show();
      return
    }

    if (utilizadoresValidos.length === 0) {
      return
    } else {
      await this.insertBase64toUsers(utilizadoresValidos);
      this.success = true;
      this.warningMessage = '';
      let utilizadoresElem: any;
      this.utilizadoresEnvio = [];
      this.loading = true;
      this.envioUnico = [];
      if (idBilhete) {
        let index = this.utilizadores.value.indexOf(this.utilizadores.value.find((p: any) => p.idBilhete === idBilhete))
        this.envioUnico.push(utilizadorEnvioUnico.value)
        this.loadingText = 'Iniciando envio dos dados do seu ingresso.'
      } else {
        this.envioUnico = this.validosParaEnvio;
        this.loadingText = 'Iniciando envio dos dados dos seus ingressos.'
      }
      this.aEnviarQtd = this.envioUnico.length;
      console.log(this.aEnviarQtd);
      from(this.envioUnico)
      .pipe(
        concatMap(elem => {
          (elem as any).token = this.token;
          console.log(this.utilizadores.value);
          let currentDataItem = elem;
          return this.makeRequest(elem).pipe(
            catchError(error => {
              console.error('Erro na requisição:', error);
              // Chamar a função para interromper o processo passando o currentDataItem
              this.stopProcess(currentDataItem);
              return of(null); // Emitir um valor nulo para indicar que o processo deve ser interrompido
            }),
            takeUntil(stopProcess$) // Interromper o fluxo quando o Observable stopProcess$ emitir
          );
        }),
      )
      .subscribe({
        next: (resultado: any) => {
          this.success = true;
          if (this.aEnviarQtd === 0) {
            console.log('env ' + this.contarEnviados)
            console.log('sub ' + (this.utilizadores.length - this.ticketsRecuperados.length - this.checkEnviados.length))
            if (this.aEnviarQtd === (this.utilizadores.length - this.ticketsRecuperados.length - this.checkEnviados.length)) {
              this.loadingText = 'Todos os seus ingressos foram validados com sucesso. Obrigado!'
              setTimeout(() => {
                this.router.navigate(['sucesso']);
              }, 2000) 
            } else {
              this.loadingText = `${this.contarEnviados} ingressos enviados com sucesso.`
              this.loading = false
            }
          } else {
            this.loadingText = `${this.contarEnviados} ingressos enviados com sucesso.`
          }
        }
      });
    }
  }

  // Envio em cascata por ingresso
  makeRequest(dataItem: any) {
    let ignoreError = false
    // Fazer a primeira requisição HTTP usando o HttpClient
    return this.ticket.photoIdentity(dataItem).pipe(
      concatMap((responseA: any) => {
        this.success = true;
        dataItem.unikeId = '';
        this.loadingText = `Iniciando processamento do ingresso de ${dataItem.nome}.`
        this.descToast = `Iniciando processamento do ingresso de ${dataItem.nome}.`;
        if (responseA.status === true && responseA.photo === false) {
          this.utilizadoresEnvio.push(dataItem);
          this.loadingText = `Verificação da foto de ${dataItem.nome} enviados com sucesso.`
          this.descToast = `Verificação da foto de ${dataItem.nome} enviados com sucesso.`;
          this.toast.show();
        } else if (responseA.status === true && responseA.photo === true) {
          dataItem.unikeId = responseA.data[0].id;
          dataItem.oldData = responseA.data[0];
          if (this.checkPhoteDuplic(dataItem) === false) {
            this.utilizadoresEnvio.push(dataItem)
          } else {
            this.loading = false;
            this.confirmaEnvioUnico = false;
            this.success = false;
            this.descToast = `Ops... Face está duplicada (${dataItem.nome}). Verifique se a imagem não foi utilizada em outro ingresso, possui um rosto ou se a mesma possui qualidade e iluminação suficientes`;
            this.toast.show();
            console.log(`Ops... Face está duplicada (${dataItem.nome}). Verifique se a imagem não foi utilizada em outro ingresso, possui um rosto ou se a mesma possui qualidade e iluminação suficientes`);
            this.stopProcess(dataItem, responseA)
            return EMPTY
          }
        }  else if (responseA.status === false && responseA.photo === true) {
          this.loading = false;
          this.success = false;
          this.confirmaEnvioUnico = false;
          this.descToast = `Ops... Face está em um ingresso pendente . (${dataItem.nome}).`;
          this.toast.show();
          console.log(`Ops... Face está em um ingresso pendente. (${dataItem.nome}).`);
        }
        // Fazer a segunda requisição HTTP usando o HttpClient
        return this.ticket.enviarDados(dataItem)
        .pipe(
          catchError(error => {
            if (error.status === 409) {
              // this.loading = false;
              this.success = false;
              this.toast.hide();
              console.log(error);
              this.descToast = 'Foto duplicada. Por favor, cadastre uma foto diferente para cada ingresso.';
              this.toast.show();
              this.stopProcess(dataItem)
              return EMPTY; // retorna um observable vazio para finalizar o fluxo
            } else {
              this.loading = false;
              this.success = false;
              this.toast.hide();
              console.log(error);
              this.descToast = error.description ? error.description : 'Falha no reconhecimento da imagem. Por favor, tire outra foto e envie novamente.';
              this.toast.show();
              this.stopProcess(dataItem)
              return EMPTY; // retorna um observable vazio para finalizar o fluxo
            }
          })
        );
      }),
      concatMap((responseB: any) => {
        this.success = true;
        dataItem.unikeId = responseB.photo
        this.loadingText = `Enviando comprovante e fotos de ${dataItem.nome}.`
        // Fazer a terceira requisição HTTP usando o HttpClient
        return this.ticket.enviarDocumento(dataItem.comprovanteBase64)
        .pipe(
          catchError(error => {
            if (error.status === 401) {
              this.descToast = error.statusText;
              this.loading = false;
              this.success = false;
              this.descToast = `Ops... Falha ao enviar o documento do (${dataItem.nome}). Verifique se anexo um documento valido PDF, JPEG ou PNG`;
              this.toast.show();
              this.stopProcess(dataItem)
              return EMPTY;
            }
            if (error.message === 'false') {
              console.error('Tempo limite atingido na terceira requisição:', error);
              this.loading = false;
              this.success = false;
              this.descToast = `Ops... Falha ao enviar o documento do (${dataItem.nome}). Verifique se anexo um documento valido PDF, JPEG ou PNG`;
              this.toast.show();
              this.stopProcess(dataItem)
              return EMPTY;
            }
            this.confirmaEnviados.forEach((a: any) => {
              if (a.idBilhete === dataItem.idBilhete) {
                a.finalizado = false
              }
            })
            this.loading = false;
            this.success = false;
            this.descToast = `Ops... Falha ao enviar o documento do (${dataItem.nome}). Verifique se anexo um documento valido PDF, JPEG ou PNG`;
            this.toast.show();
            console.log(error);
            this.stopProcess(dataItem)
            return EMPTY; // retorna um observable vazio para finalizar o fluxo
          })
        )
      }),
      concatMap((responseD: any) => {
        this.success = true;
        this.loadingText = `Comprovante e fotos de ${dataItem.nome} enviados com sucesso.`
        // Fazer a quinta requisição HTTP usando o HttpClient
        dataItem.cpfTitular = this.form.value.cpf;
        dataItem.dataNascimentoTitular = this.form.value.dataNascimento;
        dataItem.idBilheteTitular = this.form.value.idBilhete;
        dataItem.nomeTitular = this.form.value.nome;
        dataItem.token = this.token;
        return this.ticket.savePartialTicket(dataItem)
        .pipe(
          catchError(error => {
            console.error('Tempo limite atingido na terceira requisição:', error);
            this.descToast = `Falha ao salvar o ticket de ${dataItem.nome}, localizador ${dataItem.localizador}`;
            this.toast.show();
            this.stopProcess(dataItem)
            return EMPTY;
          }),
        )
      }),
      concatMap((responseC: any) => {
        if (responseC.status === true) {
          this.aEnviarQtd--;
          this.contarEnviados++
          this.checkEnviados.push(dataItem.idBilhete);
          this.loadingText = `Ingresso de ${dataItem.nome} registrado.`
          this.validarForm(dataItem)
          if (this.aEnviarQtd === 0) {
            if (this.aEnviarQtd === (this.utilizadores.length - this.ticketsRecuperados.length - this.checkEnviados.length)) {
              return this.ticket.ticketValidation({
                localizador: dataItem.localizador,
                token: this.token
              })
              .pipe(
                catchError(error => {
                  // this.confirmaEnviados.forEach((a: any) => {
                  //   if (a.idBilhete === dataItem.idBilhete) {
                  //     a.finalizado = false
                  //   }
                  // })
                  // this.loading = false;
                  // this.success = false;
                  // this.toast.hide();
                  // console.log(error);
                  // this.descToast = `Falha na atualização do ticket de ${dataItem.nome}, localizador ${dataItem.localizador}`;
                  // this.toast.show();
                  // this.stopProcess(dataItem);
                  ignoreError = true;
                  return of('Seguir o fluxo.');
                })
              );
            } else {
              return of('Seguir o fluxo.');
            }
          } else {
            return of('Seguir o fluxo.')
          }
        } else {
          this.stopProcess(dataItem)
          return EMPTY
        }
      }),
    )
    .pipe(
      catchError(error => {
        if (ignoreError === false) {
          this.loading = false;
          this.success = false;
          this.descToast = `Ops... Selfie não foi aceita (${dataItem.nome}). Verifique se a imagem possui um rosto ou se a mesma possui qualidade e iluminação suficientes`;
          this.toast.show();
          console.log(error);
          this.stopProcess(dataItem, error)
          return EMPTY; // retorna um observable vazio para finalizar o fluxo
        } else {
          return of('Seguir o fluxo.')
        }
      })
    )
  }

  checkPhoteDuplic(dados: any) {
    let listId: string[] = []
    let newId = dados.unikeId
    let hasDuplicatePhoto = false

    for (let dado in this.envioUnico) {
      let id = this.envioUnico[dado]?.unikeId
      let idBilhete = this.envioUnico[dado]?.idBilhete

      if (id != '' && id != undefined && idBilhete != dados.idBilhete){
        listId.push(id);
      }
    }

    for (let dado in this.todosEnviados) {
      let id = this.todosEnviados[dado]?.unikeId
      let idBilhete = this.todosEnviados[dado]?.idBilhete

      if (id != '' && id != undefined && idBilhete != dados.idBilhete){
        listId.push(id);
      }
    }

    for (let dado in this.ticketsRecuperados) {
      let id = this.ticketsRecuperados[dado]?.unikeId
      let localizador = this.ticketsRecuperados[dado]?.localizador

      if (id != '' && id != undefined && localizador == dados.localizador){
        listId.push(id);
      }
    }

    if (listId.includes(newId)) {
      // ID Photo ja existe
      hasDuplicatePhoto = true;
    }

    return hasDuplicatePhoto
  }

  validarForm(dataItem: any) {
    this.todosEnviados.push(dataItem);
    // this.utilizadores.value.find((p: any) => p.idBilhete === dataItem.idBilhete).disabled
    // this.utilizadores.value.find((p: any) => p.idBilhete === dataItem.idBilhete).disable
    this.loadingText = `Finalizando validação do ingresso de ${dataItem.nome}. Por favor, aguarde.`
    const formGroup = this.utilizadores.controls.find((p: any) => p.get('idBilhete').value === dataItem.idBilhete);
      Object.keys(formGroup?.value).forEach(controlName => {
        const control = formGroup?.get(controlName);
        if (control) {
          control.disable();
        }
    });
    let validado = document.getElementById('validado-' + dataItem.idBilhete);
    let btnFile = document.getElementById('btnFile-' + dataItem.idBilhete);
    let fotoDiv = document.getElementById('foto-' + dataItem.idBilhete);
    let btnGroup = document.getElementById('btnGroup-' + dataItem.idBilhete);
    let btnEnviar = document.getElementById('btnEnviar-' + dataItem.idBilhete);
    if (validado) {
      validado.style.display = 'block'
    }
    if (btnFile) {
      btnFile.style.display = 'none'
    }
    if (fotoDiv) {
      fotoDiv.style.display = 'none'
    }
    if (btnGroup) {
      btnGroup.style.display = 'none'
    }
    if (btnEnviar) {
      btnEnviar.style.display = 'none'
    }
  }

  stopProcess(dataItem: any, error?: any) {
    if (error) {
      this.success = false;
      this.descToast = `Falha interna na validação do ingresso de (${dataItem.nome}). ${error.error ? error.error.message : (error.message ? error.message : '')}`;
      this.toast.show();
      console.log('Função para interromper o processo chamada');
      // this.revalidarTickets(dataItem)
    } else {
      this.success = false;
      this.descToast = `Falha interna na validação do ingresso de (${dataItem.nome}).`;
      this.toast.show();
      console.log('Função para interromper o processo chamada');
      // this.revalidarTickets(dataItem)
    }
    
  }
}
