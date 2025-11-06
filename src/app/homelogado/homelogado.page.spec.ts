import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomelogadoPage } from './homelogado.page';

describe('HomelogadoPage', () => {
  let component: HomelogadoPage;
  let fixture: ComponentFixture<HomelogadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomelogadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
