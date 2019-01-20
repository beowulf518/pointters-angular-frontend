import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CreditCardValidator} from 'angular-cc-library';

@Component({
  selector: 'app-credit-card-form',
  templateUrl: './credit-card-form.component.html',
  styleUrls: ['./credit-card-form.component.css']
})
export class CreditCardFormComponent implements OnInit {


  @Input() public selected = false;
  @Input() public isCardSaving = false;
  @Input() public initialData;


  @Output() public submited = new EventEmitter();
  @Output() public onSelect = new EventEmitter();
  @Output() public canceled = new EventEmitter();


  @ViewChild('cardNumberInput') cardNumberInput: ElementRef;

  public creditCardForm: FormGroup;
  public currentCard: string;
  public hasSubmited: boolean;

  constructor(private fb: FormBuilder,
  ) { }

  ngOnInit() {

    this.creditCardForm = this.fb.group({
      cardholderName: ['', [Validators.required]],
      number: ['', [CreditCardValidator.validateCCNumber]],
      expirationDate: ['', [CreditCardValidator.validateExpDate]],
      expr_month: [''],
      expr_year: [''],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)] ]
    });

    console.log(this.initialData)

    if(this.initialData) {

      let data = {
        cardholderName: this.initialData.cardholderName,
        number: this.initialData.maskedNumber,
        expirationDate: this.initialData.expirationDate,
        expr_month: this.initialData.expirationMonth,
        expr_year: this.initialData.expirationYear,
        cvv: ''
      }

      this.creditCardForm.setValue(data);
    }

  }

  submit() {
    this.hasSubmited = true;

    if (this.isCardSaving) { return; }


    if (this.creditCardForm.valid) {

      const data = this.creditCardForm.value;
      const exparr = data.expirationDate.split('/');

      data.expr_month = exparr[0].trim();
      data.expr_year = exparr[1].trim();

      this.submited.emit(data);
    }
  }


  cancel() {
    this.canceled.emit(true);
  }

  handleCardNumberChange() {

    const classList = this.cardNumberInput.nativeElement.classList;

    if (classList.contains('visa')) {
      this.currentCard = 'visa';
    } else if (classList.contains('amex')) {
      this.currentCard = 'amex';
    } else if (classList.contains('mastercard')) {
      this.currentCard = 'mastercard';
    } else if (classList.contains('discover')) {
      this.currentCard = 'discover';
    } else {
      this.currentCard = '';
    }
  }

}
