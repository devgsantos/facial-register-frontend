import { TestBed } from '@angular/core/testing';

import { TokenGenerateService } from './token-generate.service';

describe('TokenGenerateService', () => {
  let service: TokenGenerateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenGenerateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
