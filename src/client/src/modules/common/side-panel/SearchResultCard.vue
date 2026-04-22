<template functional>
    <div class="search-result">
        <div 
            v-if="$options.showReplaceButton(props)"
            style="float:right;">
            <button 
                data-toggle="tooltip" 
                data-placement="top"
                data-trigger="hover" 
                onclick="$(this).tooltip('hide');"
                title="Replace"
                @click="$options.performReplace(props)" 
                type="btn btn-primary">
                <i class="glyphicon glyphicon-refresh"></i>
            </button>            
        </div>
        <div v-if="props.data.replaced" style="float: right; color: #008000;">
            <i 
                data-toggle="tooltip" 
                data-placement="top"
                data-trigger="hover" 
                onclick="$(this).tooltip('hide');"
                title="Replaced"
                class="glyphicon glyphicon-ok"></i>
        </div>
        <p>
            <b><a href="#" @click="props.jumpToStep(props.data.elem_id, $event)">{{ props.data.number }}</a></b> {{ props.data.title }}<br>
            Step type: {{ $options.stepType(props) }}<br>
            Field: {{ props.data.field_path }}<br>
            Content: 
        </p>
        <ul style="padding: 0px;">
            <li 
                style="list-style-type: none;"
                v-for="(match_text, index) in props.data.match_texts" 
                :key="index">
                {{ props.data.field_text.substring(match_text.start_index - 20, match_text.start_index) }}<span style="background-color:yellow;">{{ match_text.text }}</span>{{ props.data.field_text.substring((match_text.start_index + match_text.length), (match_text.start_index + match_text.length) + 20) }}
            </li>
        </ul>
    </div>
</template>

<script>

    import TextHighlight from 'vue-text-highlight';

    export default {
        name: "SearchResultCard",
        components: {
            "text-highlight": TextHighlight
        },
        props: {
            data: {
                type: Object,
                required: true
            },
            index: {
                type: Number,
                required: true
            },
            jumpToStep: {
                type: Function
            },
            handleReplace: {
                type: Function
            },
            editMode: {
                type: Boolean
            }            
        },
        stepType: function(props) {
            return props.data.step_type || props.data.elem_type;

        },
        showReplaceButton: function(props) {
            return props.data.replaceable && !props.data.replaced && props.editMode;
        },
        performReplace: function(props) {
            return props.handleReplace({
                elem_id: props.data.elem_id,
                number: props.data.number,
                field_path: props.data.field_path,
                is_html: props.data.is_html
            });

        }

    };
</script>

<style type="scss" scoped>
    .search-result {
        border: 1px solid lightgray;
        border-radius: 5px;
        padding: 10px;
        margin-top: 10px;
    }
    .search-result p {
        margin: 0px;
    }
    li { background-color: white; }
    li:nth-child(odd) { background: #f6f6f6; }
</style>