import { Directive, ElementRef, HostListener, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

@Directive({
  selector: 'input[appBrlCurrencyMask]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BrlCurrencyMaskDirective),
      multi: true,
    },
  ],
})
export class BrlCurrencyMaskDirective implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef<HTMLInputElement>);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private hasUserInteracted = false;

  writeValue(value: string | null): void {
    this.render(this.toDisplayValue(value));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.elementRef.nativeElement.disabled = isDisabled;
  }

  @HostListener('input', ['$event'])
  handleInput(event: Event): void {
    this.hasUserInteracted = true;
    const rawValue = (event.target as HTMLInputElement | null)?.value ?? '';
    const modelValue = this.toModelValue(rawValue);
    this.render(this.toDisplayValue(modelValue));
    this.onChange(modelValue);
  }

  @HostListener('focus')
  handleFocus(): void {
    if (!this.elementRef.nativeElement.value) {
      const initialValue = '0.00';
      this.hasUserInteracted = true;
      this.render(this.toDisplayValue(initialValue));
      this.onChange(initialValue);
    }
  }

  @HostListener('blur')
  handleBlur(): void {
    const currentModelValue = this.toModelValue(this.elementRef.nativeElement.value);
    const normalizedValue = this.hasUserInteracted ? currentModelValue || '0.00' : currentModelValue;
    this.render(this.toDisplayValue(normalizedValue));
    this.onChange(normalizedValue);
    this.onTouched();
  }

  private render(value: string): void {
    this.elementRef.nativeElement.value = value;
  }

  private toDisplayValue(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const amount = Number.parseFloat(value);
    if (Number.isNaN(amount)) {
      return '';
    }

    return currencyFormatter.format(amount);
  }

  private toModelValue(rawValue: string): string {
    const digits = rawValue.replace(/\D/g, '').slice(0, 12);
    if (!digits) {
      return '';
    }

    const amount = Number.parseInt(digits, 10) / 100;
    return amount.toFixed(2);
  }
}
