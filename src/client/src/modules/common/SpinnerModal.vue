<template>
    <transition name="modal">
        <div class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-container" role="dialog" aria-describedby="modalDescription">
                    <div class="infinite-loading-container">
                        <component :is="spinnerView"></component>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    const SPINNERS = {
        DEFAULT: {
            render(createElement) {
                return createElement('i', {
                    attrs: {
                        class: 'loading-default',
                    },
                });
            },
        },
    };

    export default {
        name: 'SpinnerModal',
        computed: {
            spinnerView() {
                return SPINNERS.DEFAULT;
            },
        },
    };
</script>

<style scoped>
    /* spinner container */
    .infinite-loading-container {
        clear: both;
        text-align: center;
    }
    .infinite-loading-container >>> *[class^=loading-] {
        display: inline-block;
        margin: 5px 0;
        width: 75px;
        height: 75px;
        font-size: 75px;
        line-height: 75px;
        border-radius: 50%;
    }

    /* default spinner */
    .loading-default {
        position: relative;
        border: 2px solid orange;
        animation: loading-rotating ease 1.5s infinite;
    }
    .loading-default:before {
        content: '';
        position: absolute;
        display: block;
        top: 0;
        left: 50%;
        margin-top: -3px;
        margin-left: -3px;
        width: 6px;
        height: 6px;
        background-color: red;
        border-radius: 50%;
    }
	@keyframes loading-rotating {
		0% {
			transform: rotate(0);
		}
		100% {
			transform: rotate(360deg);
		}
	}

    /* modal */
    .modal-mask {
        position: fixed;
        z-index: 90;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.10);
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
      background-color: rgb(0, 0, 0, 0);
    }
</style>
