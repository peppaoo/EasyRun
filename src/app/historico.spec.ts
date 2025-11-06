import { TestBed } from '@angular/core/testing';

import { Historico } from './historico.service';

describe('Historico', () => {
  let service: Historico;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Historico);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
