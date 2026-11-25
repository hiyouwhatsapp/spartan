import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmCheckbox } from '../../index';

@Component({
	selector: 'hlm-checkbox-host',
	imports: [ReactiveFormsModule, HlmFieldImports, HlmCheckbox],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<form [formGroup]="form">
			<div hlmField>
				<!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
				<label hlmFieldLabel>Accept terms *</label>
				<hlm-checkbox formControlName="agreement" aria-describedby="custom-hint custom-hint" />
				<p hlmFieldDescription id="field-hint">You must agree to proceed.</p>
				<hlm-field-error id="field-error">Agree to continue.</hlm-field-error>
			</div>
			<p id="custom-hint">You can read the terms before agreeing.</p>
		</form>
	`,
})
class HlmCheckboxHost {
	public readonly form = new FormGroup({
		agreement: new FormControl(false, { validators: [Validators.requiredTrue] }),
	});
}

describe('HlmCheckbox form integration', () => {
	let fixture: ReturnType<typeof TestBed.createComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HlmCheckboxHost],
		});
		fixture = TestBed.createComponent(HlmCheckboxHost);
		fixture.detectChanges();
	});

	it('merges manual and field ids on the focusable checkbox', async () => {
		const host = fixture.componentInstance as HlmCheckboxHost;
		const wrapper: HTMLElement = fixture.nativeElement.querySelector('hlm-checkbox');
		const checkbox = wrapper.querySelector('[role="checkbox"]');

		await fixture.whenStable();
		expect(wrapper.getAttribute('aria-describedby')).toBeNull();
		expect(checkbox?.getAttribute('aria-describedby')).toBe('custom-hint field-hint');

		host.form.markAllAsTouched();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(checkbox?.getAttribute('aria-describedby')).toBe('custom-hint field-hint field-error');

		host.form.controls.agreement.setValue(true);
		fixture.detectChanges();
		await fixture.whenStable();
		expect(checkbox?.getAttribute('aria-describedby')).toBe('custom-hint field-hint');
	});
});
