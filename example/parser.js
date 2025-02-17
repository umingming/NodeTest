function parseTime(str) {
    const [_, hour, minute, ampm] = str.match(/([\d]+):([\d]+)(am|pm)?/);
    return calculateMinute(ampm === "pm" ? hour + 12 : hour, minute);
}

function calculateMinute(hour, minute) {
    return hour * 60 + minute;
}

parseTime("12:22am")