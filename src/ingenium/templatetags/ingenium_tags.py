from django import template

register = template.Library()


@register.simple_tag(takes_context=True)
def execution_result_status_css_class(context, execution_record):
    if execution_record.execution_passed():
        return "success"

    if execution_record.execution_error():
        return "danger"

    if execution_record.execution_fail():
        return "warning"

    if execution_record.execution_running():
        return "info"

    if execution_record.execution_skipped():
        return "info"

    return "info"


@register.simple_tag(takes_context=True)
def execution_result_status_icon_class(context, execution_record):
    if execution_record.execution_passed():
        return "glyphicon glyphicon-thumbs-up"

    if execution_record.execution_error():
        return "glyphicon glyphicon-exclamation-sign"

    if execution_record.execution_fail():
        return "glyphicon glyphicon-thumbs-down"

    if execution_record.execution_running():
        return "glyphicon glyphicon-refresh"

    if execution_record.execution_skipped():
        return "glyphicon glyphicon-share-alt"

    return "glyphicon glyphicon-info-sign"


@register.filter
def get_at_index(tpl_list, index):
    val = ""
    try:
        val = tpl_list[index]
    except IndexError:
        pass
    return val

@register.filter
def dash_to_underscore(str_value):
    return str_value.replace("-", "_")