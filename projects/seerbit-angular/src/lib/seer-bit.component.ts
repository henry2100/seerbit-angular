import { Component, OnInit, Output, Input, EventEmitter, HostListener } from '@angular/core';
import { PrivateSeerBitOptions, SeerBitOptions } from './models/SeerBitOptions';
import { SeerbitService } from './seerbit-service';

interface MyWindow extends Window {
  SeerbitPay:
  {
    (options: any, callback: any, close: any)
  };
}

declare var window: MyWindow;
@Component({
  selector: 'seerbit-ng',
  template: `<button [ngClass]="class" [ngStyle]="style"><ng-content></ng-content></button>`
})
export class SeerBitComponent {
  @Input() class: string;
  @Input() style: object;
  @Input() options: any;
  @Output() callback: EventEmitter<{response: any, closeModal: any}> = new EventEmitter<{response: any, closeModal: any}>();
  @Output() close: EventEmitter<any> = new EventEmitter<any>();
  @Output() validationError: EventEmitter<any> = new EventEmitter<any>();
  private _options: Partial<PrivateSeerBitOptions>;
  closeFn: any;
  callbackFn: any;

  constructor(private seerBitService: SeerbitService) {

  }

  generateOptions(obj: any) {
    this._options = this.seerBitService.getSeerBitOptions(obj);
    this.closeFn = (...response) => {
      if (this.close.observers.length) {
        this.close.emit(...response);
      }
    };
    this.callbackFn = (response, closeModal) => {
      this.callback.emit({response, closeModal});
    };
  }
  validateInput(obj: SeerBitOptions) {
    if (!this.callback.observers.length) {
      return 'SeerBit: Insert a callback output like so (callback)=\'PaymentComplete($event)\' to check payment status';
    }
    return this.seerBitService.checkInput(obj);
  }

  @HostListener('click')

  async buttonClick() {
    this.pay();
  }
    async pay() {
    const errorText = this.validateInput(this.options);
    this.generateOptions(this.options);
    if (errorText) {
      this.validationError.emit(errorText);
      return errorText;
    }
    await this.seerBitService.loadScript();
    window.SeerbitPay(this._options, this.callbackFn, this.closeFn);
  }
}
