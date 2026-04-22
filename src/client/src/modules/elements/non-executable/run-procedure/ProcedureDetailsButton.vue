<template>
    <div style="position: relative;">
        <ing-details-popover placement="left">
            <template slot="title">
                <h3>{{ data.title }}</h3>
            </template>
            <template slot="body">
                <dl style="min-width: 260px;">
                    <dt>Author</dt>
                    <dd class="procedure-popover-list-item">{{ data.author }}</dd>
                    <dt>Proc. ID</dt>
                    <dd class="procedure-popover-list-item">{{ data.procedure_id }}</dd>
                    <dt>JPL ID</dt>
                    <dd class="procedure-popover-list-item">{{ data.institutional_id }}</dd>
                    <dt>Cur. Ver.</dt>
                    <dd class="procedure-popover-list-item">{{ data.current_version }}</dd>
                    <dt>Created</dt>
                    <dd class="procedure-popover-list-item">{{ data.created_at }}</dd>
                    <dt>Updated</dt>
                    <dd class="procedure-popover-list-item">{{ data.saved_at }}</dd>
                    <dt>Description</dt>
                    <dd class="procedure-popover-list-item">{{ data.description }}</dd>
                    <dt>Current Version</dt>
                    <dd class="procedure-popover-list-item">{{ data.current_version }}</dd>
                    <dt>Created</dt>
                    <dd class="procedure-popover-list-item">{{ data.time_created }}</dd>
                    <dt>Saved/Updated</dt>
                    <dd class="procedure-popover-list-item">{{ data.saved }}</dd>
                </dl>
            </template>
            <button class="btn btn-default">Details</button>
        </ing-details-popover>
    </div>
</template>

<script>
    import IngDetailsPopover from "../../../common/IngDetailsPopover.vue";
    export default {
        name: 'ProcedureDetailsButton',
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


