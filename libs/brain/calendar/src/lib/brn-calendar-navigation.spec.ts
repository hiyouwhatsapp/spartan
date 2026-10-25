import { Component, viewChild } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { BrnCalendar } from './brn-calendar';
import { BrnCalendarCellButton } from './brn-calendar-cell-button';
import { BrnCalendarNextButton } from './brn-calendar-next-button';
import { BrnCalendarPreviousButton } from './brn-calendar-previous-button';

@Component({
	selector: 'brn-calendar-navigation-test',
	imports: [BrnCalendar, BrnCalendarCellButton, BrnCalendarNextButton, BrnCalendarPreviousButton],
	template: `
		<div brnCalendar [defaultFocusedDate]="focus" [dateDisabled]="dateDisabled" [min]="min" [max]="max" [disabled]="disabled">
			<button brnCalendarPreviousButton>previous</button>
			<button brnCalendarNextButton>next</button>
			<button brnCalendarCellButton [date]="focus">day</button>
		</div>
	`,
})
class CalendarNavigationTest {
	readonly calendar = viewChild.required(BrnCalendar<Date>);
	focus = new Date(2026, 8, 18);
	dateDisabled = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
	min?: Date;
	max?: Date;
	disabled = false;
}

describe('calendar month navigation', () => {
	it('moves to the next month when the same day is disabled', async () => {
		const { fixture } = await render(CalendarNavigationTest);
		const next = screen.getByRole('button', { name: 'Go to the next month' });

		expect(next).toBeEnabled();
		fireEvent.click(next);
		fixture.detectChanges();

		expect(fixture.componentInstance.calendar().focusedDate()).toEqual(new Date(2026, 9, 19));
	});

	it('finds an earlier day for previous-month navigation', async () => {
		const { fixture } = await render(CalendarNavigationTest);
		fixture.componentInstance.focus = new Date(2026, 10, 18);
		fixture.componentInstance.dateDisabled = (date) => date.getDate() === 18;
		fixture.detectChanges();

		fireEvent.click(screen.getByRole('button', { name: 'Go to the previous month' }));
		fixture.detectChanges();

		expect(fixture.componentInstance.calendar().focusedDate()).toEqual(new Date(2026, 9, 17));
	});

	it('disables navigation when every date in the target month is blocked', async () => {
		const { fixture } = await render(CalendarNavigationTest);
		fixture.componentInstance.dateDisabled = (date) => date.getMonth() === 9;
		fixture.detectChanges();

		const next = screen.getByRole('button', { name: 'Go to the next month' });
		expect(next).toBeDisabled();
		expect(next).toHaveAttribute('aria-disabled', 'true');
	});

	it('finds the last allowed date inside a partially bounded month', async () => {
		const { fixture } = await render(CalendarNavigationTest);
		fixture.componentInstance.max = new Date(2026, 9, 10);
		fixture.detectChanges();

		const next = screen.getByRole('button', { name: 'Go to the next month' });
		expect(next).toBeEnabled();
		fireEvent.click(next);
		fixture.detectChanges();

		expect(fixture.componentInstance.calendar().focusedDate()).toEqual(new Date(2026, 9, 9));
	});

	it('keeps min/max boundaries and the calendar disabled state', async () => {
		const { fixture } = await render(CalendarNavigationTest);
		const next = screen.getByRole('button', { name: 'Go to the next month' });
		fixture.componentInstance.max = new Date(2026, 8, 30);
		fixture.detectChanges();
		expect(next).toBeDisabled();

		fixture.componentInstance.max = undefined;
		fixture.componentInstance.disabled = true;
		fixture.detectChanges();
		expect(next).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Go to the previous month' })).toBeDisabled();
	});

	it('uses the same selectable-date fallback for PageDown and PageUp', async () => {
		const { fixture } = await render(CalendarNavigationTest);
		const cell = screen.getByRole('gridcell', { name: 'day' });
		fireEvent.keyDown(cell, { key: 'PageDown' });
		fixture.detectChanges();
		expect(fixture.componentInstance.calendar().focusedDate()).toEqual(new Date(2026, 9, 19));

		fireEvent.keyDown(cell, { key: 'PageUp' });
		fixture.detectChanges();
		expect(fixture.componentInstance.calendar().focusedDate()).toEqual(new Date(2026, 8, 18));
	});
});
