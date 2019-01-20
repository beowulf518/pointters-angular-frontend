import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessageRequestComponent } from './chat-message-request.component';

describe('ChatMessageRequestComponent', () => {
  let component: ChatMessageRequestComponent;
  let fixture: ComponentFixture<ChatMessageRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatMessageRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatMessageRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
