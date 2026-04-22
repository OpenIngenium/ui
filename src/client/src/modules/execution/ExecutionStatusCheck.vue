<template>
    <span v-if="shouldDisplay" :class="[statusColor, dynamicIcon, 'glyphicon']"></span>
</template>

<script>
    export default {
        name: "ExecutionStatusCheck",
        props: {
            executed: {
                type: Boolean,
                required: true
            },
            status: {
                type: String,
                required: true
            },
            componentType: {
                type: String,
                required: false,
                default: "element"
            }
        },
        computed: {
            dynamicIcon: function() {
                if(this.status === "PASS") {
                    return "glyphicon-ok";
                } else {
                    return "glyphicon-remove";
                }
            },
            statusColor: function() {
                if(this.status === "PASS") {
                    return "green";
                } else if(this.componentType === "element" && this.status === "FAIL") {
                    return "orange";
                } else if(this.componentType === "entry" && this.status === "FAIL") {
                    return "red";
                } else if(this.status === "ERROR") {
                    return "red";
                }
            },
            shouldDisplay: function() {
                return this.executed && this.status !== "";
            }
        }
    };
</script>

<style lang="scss" scoped>
    span.glyphicon {
        float: right;
        font-size: 18px;
    }
    .green {
        color: #A3DE5F;
    }

    .orange {
        color: #F2A900;
    }

    .red {
        color: #FF585C;
    }

</style>
