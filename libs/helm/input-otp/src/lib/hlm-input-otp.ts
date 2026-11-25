import type { BooleanInput } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BrnInputOtp, BrnInputOtpInput, type InputMode } from '@spartan-ng/brain/input-otp';
import { classes, hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'cn';

@Component({
	selector: 'hlm-input-otp',
	exportAs: 'hlmInputOtp',
	imports: [BrnInputOtpInput],
	changeDetection: ChangeDetectionStrategy.OnPush,
	hostDirectives: [
		{
			directive: BrnInputOtp,
			inputs: [
				'length',
				'value',
				'disabled',
				'forceInvalid',
				'inputId',
				'hostStyles',
				'autofocus',
				'transformPaste',
				'mask',
				'maskChar',
				'slotPattern',
			],
			outputs: ['valueChange', 'completed'],
		},
	],
	host: {
		'data-slot': 'input-otp',
		'[attr.aria-describedby]': 'null',
		'[attr.aria-invalid]': 'null',
	},
	template: `
		<ng-content />
		<input
			brnInputOtpInput
			[autocomplete]="inputAutocomplete()"
			[inputMode]="inputMode()"
			[aria-describedby]="ariaDescribedby()"
			[aria-invalid]="ariaInvalid()"
			[class]="_inputClass()"
			[inputStyles]="inputStyles()"
		/>
	`,
})
export class HlmInputOtp {
	/** Custom autocomplete attribute applied to the input element */
	public readonly inputAutocomplete = input<'one-time-code' | 'off'>('one-time-code');

	/** Virtual keyboard appearance on mobile */
	public readonly inputMode = input<InputMode>('numeric');

	/** IDs of additional descriptions for the focusable input. */
	public readonly ariaDescribedby = input<string | null>(null, { alias: 'aria-describedby' });

	/** Overrides the announced invalid state without changing the visual error state. */
	public readonly ariaInvalid = input<BooleanInput>(undefined, { alias: 'aria-invalid' });

	/** Classes applied to the input element. */
	public readonly inputClass = input<ClassValue>('');

	/** Overrides the default styles applied to the input element. */
	public readonly inputStyles = input<string | undefined>(undefined);

	protected readonly _inputClass = computed(() => hlm('disabled:cursor-not-allowed', this.inputClass()));

	constructor() {
		classes(() => 'spartan-input-otp flex items-center has-disabled:opacity-50');
	}
}
