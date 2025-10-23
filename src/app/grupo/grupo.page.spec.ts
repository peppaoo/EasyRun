import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrupoPage } from './grupo.page';

describe('GrupoPage', () => {
  let component: GrupoPage;
  let fixture: ComponentFixture<GrupoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GrupoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
