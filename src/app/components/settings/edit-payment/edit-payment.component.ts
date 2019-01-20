import { Component, OnInit } from '@angular/core';
import { BraintreeService } from '../../../services/braintree.service';
import { ToastrService } from 'ngx-toastr';
import { reject } from 'q';
import {FormBuilder} from '@angular/forms';

const dropin = require('braintree-web-drop-in');
const braintree = require('braintree-web');
const paypal = window['PAYPAL'];
let paypalSubmitTokenize, cardSubmitTokenize;
const regex = {
  expr: /^(0[1-9]|1[012])[ -\/]\d\d$/,
  card: /(\d{4}[-.\s]?){4}|\d{4}[-.\s]?\d{6}[-.\s]?\d{5}/,
  cvv: /\d{3,4}/
};

@Component({
  selector: 'app-edit-payment',
  templateUrl: './edit-payment.component.html',
  styleUrls: ['./edit-payment.component.css']
})

export class EditPaymentComponent implements OnInit {

  private braintreeToken: string;
  private paypalInstance: any;

  private selectedPaymentMethod = 'card';
  private deletingObject: any = false;
  private paymentMethods: any = [];
  private braintreeClient: any;
  private addingPaymentMethod = false;
  private isCardSaving = false;
  private isMakingPrimary = false;
  private isPaypalProccess = false;
  private isPaypalSaving = false;

  private errors: any = {};
  private serverErrors: any = {};
  private errorsEdit: any = {};
  private edit: any = {
    card: {},
    editingToken: '',
    isEditProccess: false,
    data: {
      cardholderName: '',
      number: '',
      expr_month: '',
      expr_year: '',
      cvv: ''
    }
  };
  constructor(
    private brainTreeService: BraintreeService,
    private toastr: ToastrService,
  ) { }

  editInit(card) {
    this.edit.card = card;
    this.edit.data.cardholderName = card.cardholderName;
    this.edit.data.number = '';
    this.edit.data.expr_month = card.expirationMonth;
    this.edit.data.expr_year = card.expirationYear;
    this.edit.data.cvv = '';
    this.edit.editingToken = card.token;
  }


  editReset() {
    this.edit.data.cardholderName = '';
    this.edit.data.number = '';
    this.edit.data.expr_month = '';
    this.edit.data.expr_year = '';
    this.edit.data.cvv = '';
    this.edit.editingToken = '';
    this.edit.isEditProccess = false;
    this.errorsEdit = {};
    this.serverErrors = {};
  }

  toggleAddingPayment() { this.errors = {}; this.addingPaymentMethod = !this.addingPaymentMethod; }

  cardMakePrimary(token) {
    this.brainTreeService.makePaymentDefault(token)
      .subscribe(
        res => {
          this.updateCardList();
        },
        err => {
          this.toastr.error(err.error.message, 'Primary error');
          //this.serverErrors = err.error;
          this.isMakingPrimary = false;
        }
      );
  }
  cardDelete(ID) {
    this.deletingObject = ID;
  }

  modalAccept() {
    this.deletingObject.isDeleting = true;
    this.brainTreeService.deletePaymentMethod(this.deletingObject.token)
      .subscribe(
        res => {
          this.updateCardList();
        },
        err => {
          this.toastr.error(err.error.message, 'Delete error');
          //this.serverErrors = err.error;
        }
      );
  }
  modalCancel() {

  }

  addPaymentMethod(card) {
    this.isCardSaving = true;

    cardSubmitTokenize(card)
      .then(res => {
        const payload = {
          paymentMethodNonce: res.creditCards[0].nonce,
          options: {verifyCard: true}
        };
        this.brainTreeService.createPaymentMethod(payload)
          .subscribe(res => {
            if (res['success']) {
              // this.resetAddPaymentForm();
              this.updateCardList();
            } else {
              this.isCardSaving = false;
              console.log('this.brainTreeService.createPaymentMethod',res)
              this.toastr.error('Invalid credit card', 'Add Payment Method');
              //this.serverErrors = { 'message': res['message'] };
            }
          });
      })
      .catch(err => {
        this.isCardSaving = false;
        console.log('addPaymentMethod ', err);
        this.toastr.error(err, 'Error adding card');
      });
  }

  updatePaymentMethod(card) {
    this.isCardSaving = true

    cardSubmitTokenize(card)
      .then(res => {
        const payload = {
          paymentMethodNonce: res.creditCards[0].nonce
        };
        this.brainTreeService.createPaymentMethod(payload)
          .subscribe(res => {
            if (res['success']) {
              this.editReset();
              this.updateCardList();
            } else {
              this.isCardSaving = false;
              this.toastr.error(res['message'], 'Adding new card error');
            }
          });
      })
      .catch(err => {
        console.log('updatePaymentMethod ', err);
        this.isCardSaving = false;
        this.edit.isEditProccess = false;
        this.toastr.error(err, 'Adding new card error');
      });

  }
  //Technical functions
  paypalSubmit() {
    paypalSubmitTokenize();
  }
  changeMethodPayment(flag) {
    this.selectedPaymentMethod = flag;
  }

  updateCardList() {
    this.brainTreeService.getPaymentMethod()
      .subscribe(res => {
        this.paymentMethods = res;
        this.paymentMethods = this.paymentMethods.map(element => {
          element['isDeleting'] = false;
          return element;
        });
        this.isCardSaving = false;
        this.isPaypalProccess = false;
        this.addingPaymentMethod = false;

      });
  }

  ngOnInit() {

    this.updateCardList();
    this.brainTreeService.getBraintreeToken()
      .subscribe(res => {
        if (res['success']) {

          braintree.client.create({
            authorization: res['clientToken']
          }, (clientErr, clientInstance) => {
            if (clientErr) {
              console.error('Error creating client:', clientErr);
              return;
            }

            cardSubmitTokenize = (source) => {
              const data = {
                creditCard: {
                  number: source.number,
                  cardholderName: source.cardholderName,
                  expirationDate: source.expr_month + '/' + source.expr_year,
                  cvv: source.cvv,
                  options: {
                    validate: false
                  }
                }
              };

              return new Promise((resolve, reject) => {
                clientInstance.request({
                  endpoint: 'payment_methods/credit_cards',
                  method: 'post',
                  data: data
                }, (requestErr, response) => {
                  console.log('cardSubmitTokenize requestErr',requestErr)
                  console.log('cardSubmitTokenize response',response)
                  if (requestErr) { reject(requestErr); }
                  resolve(response);
                });
              });
            };


            braintree.paypal.create({
              client: clientInstance
            }, (paypalErr, paypalInstance) => {
              if (paypalErr) { console.error('Error creating PayPal:', paypalErr); return; }
              paypalSubmitTokenize = () => {
                paypalInstance.tokenize({ flow: 'vault' },
                  (tokenizeErr, payload) => {
                    if (tokenizeErr) { if (tokenizeErr.type !== 'CUSTOMER') { this.toastr.error(tokenizeErr, 'PaypalInstance.tokenize'); } return; }
                    const data = { paymentMethodNonce: payload.nonce };
                    this.brainTreeService.createPaymentMethod(data)
                      .subscribe(res => {
                        if (res['success']) {
                          // this.resetAddPaymentForm();
                          this.updateCardList();
                          this.isPaypalSaving = false;
                        } else {
                          this.isPaypalSaving = false;
                          this.isCardSaving = false;
                          this.toastr.error(res['message'], 'Adding new card error');
                        }
                      });
                  });
              };

            });
          });
        }
      });



  }
}
