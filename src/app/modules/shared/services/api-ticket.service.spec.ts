import { TestBed } from '@angular/core/testing';

import { ApiTicketService } from './api-ticket.service';

describe('ApiTicketService', () => {
  let service: ApiTicketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiTicketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
