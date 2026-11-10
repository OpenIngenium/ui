import _ from "lodash";

// initial state
const initialState = () => {
    return {
        showFeedbackModal: false,
        feedbackObject: {},
        feedbackType: "success",
    };
};

const state = initialState();

const getters = {
    showFeedbackModal: state => state.showFeedbackModal,
    feedbackObject: state => state.feedbackObject,
    feedbackType: state => state.feedbackType,
};

/* istanbul ignore next */
const actions = {
    toggleFeedbackModal({commit}, value) {
        commit("toggleFeedbackModal", value);
    },
    displayFeedback({commit}, {type, errorObj, messageObj}) {
        commit('receiveFeedback', {type, errorObj, messageObj});
    }
};

const mutations = {
    toggleFeedbackModal(state, value) {
        state.showFeedbackModal = value;
    },
    receiveFeedback(state, {type, errorObj, messageObj}) {
        const feedbackObject = {};

        if (errorObj) {
            // Convert error response in ArrayBuffer format to string
            if (errorObj.response && errorObj.response.data && errorObj.response.data instanceof ArrayBuffer) {
                try {
                    const decoder = new TextDecoder('utf-8');
                    const errorText = decoder.decode(new Uint8Array(errorObj.response.data));
                    errorObj.response.data = JSON.parse(errorText);
                } catch (error) {
                    console.warn(`Error parsing error response: ${error}`);
                }
            }

            if (errorObj.response && errorObj.response.data && errorObj.response.data.message) {
                feedbackObject.message = _.unescape(`${errorObj.response.data.message}`);
            } else if (errorObj.message) {
                feedbackObject.message = _.unescape(`${errorObj.message}`);
            } else {
                feedbackObject.message = _.unescape(`${errorObj}`);
            }
    
            if (errorObj.response && errorObj.response.data) {
                if (errorObj.response.data.details) {
                    if (Array.isArray(errorObj.response.data.details)) {
                        feedbackObject.details = errorObj.response.data.details.map((detail) => _.unescape(`${detail}`));
                    } else {
                        feedbackObject.details = [_.unescape(`${errorObj.response.data.details}`)];
                    }
                } else {
                    feedbackObject.details = [_.unescape(`${errorObj.response.data}`)];
                }
            } else if (errorObj.details) {
                if (Array.isArray(errorObj.details)) {
                    feedbackObject.details = errorObj.details.map((detail) => _.unescape(`${detail}`));
                } else {
                    feedbackObject.details = [_.unescape(`${errorObj.details}`)];
                }
            } else {
                feedbackObject.details = [];
            }
            state.feedbackObject = feedbackObject;
        } else if (messageObj) {
            state.feedbackObject = messageObj;
        }
    
        state.feedbackType = type;
        state.showFeedbackModal = true;
    },
};

export default {
    state,
    mutations,
    actions,
    getters
};

