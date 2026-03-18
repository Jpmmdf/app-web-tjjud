import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minimumSelectionValidator(minimum: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    return Array.isArray(value) && value.length >= minimum ? null : { minimumSelection: true };
  };
}
