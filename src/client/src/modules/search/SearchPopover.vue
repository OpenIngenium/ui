<template>
    <div style="position: relative;">
        <div @mouseover="showPopover" @mouseleave="closePopover">
            <div v-show="shown" :class="[placement, 'popover']" :style="dynamicPosition">
                <div class="arrow"></div>
                <h3 class="popover-title"><slot name="title"></slot></h3>
                <div class="popover-content">
                    <slot name="body"></slot>
                </div>
            </div>
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: "SearchPopover",
        props: {
            placement: {
                type: String,
                default: "bottom"
            }
        },
        data() {
            return {
                shown: false,
                contentWidth: 0,
                contentHeight: 0,
                targetWidth: 0,
                targetHeight: 0
            };
        },
        computed: {
            dynamicPosition: function() {
                let dynamicPosition = {};

                switch(this.placement) {
                    case "top":
                        dynamicPosition.top = `${this.contentHeight * -1 - this.targetHeight - 65}px`;
                        dynamicPosition.left = `${this.contentWidth * -0.5 - 95}px`;
                        break;
                    case "bottom":
                        dynamicPosition.top = `${this.targetHeight + 30}px`;
                        dynamicPosition.left = `${this.contentWidth * -0.5 - 95}px`;
                        break;
                }

                dynamicPosition.zIndex = 9999;

                return dynamicPosition;
            }
        },
        methods: {
            showPopover: function() {
                this.shown = true;
                // need to wait until content renders to capture width/heights
                this.$nextTick(() => {
                    // content is title + body
                    if(this.$slots.body[0]) {
                        this.contentWidth = this.$slots.body[0].elm.scrollWidth;
                        this.contentHeight = this.$slots.body[0].elm.scrollHeight + 32;  // 32 is default title height
                    }

                    // target is the eye icon
                    if(this.$slots.default[2]) {
                        this.targetWidth = this.$slots.default[2].elm.scrollWidth;
                        this.targetHeight = this.$slots.default[2].elm.scrollHeight;
                    }
                });
            },
            closePopover: function() {
                this.shown = false;
            }
        }
    };
</script>

<style scoped>
    .popover-title {
        color: #5A5A5A;
        font-weight: normal;
    }
    .popover {
        position: absolute;
        left: auto;
        display: block;
        width: 200px;
    }
</style>
