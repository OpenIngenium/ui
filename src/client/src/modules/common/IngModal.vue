<template>
    <transition name="modal">
        <div class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-container" :class="size"
                     role="dialog"
                     aria-describedby="modalDescription"
                     :style="calculatedModalContainerStyle">
                    <header class="modal-header">
                        <button
                            type="button"
                            class="close"
                            @click="close"
                            aria-label="Close modal"
                            style="float: right;">×</button>
                        <slot name="title"></slot>
                    </header>
                    <section class="modal-body" :style="{overflowY: overflowY, minHeight: minHeight}">
                        <slot name="body"></slot>
                    </section>
                    <footer class="modal-footer">
                        <slot name="footer">
                            <button
                                type="button"
                                class="btn btn-primary"
                                @click="close"
                                aria-label="Close modal">
                                Yes
                            </button>
                        </slot>
                    </footer>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        name: "IngModal",
        props: {
            size: {
                type: String,
                default: 'medium'
            },
            overflowY: {
                type: String,
                default: 'auto'
            },
            fixedHeight: {
                type: String,
                default: ''
            },
            minHeight: {
                type: String,
                default: ''
            }
        },
        data() {
            return {};
        },
        computed: {
            calculatedModalContainerStyle: function() {
                const retVal = {};
                if (this.fixedHeight !== '') {
                    return { height: this.fixedHeight };
                }
                return retVal;
            },
        },
        methods: {
            close: function() {
                this.$emit("close");
            }
        }
    };
</script>

<style scoped>
    .modal-mask {
      position: fixed;
      z-index: 90;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, .5);
      display: table;
      transition: opacity .1s ease;
    }

    .modal-wrapper {
      display: table-cell;
      vertical-align: middle;
    }

    .modal-container {
      margin: 0 auto;
      padding: 0;
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, .5);
      transition: all .3s ease;
      font-family: Helvetica, Arial, sans-serif;
      max-height: calc(100vh - 210px);
      overflow-y: auto;
    }

    .large {
      min-width: 1250px;
      max-width: 75%;
    }
    
    .medium-large {
        width: 750px;
    }

    .medium {
      width: 500px;
    }

    .small {
      width: 300px;
    }

    .modal-header {
      padding: 15px;
      border-bottom: 1px solid #e5e5e5;
      color: #000000;
    }

    /* does not seem to work, using inine styles for now */
    .modal-header h4 {
      display: inline-block;
      color: #000000;
      font-weight: bold;
    }

    .modal-body {
      position: relative;
      padding: 15px 20px;
      color: #000000;
      max-height: calc(100vh - 210px);
    }

    .modal-footer {
      padding: 15px;
      text-align: right;
      border-top: 1px solid #e5e5e5;
      color: #000000;
    }

    /*
     * The following styles are auto-applied to elements with
     * transition="modal" when their visibility is toggled
     * by Vue.js.
     *
     * You can easily adjust the modal transition by editing
     * these styles.
     */

    .modal-enter {
      opacity: 0;
    }

    .modal-leave-active {
      opacity: 0;
    }

    .modal-enter .modal-container,
    .modal-leave-active .modal-container {
      -webkit-transform: scale(1.1);
      transform: scale(1.1);
    }
</style>
