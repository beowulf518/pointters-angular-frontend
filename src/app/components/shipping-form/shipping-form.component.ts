import { Component, Input, OnInit, OnChanges, EventEmitter, Output } from '@angular/core';
import { createNumberMask } from 'text-mask-addons';
import { states } from '../../interfaces/states';
import { countries } from '../../interfaces/countries';


@Component({
  selector: 'shipping-form',
  templateUrl: './shipping-form.component.html',
  styleUrls: ['./shipping-form.component.css']
})
export class ShippingFormComponent implements OnInit {

  @Input() handleSelectClose: Function;
  @Input() validateInput: Function;
  @Input() address;
  @Input() parcel;
  @Input() noPadding: boolean = false;

  @Input() country;

  @Output() onCountryChange: EventEmitter<string> = new EventEmitter<string>();

  private numMask = createNumberMask({
    thousandsSeparatorSymbol: ".",
    prefix: '',
    suffix: '',
    allowDecimal: true
  })

  private countryOptions = countries;
  private stateOptions = states;
  private useSelect: boolean = false;

  constructor() { }

  ngOnInit() {
    if (this.country === 'US') {
      this.useSelect = true;
    }
  }

  handleCountrySelection(val) {
    if (val.value === 'US') {
      this.useSelect = true;
    } else {
      this.useSelect = false;
    }
    this.onCountryChange.emit(val.label);
  }

  ngOnChanges(changes) {
    if (changes.address) {
      if (changes.address.currentValue.state === '') {
        this.address.state = undefined;
      }
    }
  }

  selectClose() {
    this.handleSelectClose();
  }
}
