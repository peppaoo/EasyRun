import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AltersenhaPage } from './altersenha.page';

describe('AltersenhaPage', () => {
  let component: AltersenhaPage;
  let fixture: ComponentFixture<AltersenhaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AltersenhaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
