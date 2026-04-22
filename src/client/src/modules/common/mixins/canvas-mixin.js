const canvasMixin = {
    methods: {        
        resizeListener: function() {
            document.addEventListener('DOMNodeInserted', function() {
                // handle resize left sidebar
                const resizer = document.getElementById('resize-line');
                const left = document.getElementById('execution_page_left') ? 
                    document.getElementById('execution_page_left') : document.getElementById('authoring_page_left');
                const right = document.getElementById('main-panel');
                
                const followHeader = document.getElementById('follow-header-active') ? document.getElementById('follow-header-active') : '';

                let x = 0, y = 0, leftWidth = 0;
        
                // trigger on resize
                const mouseDownHandler = function(e) {
                    x = e.clientX;
                    y = e.clientY;
                    leftWidth = left.getBoundingClientRect().width;
        
                    document.addEventListener('mousemove', mouseMoveHandler);
                    document.addEventListener('mouseup', mouseUpHandler);
                };
        
                const mouseMoveHandler = function(e) {
                    const dx = e.clientX - x;
                    const dy = e.clientY - y;
        
                    const newLeftWidth = (leftWidth + dx) * 100 / resizer.parentNode.getBoundingClientRect().width;
                    left.style.width = `${newLeftWidth}%`;
        
                    if(followHeader){
                        followHeader.style.width = `${right.clientWidth-15}px`;
                    }

                    resizer.style.cursor = 'col-resize';
                    document.body.style.cursor = 'col-resize';
        
                    left.style.userSelect = 'none';
                    left.style.pointerEvents = 'none';
        
                    right.style.userSelect = 'none';
                    right.style.pointerEvents = 'none';
                };
        
                const mouseUpHandler = function() {
                    resizer.style.removeProperty('cursor');
                    document.body.style.removeProperty('cursor');
        
                    left.style.removeProperty('user-select');
                    left.style.removeProperty('pointer-events');
        
                    right.style.removeProperty('user-select');
                    right.style.removeProperty('pointer-events');
        
                    document.removeEventListener('mousemove', mouseMoveHandler);
                    document.removeEventListener('mouseup', mouseUpHandler);
                };
        
                if (resizer) {
                    resizer.addEventListener('mousedown', mouseDownHandler);
                }
            });
        }
    }
};

export default canvasMixin;
