import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawNowComponent } from './withdraw-now.component';

describe('WithdrawNowComponent', () => {
  let component: WithdrawNowComponent;
  let fixture: ComponentFixture<WithdrawNowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawNowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawNowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
