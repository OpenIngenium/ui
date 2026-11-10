<template>
    <span>
        <template>
            <a v-if="$can('update', 'Basic')" :href="versionUrl" @click.stop.prevent="$emit('tableEvent', selectProcedureVersion)">
                {{versionDisplay}}
            </a>
            <span v-else>
                {{versionDisplay}}
            </span>
        </template>
    </span>
</template>

<script>
    import {mapGetters} from 'vuex';
    import {getUsername} from "../common/utils";

    export default {
        name: 'SelectProcedureVersionButton',
        props: {
            data: {
                type: Object,
            },
        },
        computed: {
            ...mapGetters([
                'authoringProcedure',
            ]),
            _authoringProcedure: function() {
                return this.authoringProcedure();
            },
            username: function() {
                return getUsername();
            },
            lockedBy: function() {
                let retVal = '';
                if (this._authoringProcedure) {
                    retVal = this._authoringProcedure.locked_by;
                }
                return retVal;
            },
            procedureId() {
                return this.data.procedure_id;
            },
            versionDisplay() {
                return this.data.version === 0 ? 'View working version' : this.data.version;
            },
            version() {
                return this.data.version;
            },
            versionUrl() {
                return `/authoring/${this.data.procedure_id}/${this.data.version}`;
            },
            selectProcedureVersion() {
                const eventObj = {
                    action: 'selectProcedureVersion',
                    data: {
                        procedure_id: this.procedureId,
                        version: this.version
                    },
                };
                return eventObj;
            },
        },
    };
</script>

<style lang="scss" scoped></style>
