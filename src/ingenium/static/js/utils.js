// resuable utilities
ING.utils = ING.utils || {};

ING.utils.csrfToken = function() {
    let cookieVal = document.cookie.match('(^|;)\\s*csrftoken\\s*=\\s*([^;]+)');
    return cookieVal ? cookieVal.pop() : '';
};
