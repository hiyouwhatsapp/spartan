import { computed, Directive } from '@angular/core';
import { injectDateAdapter } from '@spartan-ng/brain/date-time';
import { injectBrnCalendar } from './brn-calendar.token';
import { injectBrnCalendarI18n } from './i18n/calendar-i18n';
import { findEnabledDateInMonth } from './utils/find-enabled-date-in-month';

@Directive({
	selector: 'button[brnCalendarPreviousButton]',
	exportAs: 'brnCalendarPreviousButton',
	host: {
		type: 'button',
		'data-slot': 'calendar-previous-button',
		'[attr.aria-label]': '_i18n.config().labelPrevious()',
		'[attr.aria-disabled]': '_disabled() ? true : null',
		'[disabled]': '_disabled()',
		'(click)': 'focusPreviousMonth()',
	},
})
export class BrnCalendarPreviousButton {
	/** Access the calendar */
	private readonly _calendar = injectBrnCalendar();

	/** Access the date adapter */
	private readonly _dateAdapter = injectDateAdapter();

	/** Access the calendar i18n */
	protected readonly _i18n = injectBrnCalendarI18n();

	/** Find a selectable day in the previous month, if one exists. */
	private readonly _targetDate = computed(() =>
		findEnabledDateInMonth(this.previousMonthTarget(), this._dateAdapter, (date) => this._calendar.isDateDisabled(date), -1),
	);

	/** Whether navigating to the previous month is disabled. */
	protected readonly _disabled = computed(() => this._targetDate() === undefined);

	/** Focus the previous month */
	protected focusPreviousMonth(): void {
		const targetDate = this._targetDate();
		if (targetDate !== undefined) {
			this._calendar.setFocusedDate(targetDate);
		}
	}

	/** @internal Keep the same day number where possible when changing months. */
	private previousMonthTarget(): unknown {
		const focusedDate = this._calendar.focusedDate();
		const day = this._dateAdapter.getDate(focusedDate);

		// Start at the first so the 31st doesn't overflow a shorter month
		const month = this._dateAdapter.subtract(this._dateAdapter.startOfMonth(focusedDate), { months: 1 });
		const lastDay = this._dateAdapter.getDate(this._dateAdapter.endOfMonth(month));
		return this._dateAdapter.set(month, { day: Math.min(day, lastDay) });
	}
}
