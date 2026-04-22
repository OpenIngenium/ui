<template>
    <div data-toggle="toggle" :class="toggleClasses" :style="toggleStyle">
        <div class="toggle-group" v-on:click="onToggle">
            <label class="btn btn-primary toggle-on" :class="sizeClass" :disabled="disable">{{onName}}</label>
            <label class="btn btn-default active toggle-off" :class="sizeClass" :disabled="disable">{{offName}}</label>
            <span class="toggle-handle btn btn-default" :class="sizeClass" :disabled="disable"></span>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'IngToggle',
        props: {
            value: {
                type: Boolean,
                required: true
            },
            clickHandler: {
                type: Function,
                required: true
            },
            onName: {
                type: String,
                default: 'On'
            },
            offName: {
                type: String,
                default: 'Off'
            },
            sizeClass: {
                type: String,
                default: ''
            },
            customStyle: {
                type: String,
                default: ''
            },
            disable: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {};
        },
        computed: {
            toggleClasses() {
                return this.value ? `toggle btn btn-primary ${this.sizeClass}` : `toggle btn btn-default off ${this.sizeClass}`;
            },
            toggleStyle() {
                const width = 12 * Math.max(this.onName.length, this.offName.length);
                return `width: ${width}px; ${this.customStyle}`;
            }       
        },
        methods: {
            onToggle() {
                if (this.disable) {
                    return;
                }
                this.clickHandler();
            }
        }
    };
</script>

<style src="bootstrap-toggle/css/bootstrap-toggle.css"/>
