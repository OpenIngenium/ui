<template>
    <div class="vsb">
        <button 
            class="toggle_button expand-collapse-toggle" 
            @click="$emit('setViewState', 3)" 
            data-toggle="tooltip" 
            data-placement="top"
            data-trigger="hover" 
            onclick="$(this).tooltip('hide');"
            :title="tooltips.auth_exec_all_level_3">
            <svg width="25px" height="25px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g id="detail3_icon_dark_30pt" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <rect id="Rectangle-6-Copy-10" :stroke="[ this.level == 3 ? 'black' : '#808080']" stroke-width="2" x="4" y="4" width="22" height="22" rx="2"/>>
                    <rect id="Rectangle-7-Copy-11" :fill="[ this.level == 3 ? 'black' : '#808080']" x="9" y="9" width="12" height="2"/>
                    <rect id="Rectangle-7-Copy-12" :fill="[ this.level == 3 ? 'black' : '#808080']" x="13" y="14" width="8" height="2"/>
                    <rect id="Rectangle-7-Copy-14" :fill="[ this.level == 3 ? 'black' : '#808080']" x="9" y="14" width="2" height="2"/>
                    <rect id="Rectangle-7-Copy-15" :fill="[ this.level == 3 ? 'black' : '#808080']" x="9" y="19" width="2" height="2"/>
                    <rect id="Rectangle-7-Copy-13" :fill="[ this.level == 3 ? 'black' : '#808080']" x="13" y="19" width="8" height="2"/>
                </g>
            </svg>
        </button>
        <button 
            class="toggle_button expand-collapse-toggle" 
            @click="$emit('setViewState', 2)" 
            data-toggle="tooltip" 
            data-placement="top"
            data-trigger="hover" 
            onclick="$(this).tooltip('hide');"
            :title="tooltips.auth_exec_all_level_2">
            <svg width="25px" height="25px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g id="detail2_icon_dark_30pt" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <rect id="Rectangle-6-Copy-10" :stroke="[ this.level == 2 ? 'black' : '#808080']"  stroke-width="2" x="4" y="4" width="22" height="22" rx="2"/>
                    <rect id="Rectangle-7-Copy-11" :fill="[ this.level == 2 ? 'black' : '#808080']" x="9" y="9" width="12" height="2"/>
                    <rect id="Rectangle-7-Copy-12" :fill="[ this.level == 2 ? 'black' : '#808080']" x="13" y="14" width="8" height="2"/>
                    <rect id="Rectangle-7-Copy-14" :fill="[ this.level == 2 ? 'black' : '#808080']" x="9" y="14" width="2" height="2"/>
                </g>
            </svg>
        </button>
        <button 
            class="toggle_button expand-collapse-toggle" 
            @click="$emit('setViewState', 1)" 
            data-toggle="tooltip" 
            data-placement="top"
            data-trigger="hover" 
            onclick="$(this).tooltip('hide');"
            :title="tooltips.auth_exec_all_level_1">
            <svg width="25px" height="25px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g id="detail1_icon_dark_30pt" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <rect id="Rectangle-6-Copy-10" :stroke="[ this.level == 1 ? 'black' : '#808080']"  stroke-width="2" x="4" y="4" width="22" height="22" rx="2"/>
                    <rect id="Rectangle-7-Copy-11" :fill="[ this.level == 1 ? 'black' : '#808080']" x="9" y="9" width="12" height="2"/>
                </g>
            </svg>
        </button>
    </div>
</template>

<script>
    let TOOLTIPS = require('../common/tooltip-config');
    export default { 
        name: "ViewStateButtons",
        props: {
            level: {
                type: Number
            }
        },
        computed: {
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            },
        }
    };
</script>

<style lang="scss" scoped>
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

    @media print {
        .vsb {
            display: none;
        }
    }
</style>

