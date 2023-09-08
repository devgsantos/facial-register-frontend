import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, take, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';
import { iJokerList, iLogin, iPersonSave, iUserparams } from '../interfaces/default.interface';
import { endpoints } from '../utils/endpoints';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})

// Este serviço envia diretamente para a API de teste em cloud.
// Para produção utilizar o api-ticket-service
export class TokenGenerateService {

  request: iLogin = {
    username : "user",
    password: "@password"
  }

  token!: string;
  dadosTitular = new BehaviorSubject<iUserparams>({
    dataCheckin: '',
    dataNascimento: '',
    idBilhete: '',
    localizador: '',
    nome: '',
    tipoIngresso: '',
    cpf: ''
  });
  foto!: string;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getToken(): Observable<string> {
    return this.http.post(environment.api + endpoints.login, this.request, {responseType: 'text'})
    .pipe(
      take(3),
      timeout(10000),
      catchError(
        error => this.errorHandler.handleError(error)
      )
    )
  }

  enviarDados(token: string, request: iJokerList): Observable<any> {
    const _headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    })
    return this.http.post(environment.api + endpoints.personSave, request, { headers: _headers })
    .pipe(
      take(3),
      timeout(10000),
      catchError(
        error => this.errorHandler.handleError(error)
      )
    )
  }
}
