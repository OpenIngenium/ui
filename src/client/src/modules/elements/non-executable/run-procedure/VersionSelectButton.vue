<template>
    <button v-if="canSelectVersion" class="btn btn-primary" @click="$emit('tableEvent', selectVersionEvent)">Choose</button>
    <div v-else>Cannot nest a working version in procedure</div>
</template>

<script>
    import { mapGetters } from "vuex";
    export default {
        name: 'VersionSelectButton',
        props: {
            data: {
                type: Object
            }
        },
        computed: {
            ...mapGetters([
                "isAuthoringMode",
            ]),
            selectVersionEvent() {
                return {
                    action: 'selectVersion',
                    data: {
                        procedure_id: this.data.procedure_id,
                        version: this.data.version,
                        version_author: this.data.version_author,
                        institutional_release_id: this.data.institutional_release_id,
                        version_description: this.data.version_description,
                        time_versioned: this.data.time_versioned
                    }
                };
            },
            canSelectVersion() {
                return this.isAuthoringMode && this.data.version === 0 ? false : true;
            }
        }
    };
</script>


<style lang="scss" scoped>

</style>
