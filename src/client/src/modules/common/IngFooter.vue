<template>
    <div>
        <p style="text-align: center; font-size: 12px; color:gray; margin-top:100px" v-html="footerText"></p>
    </div>
</template>

<script>
    export default {
        name: "IngFooter",
        computed: {
            footerText() {
                return window.uiCustomFooter || "";
            }
        }
    };
</script>
