import { BraintreeService } from './../../../services/braintree.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

const moment = require('moment');
@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.css']
})
export class TransactionHistoryComponent implements OnInit {
  private filter:any;
  private isProccess:any=false;
  private totalPurchases:any;
  private totalActiveOrderPurchases:any;
  private totalCompletedOrderPurchases:any;
  private totalPersonalBalance:any;
  private totalSalesEarning:any;
  private transactions:any;
  private nextToken:any;
  private dateFrom = moment(new Date).subtract(1, 'month');
  private moment=moment;
  private filterOptions = [
    {value:'purchases',label:'Purchases'},
    {value:'sales',label:'Sales'},
    {value:'active_purchases',label:'Active purchases'},
    {value:'completed_purchases',label:'Completed purchases'},
  ]
  constructor(private route: ActivatedRoute,
      private authService: AuthService,
      private router: Router,
      private braintreeService:BraintreeService
    ) {
  }


  filterChange($event){
    console.log('filter',this.filter);
    if(this.isProccess)return;
    this.isProccess=true;
    this.transactions=[];
    this.nextToken=null;
    let payload = {filter:this.filter,period:moment(this.dateFrom).format('YYYY-MM')}
    this.braintreeService.getTransactionHistory(payload,this.nextToken)
    .subscribe(
      res=>{
        this.isProccess=false;
        this.transactions = this.transactions.concat(res['docs']);
        this.nextToken = res['lastDocId']
        console.log('getTransactionHistory',res);
      },
      err=>{
        this.isProccess=false;
      }
    )    
      
  }
  dateChange($event){
    console.log('dateFrom',this.dateFrom);
    if(this.isProccess)return;
    this.isProccess=true;
    this.transactions=[];
    this.nextToken=null;
    let payload = {filter:this.filter,period:moment(this.dateFrom).format('YYYY-MM')}
    this.braintreeService.getTransactionHistory(payload,this.nextToken)
    .subscribe(
      res=>{
        this.isProccess=false;
        this.transactions = this.transactions.concat(res['docs']);
        this.nextToken = res['lastDocId']
        console.log('getTransactionHistory',res);
      },
      err=>{
        this.isProccess=false;
      }
    )  
  }
  loadMoretransactions(){
    if(this.isProccess)return;
    this.isProccess=true;
    let payload = {filter:'',period:moment(this.dateFrom).format('YYYY-MM')}

    this.braintreeService.getTransactionHistory(payload,this.nextToken)
      .subscribe(
        res=>{
          this.isProccess=false;
          this.transactions = this.transactions.concat(res['docs']);
          this.nextToken = res['lastDocId']
          console.log('getTransactionHistory',res);
        },
        err=>{
          this.isProccess=false;
        }
      )
  }
  ngOnInit() {
    this.isProccess=true;
    this.braintreeService.getTransactionHistory({filter:'',period:moment(this.dateFrom).format('YYYY-MM')})
      .subscribe(
        res=>{
          this.isProccess=false;
          this.totalPersonalBalance = res['totalPersonalBalance'];
          this.totalPurchases = res['totalPurchases'];
          this.totalSalesEarning = res['totalSalesEarning'];
          this.totalActiveOrderPurchases = res['totalActiveOrderPurchases'];
          this.totalCompletedOrderPurchases = res['totalCompletedOrderPurchases'];
          this.transactions = res['docs'];
          this.nextToken = res['lastDocId']
          console.log('getTransactionHistory',res);
        },
        err=>{}
      )
  }
}
