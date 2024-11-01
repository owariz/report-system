const formatDateTimeToThai = require('../lib/formatDate');

describe('formatDateTimeToThai', () => {
    it('should format date correctly for a given Date object', () => {
        const date = new Date('2023-11-01T12:34:56Z');
        const formattedDate = formatDateTimeToThai(date);

        // Check if the formatted string matches the expected Thai format
        expect(formattedDate).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}$/);
        // The expected date format is: DD/MM/YYYY, HH:mm:ss
    });

    it('should format date correctly for a given ISO date string', () => {
        const isoDateString = '2023-11-01T12:34:56Z';
        const formattedDate = formatDateTimeToThai(isoDateString);

        // Check if the formatted string matches the expected Thai format
        expect(formattedDate).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}$/);
    });

    it('should handle invalid date input gracefully', () => {
        const invalidDate = 'not a date';
        const formattedDate = formatDateTimeToThai(invalidDate);

        // This should return an invalid date format or some default behavior
        expect(formattedDate).toBe('Invalid Date'); // or whatever your function does in this case
    });

    it('should format current date correctly', () => {
        const currentDate = new Date();
        const formattedDate = formatDateTimeToThai(currentDate);

        expect(formattedDate).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}$/);
    });
});

