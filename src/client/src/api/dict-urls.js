// Dictionary Config
const dictApiVersion = "v4";
const dictUrl = `/dict_server/api/${dictApiVersion}`;

/* istanbul ignore next */
const dictionaryUrls = {
    versions: function(dictType, dictVersion = "") {
        if (dictVersion) {
            return dictUrl + `/dictionaries/${dictType}/versions/${dictVersion}`;    
        } else {
            return dictUrl + `/dictionaries/${dictType}/versions`;    
        }
    }
};

const dictionaryFlightUrls = {
    cmds: function(dictVersion, cmdStem = "") {
        return dictUrl + `/dictionaries/flight/versions/${dictVersion}/cmds` + (cmdStem && "/" + cmdStem);
    },
    evrs: function(dictVersion, evrName = "") {
        return dictUrl + `/dictionaries/flight/versions/${dictVersion}/evrs` + (evrName && "/" + evrName);
    },
    channels: function(dictVersion, channelName = "") {
        return dictUrl + `/dictionaries/flight/versions/${dictVersion}/channels` + (channelName && "/" + channelName);
    },
    mil1553: function(dictVersion , mil1553Name = "") {
        return dictUrl + `/dictionaries/flight/versions/${dictVersion}/mil1553` + (mil1553Name && "/" + mil1553Name);
    }
};

const dictionarySseUrls = {
    cmds: function(dictVersion, cmdStem = "") {
        return dictUrl + `/dictionaries/sse/versions/${dictVersion}/cmds` + (cmdStem && "/" + cmdStem);
    },
    evrs: function(dictVersion, evrName = "") {
        return dictUrl + `/dictionaries/sse/versions/${dictVersion}/evrs` + (evrName && "/" + evrName);
    },
    channels: function(dictVersion, channelName = "") {
        return dictUrl + `/dictionaries/sse/versions/${dictVersion}/channels` + (channelName && "/" + channelName);
    },
    mil1553: function(dictVersion , mil1553Name = "") {
        return dictUrl + `/dictionaries/sse/versions/${dictVersion}/mil1553` + (mil1553Name && "/" + mil1553Name);
    }
};

const customScriptsUrls = {
    customScripts: function(customScriptId = "") {
        return dictUrl + `/custom_scripts` + (customScriptId && "/" + customScriptId);
    },
    customScriptsBulkQuery: function() {
        return dictUrl + `/custom_scripts/bulk_query`;
    }
};

const verificationAndValidation = {
    vnv: function() {
        return dictUrl + `/vnv`;
    },
    vnvVis: function(viId = "") {
        return verificationAndValidation.vnv() + `/vis` + (viId && "/" + viId);
    },
    vnvVisBulk: function() {
        return verificationAndValidation.vnv() + `/vis/bulk`;
    }
};

export {
    dictionaryUrls,
    dictionaryFlightUrls,
    dictionarySseUrls,
    customScriptsUrls,
    verificationAndValidation
};
