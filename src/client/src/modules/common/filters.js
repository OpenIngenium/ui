import moment from "moment";
import "moment-timezone";

// Replaces underscores with spaces and capitalizes every word in the string
export const titlecase = value => {
    if(value === "" || value === undefined)
        return "";
    const words = value.replace(/_/g, " ").split(" ");
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
};

// Apr 9, 2018, 5:04 pm
export const commonDateTime = time => {
    return time ? moment(time).format("MMM D, YYYY, h:mm A") : "";
};

// "2018-09-08T08:02 (local)"
export const commonTimestamp = time => {
    return time ? moment(time).local().format('YYYY-MM-DDTHH:mm:ss') : "";
};

// "2018-09-08T08:02 America/Los_Angeles(local)"
export const commonTimestampWithTimezone = time => {
    return time ? `${moment(time).local().format('YYYY-MM-DDTHH:mm:ss')} ${moment.tz.guess()}` : "";
};

// "2018-034T04:34:22 (UTC)"
export const doyTimestamp = time => {
    return time ? moment.utc(time).format("YYYY-DDDDTHH:mm:ss") : "";
};

// Local ISO format
export const localISOTimestamp = time => {
    return time ? moment(time).toISOString() : "";
};

// Gets relative time (i.e. 2 hours ago)
export const timesince = time => {
    return time ? moment(time).fromNow(true): "";
};

export const truncate = (text, length, ellipsis) => {
    text = text || '';
    ellipsis = ellipsis || '...';
    length = length || 30;

    if (text.length <= length) { return text; }
    let truncated = text.slice(0, length - ellipsis.length);
    return truncated + ellipsis;
};

