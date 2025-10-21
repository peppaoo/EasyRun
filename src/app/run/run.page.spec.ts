import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RunPage } from './run.page';

describe('RunPage', () => {
  let component: RunPage;
  let fixture: ComponentFixture<RunPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RunPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
