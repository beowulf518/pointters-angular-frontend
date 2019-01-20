import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCancelationComponent } from './order-cancelation.component';

describe('OrderCancelationComponent', () => {
  let component: OrderCancelationComponent;
  let fixture: ComponentFixture<OrderCancelationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderCancelationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCancelationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
