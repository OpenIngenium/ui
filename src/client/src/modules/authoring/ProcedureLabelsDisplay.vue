<template>
    <div class="wrap-label">
        <span
            v-for="label in data.labels" :key="label.name"
            style="margin: 0px 2px; cursor: default; font-size: 90%; min-width: 64px;"
            class="label btn-primary">
            {{ label.name | truncate(64) }}
        </span>
    </div>
</template>

<script>
    import {truncate} from "../common/filters";
    export default {
        name: "ProcedureLabelsDisplay",
        props: {
            data: {
                type: Object,
            }
        },
        filters: {
            truncate: truncate
        },
    };
</script>

<style scoped>
.wrap-label {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
}

.wrap-label .label {
  word-break: break-all;   
  white-space: normal;     
  max-width: 100%;         
}

</style>
