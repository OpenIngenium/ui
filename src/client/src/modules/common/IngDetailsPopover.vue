<template>
    <div style="position: relative;">
        <div @click="showPopover">
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
        name: "IngDetailsPopover",
        props: {
            placement: {
                type: String,
                default: "right"
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
        mounted() {
            document.addEventListener('click', this.handleClickOutside);
        },
        destroyed() {
            document.removeEventListener('click', this.handleClickOutside);
        },
        computed: {
            dynamicPosition: function() {
                let dynamicPosition = {};

                switch(this.placement) {
                    case "top":
                        dynamicPosition.top = `${this.contentHeight * -1 - this.targetHeight}px`;
                        dynamicPosition.left = `${this.contentWidth * -0.5}px`;
                        break;
                    case "right":
                        dynamicPosition.top = `${this.contentHeight * -0.5}px`;
                        dynamicPosition.right = `${this.contentWidth * -1 - this.targetWidth * 2}px`;
                        break;
                    case "bottom":
                        dynamicPosition.top = `${this.targetHeight}px`;
                        dynamicPosition.left = `${this.contentWidth * -0.5}px`;
                        break;
                    case "left":
                        dynamicPosition.top = `${this.contentHeight * -0.5}px`;
                        dynamicPosition.right = `${this.targetWidth * 4}px`;
                        break;
                }

                dynamicPosition.zIndex = 9999;

                return dynamicPosition;
            }
        },
        methods: {
            handleClickOutside(event) {
                if (!this.$el.contains(event.target)) {
                    this.shown = false;
                }
            },
            showPopover: function() {
                this.shown = true;
                // need to wait until content renders to capture width/heights
                this.$nextTick(() => {
                    // content is title + body
                    if(this.$slots.body[0]) {
                        this.contentWidth = this.$slots.body[0].elm.scrollWidth;
                        this.contentHeight = 300; // Fixed height as the modal is now scrollable
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
        max-width: none;
    }
</style>
