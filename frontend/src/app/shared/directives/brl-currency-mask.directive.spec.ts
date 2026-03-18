import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BrlCurrencyMaskDirective } from './brl-currency-mask.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, BrlCurrencyMaskDirective],
  template: `<input type="text" appBrlCurrencyMask [formControl]="control">`,
})
class HostComponent {
  readonly control = new FormControl('', { nonNullable: true });
}

describe('BrlCurrencyMaskDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  });

  it('should update the form control using canonical decimal format', () => {
    input.value = '123456';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.control.value).toBe('1234.56');
    expect(input.value).toContain('1.234,56');
  });

  it('should render a formatted value when the control is patched', () => {
    host.control.setValue('59.90');
    fixture.detectChanges();

    expect(input.value).toContain('59,90');
  });
});
