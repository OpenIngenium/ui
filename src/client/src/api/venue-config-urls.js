// Venue Config

/* istanbul ignore next */
const venueConfigVersion = "v1";
const venueConfigUrl = `/venue_config/api/${venueConfigVersion}`;

/* istanbul ignore next */
const venueConfigTemplateUrls = {
    elements: function(templateId) {
        return venueConfigUrl + `/templates/${templateId}/elements`;
    }
};

/* istanbul ignore next */
const venueConfigConfigurationsUrls = {
    history: function(configId) {
        return venueConfigUrl + `/configurations/${configId}/history`;
    },
    elements: function(configId) {
        return venueConfigUrl + `/configurations/${configId}/elements`;
    }
};

/* istanbul ignore next */
const venueConfigHealth = () => venueConfigUrl + "/health";

export {
    venueConfigTemplateUrls,
    venueConfigConfigurationsUrls,
    venueConfigHealth
};
