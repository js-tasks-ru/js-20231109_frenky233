export default class SortableList {
    element;
    currentMovingElement;
    placeholderElement;
    
    constructor(data = []){
        this.items = data.items;
        
        this.prevHolderPosition = 0;
        this.element = this.createElement();
        this.addEventListener();
    }

    createTemplate(){
        return `
        <ul class="sortable-list">
            ${this.items.map(item => 
                {
                    item.classList.add('sortable-list__item');
                    return item.outerHTML;
                }).join('')}
        </ul>`;
    }

    createElement(){
        const element = document.createElement('div');
        element.innerHTML = this.createTemplate();

        return element.firstElementChild;
    }

    createPlaceholderTemplate(width, height){
        return `<div class="sortable-list__placeholder" style="width:${width}px; height:${height}px"></div>`
    }

    createPlaceholderElement(width, height){
        const element = document.createElement('div');
        element.innerHTML = this.createPlaceholderTemplate(width, height);

        return element.firstElementChild;
    }

    addEventListener(){
        this.element.addEventListener('pointerdown', this.onDeleteHandlerPointerDown);
        this.element.addEventListener('pointerdown', this.onDragHandlerPointerDown);
    }

    removeEventListener(){
        this.element.removeEventListener('pointerdown', this.onDeleteHandlerPointerDown);
        this.element.removeEventListener('pointerdown', this.onDragHandlerPointerDown);
    }

    onDragHandlerPointerDown = (event) =>{
        const targetElement = event.target;

        if(!('grabHandle' in targetElement.dataset)) return;

        const listElement = targetElement.closest('.sortable-list__item');

        this.initDragNDrop(event.clientX, event.clientY, listElement)   

        document.addEventListener('pointermove', this.onDragHandlerPointerMove);
        document.addEventListener('pointerup', this.onDragHandlerPointerUp);
    }

    initDragNDrop(clientX, clientY, element){
        this.calcShifts(clientX, clientY, element);
        this.replaceDraggingElement(element);

        this.currentMovingElement.ondragstart = () => {return false};
        this.moveElementAt(clientX, clientY);
    }

    replaceDraggingElement(element){
        const width = element.getBoundingClientRect().width;
        const height = element.getBoundingClientRect().height;

        this.currentMovingElement = element.cloneNode(true);
        this.element.append(this.currentMovingElement);
        
        this.currentMovingElement.style.width = width + 'px';
        this.currentMovingElement.style.height = height + 'px';
        this.currentMovingElement.classList.add('sortable-list__item_dragging');

        element.replaceWith(this.createPlaceholderElement(width, height));
        this.placeholderElement = this.element.querySelector('.sortable-list__placeholder');
    }

    calcShifts(clientX, clientY, element){
        this.shiftX = clientX - element.getBoundingClientRect().left;
        this.shiftY = clientY - element.getBoundingClientRect().top;
    }

    onDragHandlerPointerMove = (event) =>{
        this.moveElementAt(event.clientX, event.clientY);
        
        let verticalShift = Math.round(((event.clientY - this.element.getBoundingClientRect().top - this.currentMovingElement.clientHeight / 2) / this.element.clientHeight) * (this.element.children.length - 1));
        
        verticalShift = this.validateShift(verticalShift, 0, this.element.children.length - 2);
        if(verticalShift != this.prevHolderPosition){
            this.insertPlaceholder(verticalShift);
        }
        this.prevHolderPosition = verticalShift;
    }

    validateShift(shift, min, max){
        return Math.max(min, Math.min(shift, max));
    }

    insertPlaceholder(place){
        this.placeholderElement.remove();
        this.element.children[place].insertAdjacentElement('beforebegin', this.placeholderElement);
    }

    onDragHandlerPointerUp = () =>{
        document.removeEventListener('pointermove', this.onDragHandlerPointerMove);
        document.removeEventListener('pointerup', this.onDragHandlerPointerUp);

        this.currentMovingElement.classList.remove('sortable-list__item_dragging');
        this.currentMovingElement.removeAttribute('style');
        this.placeholderElement.replaceWith(this.currentMovingElement.cloneNode(true))
        this.currentMovingElement.remove();

        this.placeholderElement = null;
        this.currentMovingElement = null;
    }

    moveElementAt = (pageX, pageY) =>{
        this.currentMovingElement.style.left = pageX - this.shiftX + 'px';
        this.currentMovingElement.style.top = pageY - this.shiftY + 'px';
    }

    onDeleteHandlerPointerDown(event){
        const targetElement = event.target;

        if(!('deleteHandle' in targetElement.dataset)) return;

        targetElement.closest('.sortable-list__item').remove();
    }

    remove(){
        this.element.remove();
    }

    destroy(){
        this.removeEventListener();
        this.remove();
    }
}
