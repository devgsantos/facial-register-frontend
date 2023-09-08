import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { endpoints, endpointsTicket } from '../utils/endpoints';
import { Observable, catchError, take, timeout } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';
import { iChekTicket, iDefaultResponse, iDocumento, iTicket, iUserparams } from '../interfaces/default.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiTicketService {

  request = {
    user: "gilson",
    password: "123"
  }

  token!: string;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getToken() {
    return this.http.post(environment.api_ticket + endpointsTicket.token, this.request, { responseType: "text"})
    .pipe(
      take(3),
      catchError(
        error => this.errorHandler.handleError(error)
      )
    )
  }

  enviarDados(request: any) {
    const _headers = new HttpHeaders({
      'x-access-token': this.token
    })
    return this.http.post(environment.api_ticket + endpointsTicket.ticket, request, { headers: _headers })
    .pipe(
      take(3),
      catchError(
        error => this.errorHandler.handleError(error)
      )
    )
  }

  enviarDocumento(request: any) {
    const _headers = new HttpHeaders({
      'x-access-token': this.token
    })
    return this.http.post(environment.api_ticket + endpointsTicket.document, request, { headers: _headers })
    .pipe(
      take(3),
      catchError(
        error => this.errorHandler.handleError(error)
      )
    )
  }

  decryptToken(token: string): Observable<iDefaultResponse> {
    return this.http.post<iDefaultResponse>(environment.api_ticket + endpointsTicket.decryptToken, { token: token })
    .pipe(
      take(3),
      catchError(
        error => this.errorHandler.handleError(error)
      )
    )
  }

  //Setado como "any", pois estava chegando o this.dependentes[elem] como "unknown" e quebrando a aplicação.
  photoIdentity(user: any) {
    const _headers = new HttpHeaders({
      'x-access-token': this.token
    })
    let request = {
      localizador: user.localizador,
      photo: user.foto
    }
    return this.http.post(environment.api_ticket + endpointsTicket.photoIdentify, request, { headers: _headers })
    .pipe(
      take(3),
      catchError(
        error => this.errorHandler.handleError(error)
      )
    )
  }

  ticketValidation(request: any) {
    const _headers = new HttpHeaders({
      'x-access-token': this.token
    })
    return this.http.post(environment.api_ticket + endpointsTicket.ticketValidation, request, { headers: _headers })
    .pipe(
      take(3),
      catchError(
        error => this.errorHandler.handleError(error)
      )
    )
  }

  savePartialTicket(request: iTicket) {
    const _headers = new HttpHeaders({
      'x-access-token': this.token
    })
    return this.http.post(environment.api_ticket + endpointsTicket.savePartialTicket, request, { headers: _headers })
    .pipe(
      take(3),
      catchError(
        error => this.errorHandler.handleError(error)
      )
    )
  }

  ticketRevalidation(request: iTicket) {
    const _headers = new HttpHeaders({
      'x-access-token': this.token
    })
    return this.http.post(environment.api_ticket + endpointsTicket.ticketRevalidation, request, { headers: _headers })
    .pipe(
      take(3),
      catchError(
        error => this.errorHandler.handleError(error)
      )
    )
  }

  checkPartialTicket(request: iChekTicket): Observable<iDefaultResponse> {
    const _headers = new HttpHeaders({
      'x-access-token': this.token
    })
    return this.http.post<iDefaultResponse>(environment.api_ticket + endpointsTicket.checkTicket, request, { headers: _headers })
    .pipe(
      take(3),
      catchError(
        error => this.errorHandler.handleError(error)
      )
    )
  }

}
