import type { BrnDateAdapter } from '@spartan-ng/brain/date-time';

/** Find the closest enabled day in a month, preferring the navigation direction on ties. */
export function findEnabledDateInMonth<T>(
	targetDate: T,
	dateAdapter: BrnDateAdapter<T>,
	isDateDisabled: (date: T) => boolean,
	direction: 1 | -1,
): T | undefined {
	const day = dateAdapter.getDate(targetDate);
	const lastDay = dateAdapter.getDate(dateAdapter.endOfMonth(targetDate));

	for (let offset = 0; offset < lastDay; offset++) {
		const days = offset === 0 ? [day] : [day + direction * offset, day - direction * offset];
		for (const candidateDay of days) {
			if (candidateDay < 1 || candidateDay > lastDay) {
				continue;
			}

			const candidate = dateAdapter.set(targetDate, { day: candidateDay });
			if (!isDateDisabled(candidate)) {
				return candidate;
			}
		}
	}

	return undefined;
}
