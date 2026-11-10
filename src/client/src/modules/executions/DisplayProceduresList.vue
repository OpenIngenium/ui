<template>
    <div class="wrap">
        <div v-for="item in data.used_procedures" :key="item.id">
            <div v-if="item.procedure_id">
                <a :href="getUrl(item.procedure_id, item.version)">
                    {{ item.procedure_id }}, ver.{{ item.version }}
                </a>
                <div v-if="item.institutional_id && item.institutional_release_id" class="instId">
                    ({{ item.institutional_id }}, {{ item.institutional_release_id }})
                </div>
                <div v-else-if="item.institutional_id" class="instId">
                    ({{ item.institutional_id }})
                </div>
                <div v-else-if="item.institutional_release_id" class="instId">
                    ({{ item.institutional_release_id }})
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'DisplayProceduresList',
        props: {
            data: {
                procedureIds: Object,
            },
        },
        methods: {
            getUrl(id, version) {
                return `/authoring/${id}/${version}`;
            },
        }
    };
</script>

<style lang="scss" scoped>
    .wrapper {
        display: flex;
    }
    .instId{
        display: inline-block;
    }
</style>
