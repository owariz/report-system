const formatDateTimeToThai = (dateTime) => {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };
    return new Date(dateTime).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', ...options });
};

module.exports = formatDateTimeToThai;