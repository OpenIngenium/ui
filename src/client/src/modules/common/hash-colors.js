// https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
import crypto from "crypto";

function hashToColorCombo(hash) {
    switch(hash) {
    case '0': return { background: '#68a38a', text: '#ffffff' }; // light green
    case '1': return { background: '#076ce1', text: '#ffffff' }; // medium blue
    case '2': return { background: '#225d00', text: '#ffffff' }; // dark green
    case '3': return { background: '#5d0197', text: '#ffffff' }; // dark purple
    case '4': return { background: '#fa6b90', text: '#000000' }; // pink
    case '5': return { background: '#959a90', text: '#ffffff' }; // gray
    case '6': return { background: '#424748', text: '#ffffff' }; // dark gray
    case '7': return { background: '#cdf8fc', text: '#000000' }; // light blue
    case '8': return { background: '#eeccb9', text: '#000000' }; // beige
    case '9': return { background: '#b25e4b', text: '#ffffff' }; // brown
    case 'a': return { background: '#ffff00', text: '#000000' }; // yellow
    case 'b': return { background: '#ffa500', text: '#000000' }; // orange
    case 'c': return { background: '#ffe3b1', text: '#000000' }; // light orange
    case 'd': return { background: '#f600f6', text: '#ffffff' }; // bright purple
    case 'e': return { background: '#bc8f8f', text: '#000000' }; // light brown
    case 'f': return { background: '#000000', text: '#ffffff' }; // black
    case 'z': return { background: '#ff0000', text: '#ffffff' }; // hazardous
    }
}

// return 0-9 or a-f, 16 total
function simpleHashChar(text) {
    text = text.toUpperCase().trim();
    if (text === 'HAZARD' || text === 'HAZARDOUS') return 'z';

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0; // Convert to 32bit int
    }

    const hexChar = Math.abs(hash % 16).toString(16); // get 0–f
    return hexChar;
}

export function textToColor(text) {
    return hashToColorCombo(simpleHashChar(text));
}