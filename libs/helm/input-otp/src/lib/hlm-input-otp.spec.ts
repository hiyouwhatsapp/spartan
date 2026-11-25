import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { HlmInputOtpImports } from '../index';

@Component({
	selector: 'hlm-input-otp-form-host',
	imports: [ReactiveFormsModule, HlmInputOtpImports],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<form [formGroup]="form">
			<hlm-input-otp formControlName="otp" length="6">
				<hlm-input-otp-group>
					<hlm-input-otp-slot index="0" />
					<hlm-input-otp-slot index="1" />
					<hlm-input-otp-slot index="2" />
				</hlm-input-otp-group>
				<hlm-input-otp-separator />
				<hlm-input-otp-group>
					<hlm-input-otp-slot index="3" />
					<hlm-input-otp-slot index="4" />
					<hlm-input-otp-slot index="5" />
				</hlm-input-otp-group>
			</hlm-input-otp>
		</form>
	`,
})
class HlmInputOtpFormHost {
	public readonly form = new FormGroup({
		otp: new FormControl(''),
	});
}

@Component({
	selector: 'hlm-input-otp-field-host',
	imports: [ReactiveFormsModule, HlmFieldImports, HlmInputOtpImports],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<form [formGroup]="form">
			<div hlmField>
				<label for="otp-code" hlmFieldLabel>Verification code</label>
				<hlm-input-otp length="6" inputId="otp-code" formControlName="otp" aria-describedby="custom-hint custom-hint">
					<hlm-input-otp-slot index="0" />
				</hlm-input-otp>
				<p hlmFieldDescription id="field-hint">Enter all six digits.</p>
				<hlm-field-error id="field-error">The verification code is required.</hlm-field-error>
			</div>
		</form>
		<p id="custom-hint">Use the code you received.</p>
	`,
})
class HlmInputOtpFieldHost {
	public readonly form = new FormGroup({
		otp: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
	});
}

describe('HlmInputOtp', () => {
	const setup = async () => {
		const result = await render(
			`<hlm-input-otp length="6">
				<hlm-input-otp-group>
					<hlm-input-otp-slot index="0" />
					<hlm-input-otp-slot index="1" />
					<hlm-input-otp-slot index="2" />
				</hlm-input-otp-group>
				<hlm-input-otp-separator />
				<hlm-input-otp-group>
					<hlm-input-otp-slot index="3" />
					<hlm-input-otp-slot index="4" />
					<hlm-input-otp-slot index="5" />
				</hlm-input-otp-group>
			</hlm-input-otp>`,
			{ imports: [HlmInputOtpImports] },
		);

		const input = result.container.querySelector('input[data-slot="input-otp"]') as HTMLInputElement;

		return { ...result, input, user: userEvent.setup() };
	};

	it('describes the focused input and follows the Field error state', async () => {
		const { container, fixture, getByRole } = await render(HlmInputOtpFieldHost);
		const input = getByRole('textbox', { name: 'Verification code' });
		const host = container.querySelector('hlm-input-otp');

		input.focus();
		await fixture.whenStable();
		expect(document.activeElement).toBe(input);
		expect(host?.getAttribute('aria-describedby')).toBeNull();
		expect(input.getAttribute('aria-describedby')).toBe('custom-hint field-hint');
		expect(input.getAttribute('aria-invalid')).toBeNull();

		input.blur();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.getAttribute('aria-describedby')).toBe('custom-hint field-hint field-error');

		fixture.componentInstance.form.controls.otp.setValue('123456');
		fixture.detectChanges();
		await fixture.whenStable();
		expect(input.getAttribute('aria-invalid')).toBeNull();
		expect(input.getAttribute('aria-describedby')).toBe('custom-hint field-hint');
	});

	it('allows an explicit aria invalid override without changing the slot state', async () => {
		const { container, getByRole } = await render(
			`<hlm-input-otp length="1" forceInvalid aria-invalid="false">
				<hlm-input-otp-slot index="0" />
			</hlm-input-otp>`,
			{ imports: [HlmInputOtpImports] },
		);

		expect(getByRole('textbox').getAttribute('aria-invalid')).toBeNull();
		expect(container.querySelector('brn-input-otp-slot')?.getAttribute('data-matches-spartan-invalid')).toBe('true');
	});

	it('renders a hidden input and six slots', async () => {
		const { container, input } = await setup();

		expect(input).toBeInTheDocument();
		expect(container.querySelectorAll('brn-input-otp-slot')).toHaveLength(6);
	});

	it('renders typed characters in the slots', async () => {
		const { container, input, user } = await setup();

		await user.click(input);
		await user.keyboard('123456');

		expect(input.value).toBe('123456');
		expect(container.querySelectorAll('brn-input-otp-slot')[0]).toHaveTextContent('1');
		expect(container.querySelectorAll('brn-input-otp-slot')[5]).toHaveTextContent('6');
	});

	it('applies the default input classes and merges custom classes', async () => {
		const { container } = await render(
			`<hlm-input-otp length="6" inputClass="custom-class">
				<hlm-input-otp-slot index="0" />
			</hlm-input-otp>`,
			{ imports: [HlmInputOtpImports] },
		);

		const input = container.querySelector('input[data-slot="input-otp"]') as HTMLInputElement;

		expect(input).toHaveClass('disabled:cursor-not-allowed');
		expect(input).toHaveClass('custom-class');
	});

	it('masks filled slots and supports a custom mask character', async () => {
		const { container } = await render(
			`<hlm-input-otp mask maskChar="*" value="123456" length="6">
				<hlm-input-otp-group>
					<hlm-input-otp-slot index="0" />
					<hlm-input-otp-slot index="1" />
					<hlm-input-otp-slot index="2" />
				</hlm-input-otp-group>
				<hlm-input-otp-separator />
				<hlm-input-otp-group>
					<hlm-input-otp-slot index="3" />
					<hlm-input-otp-slot index="4" />
					<hlm-input-otp-slot index="5" />
				</hlm-input-otp-group>
			</hlm-input-otp>`,
			{ imports: [HlmInputOtpImports] },
		);

		const input = container.querySelector('input[data-slot="input-otp"]') as HTMLInputElement;
		const slots = container.querySelectorAll('brn-input-otp-slot');

		expect(input.value).toBe('123456');
		expect(slots[0]).toHaveTextContent('*');
		expect(slots[5]).toHaveTextContent('*');
	});

	it('filters characters using the slotPattern input', async () => {
		const { container } = await render(
			`<hlm-input-otp slotPattern="[0-9]" length="6">
				<hlm-input-otp-group>
					<hlm-input-otp-slot index="0" />
					<hlm-input-otp-slot index="1" />
					<hlm-input-otp-slot index="2" />
				</hlm-input-otp-group>
			</hlm-input-otp>`,
			{ imports: [HlmInputOtpImports] },
		);

		const input = container.querySelector('input[data-slot="input-otp"]') as HTMLInputElement;
		const user = userEvent.setup();

		await user.click(input);
		await user.keyboard('1a2b3');

		expect(input.value).toBe('123');
	});

	it('supports reactive forms on the hlm root', async () => {
		const { container, fixture } = await render(HlmInputOtpFormHost);
		const host = fixture.componentInstance;
		const input = container.querySelector('input[data-slot="input-otp"]') as HTMLInputElement;
		const user = userEvent.setup();

		await user.click(input);
		await user.keyboard('123456');
		fixture.detectChanges();

		expect(host.form.value.otp).toBe('123456');
	});
});
