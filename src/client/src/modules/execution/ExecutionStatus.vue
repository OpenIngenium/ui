<template>
    <div class="alert alert-info status-message">
        <p style="white-space: pre-wrap;"><img class="loading-icon" src="/static/images/loading_2.gif" > Executing: {{ status }}</p>
    </div>
</template>

<script>
    export default {
        name: "ExecutionStatus",
        data() {
            return {
                expanded: false
            };
        },
        props: {
            status: {
                type: String,
                default: "Executing element...",
                required: true
            }
        }, 

        methods: {
            toggleIcon: function() {
                if (this.expand === 'full') {
                    this.lightRed = 'small';
                } else if (this.lightRed === 'small') {
                    this.lightRed = 'full';
                }
            }
        }
    };
</script>

<style lang="scss" scoped>

.status-header-area {
    margin-bottom: 5px;
}

.status-message {
    word-wrap: break-word;
}

.status-type, .status-collapse  {
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

.expand-collapse-toggle {
    display: block;
    text-indent: -9999px;
    width: 25px;
    background-color: transparent;
    border: none;
    height: 25px;
    fill: inherit;
    background-size:25px 25px;
    svg {
        display: block;
    }   
}

.loading-icon {
    width:20px;
    height:20px;
}
</style>