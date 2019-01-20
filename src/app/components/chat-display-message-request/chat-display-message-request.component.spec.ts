import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDisplayMessageRequestComponent } from './chat-display-message-request.component';

describe('ChatDisplayMessageRequestComponent', () => {
  let component: ChatDisplayMessageRequestComponent;
  let fixture: ComponentFixture<ChatDisplayMessageRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatDisplayMessageRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatDisplayMessageRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
