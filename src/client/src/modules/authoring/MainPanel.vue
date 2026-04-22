<template>
<!-- Padding bottom 135px gives room for drop target for steps -->
    <div class="col-xs-12" id="main-panel" style="padding-left:0px; padding-bottom:135px">
        <ing-element-wrapper
            :showElementWrapper="false"></ing-element-wrapper>
        
        <!-- FOOTER -->
        <ing-footer></ing-footer>
    </div>
</template>

<script>
    import IngFooter from "../common/IngFooter.vue";

    export default {
        name: "MainPanel",
        components: {
            'ing-footer': IngFooter
        },
    };
</script>

<style scoped>
#main-panel {
    overflow: hidden;
}
</style>
