<template>
    <div :style="{display: 'inline'}">
        <span :class="[statusColor, 'status-dot']" :style="{marginBottom: '-2px', marginRight: '5px'}"></span>
        <template v-if="includeLabel">
            {{ status | titlecase }}
        </template>
    </div>
</template>

<script>
    import { titlecase } from "./filters";

    export default {
        name: "VenueStatusDot",
        props: {
            status: {
                type: String,
                required: true
            },
            includeLabel: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            isAvailable: function() {
                return this.status === "AVAILABLE";
            },
            isInUse: function() {
                return this.status === "IN_USE";
            },
            isDown: function() {
                return this.status === "DOWN";
            },
            statusColor: function() {
                if(this.isAvailable) {
                    return "status-dot-green";
                } else if(this.isInUse) {
                    return "status-dot-yellow";
                } else if(this.isDown) {
                    return "status-dot-red";
                } else {
                    return "status-dot-grey";
                }
            }
        },
        filters: {
            titlecase
        }
    };
</script>
