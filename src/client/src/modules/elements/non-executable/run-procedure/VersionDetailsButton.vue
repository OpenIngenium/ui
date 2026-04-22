<template>
    <div style="position: relative;">
        <ing-details-popover placement="left" style="z-index: 9999;">
            <template slot="title">
                <h5>Version Details - {{data.version}}</h5>
                <span style="display: block; font-size: 12px;">{{ data.version_id }}</span>
            </template>
            <template slot="body">
                <dl style="min-width: 260px;">
                    <dt>Author</dt>
                    <dd class="procedure-popover-list-item">{{ data.version_author }}</dd>
                    <dt>Proc. ID</dt>
                    <dd class="procedure-popover-list-item">{{ data.procedure_id }}</dd>
                    <dt>JPL ID</dt>
                    <dd class="procedure-popover-list-item">{{ data.institutional_release_id }}</dd>
                    <dt>API Version</dt>
                    <dd class="procedure-popover-list-item">{{ data.api_version }}</dd>
                    <dt>Released</dt>
                    <dd class="procedure-popover-list-item">{{ data.time_versioned }}</dd>
                    <dt>Versioned</dt>
                    <dd class="procedure-popover-list-item">{{ data.time_saved }}</dd>
                    <dt>Description</dt>
                    <dd class="procedure-popover-list-item">{{ data.version_description }}</dd>
                    <dt>Saved/Updated</dt>
                    <dd class="procedure-popover-list-item">{{ data.time_saved }}</dd>
                </dl>
            </template>
            <button class="btn btn-default">Details</button>
        </ing-details-popover>
    </div>
</template>

<script>
    import IngDetailsPopover from "../../../common/IngDetailsPopover.vue";
    export default {
        name: 'VersionDetailsButton',
        components: {
            IngDetailsPopover
        },
        data() {
            return {};
        },
        props: {
            data: {
                type: Object
            }
        }
    };
</script>
