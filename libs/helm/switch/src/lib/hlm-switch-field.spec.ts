import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { render } from '@testing-library/angular';
import { HlmSwitch } from './hlm-switch';

@Component({
	selector: 'hlm-switch-field-host',
	imports: [ReactiveFormsModule, HlmFieldImports, HlmSwitch],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div hlmField>
			<hlm-switch [formControl]="control" aria-label="Notifications" aria-describedby="custom-hint custom-hint" />
			<p hlmFieldDescription id="field-hint">Notifications are required.</p>
			<hlm-field-error id="field-error">Turn notifications on to continue.</hlm-field-error>
		</div>
		<p id="custom-hint">You can change this setting later.</p>
	`,
})
class HlmSwitchFieldHost {
	public readonly control = new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] });
}

describe('HlmSwitch field integration', () => {
	it('merges manual and field ids on the focusable switch', async () => {
		const { fixture, getByRole } = await render(HlmSwitchFieldHost);
		const input = getByRole('switch', { name: 'Notifications' });

		await fixture.whenStable();
		expect(input.getAttribute('aria-describedby')).toBe('custom-hint field-hint');

		fixture.componentInstance.control.markAsTouched();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(input.getAttribute('aria-describedby')).toBe('custom-hint field-hint field-error');

		fixture.componentInstance.control.setValue(true);
		fixture.detectChanges();
		await fixture.whenStable();
		expect(input.getAttribute('aria-describedby')).toBe('custom-hint field-hint');
	});
});
