// top-level namespace
var ING = ING || {};

// global.js code
ING.main = {};

// external library setup and utilities
ING.external = {};

ING.external.setup_froala_options = function(enable_file_upload, toolbar_set, execution_id, procedure_id, element_id) {
    var wysiwyg_options = {
        "inlineMode": false,
        "key": "AODOd2HLEBFZOTGHW=="
    };

    var toolbarButtons = ['undo', 'redo', 'bold', 'italic', 'underline'];

    // To be consistent we just have precanned sets of toolbars instead of a bunch of if else
    if (toolbar_set === "basic") {
        toolbarButtons = ['undo', 'redo', 'bold', 'italic', 'underline'];
    } else if (toolbar_set === "standard") {
        toolbarButtons = ['undo', 'redo', 'bold', 'italic', 'underline', 'insertTable', 'strikeThrough', 'subscript', 'superscript', 'formatOL', 'formatUL', 'indent', 'outdent', 'align', 'fontFamily', 'fontSize', 'colors', 'insertLink', 'specialCharacters', 'paragraphStyle'];
    }

    // Enable File Upload
    if (enable_file_upload) {
        toolbarButtons.push('insertImage');
        toolbarButtons.push('insertFile');

        wysiwyg_options['fileUpload'] = true;
        wysiwyg_options['fileMaxSize'] = 1024 * 1024 * 100;
        wysiwyg_options['imageUpload'] = true;
        wysiwyg_options['imageMaxSize'] = 1024 * 1024 * 50;
        wysiwyg_options['imageUploadParams'] = {
            "execution_id": execution_id,
            "procedure_id": procedure_id,
            "element_id": element_id,
            "csrfmiddlewaretoken": getCookie("csrftoken")
        };
        wysiwyg_options['fileUploadParams'] = {
            "csrfmiddlewaretoken": getCookie("csrftoken"),
            "execution_id": execution_id,
            "procedure_id": procedure_id,
            "element_id": element_id
        };
        wysiwyg_options['fileUploadURL'] = FILE_UPLOAD_URL;
        wysiwyg_options['imageUploadURL'] = IMAGE_UPLOAD_URL;

    } else {
        wysiwyg_options['fileUpload'] = false;
        wysiwyg_options['imageUpload'] = false;
    }

    // Set Toolbar buttons in options
    wysiwyg_options['toolbarButtons'] = toolbarButtons;

    return wysiwyg_options;
};

ING.main.mutationListeners = function() {
    $(document).on('up.added', 'form#comment_form', function (event, element) {
        /* because we're listening to 'document' for up.added and then rely on event bubbling to alert us when an
         * $element was added to the document, we must make sure that the $element we get back is the same $element
         * that we're listening for, and not a child of the $element that we're listening for */
        if (this === element) {
            $(this).each(function () {

                var $form = $(this),
                    $content = $form.parent('div.add_comment'),
                    $editor = $form.find('textarea#id_comment'),
                    $submit = $form.find('button#comment_form_submit'),
                    element_id = $form.find('input[name="element_id"]'),
                    $step_comment = $form.closest('.step_comment'),
                    $comment_badge_count = $form.closest(".step, .step_history").first().find('.comment_badge_count'),
                    execution_id = $form.find('input[name="execution_id"]');

                var enable_file_upload = $form.data('enable_file_upload');
                var toolbar_set = $form.data('toolbar_set');

                // Initialize WYSIWYG
                $editor.froalaEditor(ING.external.setup_froala_options(enable_file_upload, toolbar_set, execution_id.val(), element_id.val()));

                $submit.on('click', function () {
                    $.ajax({
                        beforeSend: function (xhr) {
                            $content.notify_status('saving', {background: 'transparent', small: true});
                            xhr.setRequestHeader('X-CSRFToken', ING.utils.csrfToken());
                        },
                        url: $submit.data('url'),
                        method: 'POST',
                        data: $form.serialize(),
                        dataType: 'JSON',
                        success: function (result) {
                            $editor.froalaEditor('html.set', '');
                            $content.notify_status('hide');
                            $step_comment.html(result.html);
                            $comment_badge_count.html(result.count);
                        },
                        error: function () {
                            $.notify_status('error', {dismissible: true, details: 'Please try again'});
                            $content.notify_status('hide');
                        }
                    });
                });

            });
        }
    });

    /**
     * Initialize CanvasJS on any elements with class 'graph_eha_chart'.  There is probably a better place for this, but
     * this will do for now.  This chart is rendered (or will eventually be rendered) in Execution, Authoring, History,
     * Chronological, and As Run views, but the initialization function remains constant in all situations.  Thus, we needed
     * a global place to house it.
     */
    $(document).on('up.added', '.graph_eha_chart', function (event, element) {
        /* because we're listening to 'document' for up.added and then rely on event bubbling to alert us when an
         * $element was added to the document, we must make sure that the $element we get back is the same $element
         * that we're listening for, and not a child of the $element that we're listening for */
        if (this === element) {
            $(element).each(function (index, graph_eha_chart) {

                var data_points = $(graph_eha_chart).data('data-points');

                /* save x value as label; convert iso 8601 to javascript date object */
                for (var i = 0; i < data_points.length; i++) {
                    var moment_date = moment(data_points[i].x);
                    data_points[i]['label'] = data_points[i].x;
                    data_points[i].x = moment_date.toDate();
                }

                /* default colors */
                var colors = {light: '#aaa', dark: '#333'};

                /* change colors if inside alert */
                var $alert = $(graph_eha_chart).closest('.alert');
                if ($alert.length) {
                    if ($alert.hasClass('alert-success')) {
                        colors = {light: '#9bcc9b', dark: '#3c763d'};
                    } else if ($alert.hasClass('alert-info')) {
                        colors = {light: '#97c5dc', dark: '#31708e'};
                    } else if ($alert.hasClass('alert-warning')) {
                        colors = {light: '#dbc5a9', dark: '#8a6d3b'};
                    } else if ($alert.hasClass('alert-danger')) {
                        colors = {light: '#e3bfbd', dark: '#a94442'};
                    }
                }

                var chart = new CanvasJS.Chart(graph_eha_chart, {
                    animationEnabled: true,
                    backgroundColor: 'transparent',
                    zoomEnabled: true,
                    axisX: {
                        labelAngle: 315,
                        labelFontColor: colors.dark,
                        labelFontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                        labelFontSize: 13,
                        labelFormatter: function (e) {
                            return moment(e.value).format('YYYY-DDDTHH:mm');
                        },
                        lineColor: colors.light,
                        tickColor: colors.light,
                        tickThickness: 1
                    },
                    axisY: {
                        gridColor: colors.light,
                        gridThickness: 1,
                        labelFontColor: colors.dark,
                        labelFontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                        labelFontSize: 13,
                        lineColor: colors.light,
                        includeZero: false,
                        tickColor: colors.light,
                        tickThickness: 1
                    },
                    data: [{
                        type: 'line',
                        lineColor: '#ce8500',
                        lineThickness: 5,
                        markerColor: '#a06700',
                        dataPoints: data_points
                    }]
                });

                chart.render();

            });
        }
    });
};

/* Handle global initialization */
ING.main.init = function() {
    $.fn.editable.defaults.mode = 'inline';
    ING.main.mutationListeners();
};

ING.main.init();
