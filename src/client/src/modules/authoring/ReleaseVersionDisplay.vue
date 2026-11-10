<template>
    <span>{{currentReleasedVersion}}</span>
</template>

<script>
    export default {
        name: "ReleaseVersionDisplay",
        props: {
            data: {
                type: Object,
            }
        },
        computed: {
            currentReleasedVersion() {
                if (this.data.current_released_version) {
                    return this.data.current_released_version;
                }
                return '';
            },
        },
    };
</script>

<style scoped></style>
