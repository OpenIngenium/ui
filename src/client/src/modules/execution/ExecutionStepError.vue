<template>
    <div>
        <div class="alert error-message" :class="messageClass">
            <div class="error-header-area">
                <b style="font-weight: bold; color: #a94442;">
                    <span class="glyphicon glyphicon-exclamation-sign" style="float:left; margin-top:2px; margin-right:5px;"></span>
                    {{ messageTitle }}
                </b>
                <span class="error-collapse" v-on:click="toggleDetail" style="cursor:pointer;">
                    Details
                    <i :class="iconClass"></i>
                </span>
            </div>
            <p style="white-space: pre-wrap;">Message: {{ message }}</p>
            <div>
                <p class="error-type" v-if="isError">
                    Error Type: {{error_type}}<br>
                    Source: {{ error_source }}, HTTP Response: {{ http_code_at_source }}
                </p>
                <p v-if="expanded">Details: 
                    <pre><code>{{ details.length > 0 ? details.join("\n") : "Not available" }}</code></pre>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ExecutionStepError",
        data() {
            return {
                expanded: true
            };
        },
        props: {
            metaData: {
                type: Object,
                required: true
            },
        }, 
        computed: {
            iconClass: function() {
                return this.expanded ? 'glyphicon glyphicon-menu-up' : 'glyphicon glyphicon-menu-down';
            },
            status: function() {
                if (this.metaData && this.metaData.status) {
                    return this.metaData.status;
                } else {
                    return '';
                }
            },
            status_message: function() {
                if (this.metaData && this.metaData.status_message) {
                    return this.metaData.status_message;
                } else {
                    return '';
                }
            },
            message: function() {
                if (this.metaData && this.metaData.error && this.metaData.error.message) {
                    return this.metaData.error.message;
                } else {
                    return '';
                }
            },
            error_type: function() {
                if (this.metaData && this.metaData.error && this.metaData.error.error_type) {
                    return this.metaData.error.http_code_at_source;
                } else {
                    return '';
                }
            },
            error_source: function() {
                if (this.metaData && this.metaData.error && this.metaData.error.error_source) {
                    return this.metaData.error.error_source;
                } else {
                    return '';
                }
            },
            http_code_at_source: function() {
                if (this.metaData && this.metaData.error && this.metaData.error.hasOwnProperty('http_code_at_source')) {
                    return this.metaData.error.http_code_at_source;
                } else {
                    return '';
                }
            },
            details: function() {
                if (this.metaData && this.metaData.error && this.metaData.error.details) {
                    return this.metaData.error.details;
                } else {
                    return [];
                }
            },
            isError: function() {
                return this.status === 'ERROR';
            },
            isFail: function() {
                return this.status === 'FAIL';
            },
            messageClass: function() {
                if (this.status === 'ERROR') {
                    return 'alert-danger';
                } else if (this.status === 'FAIL') {
                    return 'alert-warning';
                } else {
                    return '';
                }
            },
            messageTitle: function() {
                if (this.status === 'ERROR') {
                    return 'Step Error';
                } else if (this.status === 'FAIL') {
                    return 'Step Failed';
                } else {
                    return '';
                }
            }
        },
        methods: {
            toggleDetail: function() {
                this.expanded = !this.expanded;
            }
        }
    };
</script>

<style lang="scss" scoped>

.error-header-area {
    margin-bottom: 5px;
}

.error-message {
    word-wrap: break-word;
}

.error-type, .error-collapse  {
    display: inline;
}

div .alert {
    margin-top: 5px;
    margin-bottom: 5px;
}

p {
    margin-top: 5px;
}

span {
    float: right; 
}


</style>