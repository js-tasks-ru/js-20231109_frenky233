export default class RangePicker {
    element;
    
    constructor({from = new Date(), to = new Date()} = {}){
        this.from = this.removeUTCOffset(from);
        this.to = this.removeUTCOffset(to);
        this.selectedButtonElements = [];
        this.calendarElementsData = {};
        
        this.clickCounter = 0;
        this.newDate = [];

        this.isRendered = false;

        this.render();
    }

    createSelectorTemplate(from, to){
        if(from.getMonth() == to.getMonth()){
            to = new Date(new Date(to).setMonth(to.getMonth() + 1))
        }

        return `
                <div class="rangepicker__selector-arrow"></div>
                <div class="rangepicker__selector-control-left"></div>
                <div class="rangepicker__selector-control-right"></div>
                ${this.createCalendarTemplate(from)}
                ${this.createCalendarTemplate(to)}
        `
    }

    createRangePickerTemplate(){
        return `
        <div class="rangepicker">
            <div class="rangepicker__input" data-element="input">
                <span data-element="from">${this.from.toLocaleDateString('default')}</span> -
                <span data-element="to">${this.to.toLocaleDateString('default')}</span>
            </div>
            <div class="rangepicker__selector" data-element="selector"></div>
        </div>
        `;
    }

    createCalendarTemplate(date){
        return `
        <div class="rangepicker__calendar"'>
            <div class="rangepicker__month-indicator">
            <time datetime="${date.toLocaleString('en', { month: 'long' })}">${date.toLocaleString('default' , { month: 'long' })}</time>
            </div>
            <div class="rangepicker__day-of-week">
            <div>Пн</div>
            <div>Вт</div>
            <div>Ср</div>
            <div>Чт</div>
            <div>Пт</div>
            <div>Сб</div>
            <div>Вс</div>
            </div>
            ${this.createDateGridTemplate(date)}
        </div>
        `
    }

    createDateGridTemplate(date){
        let inner = '';

        for(let day = 2; day <= this.daysInMonth(date); day++){
            inner += this.createDateGridItemTempalte(new Date(new Date(date).setDate(day)));
        }
        
        return `
        <div class="rangepicker__date-grid">
        <button type="button" class="rangepicker__cell" style="--start-from: ${this.getFirstDayOfMonth(date)}" data-value="${(new Date(new Date(date).setDate(1)).toJSON())}">1</button>
            ${inner}
        </div>
        `
    }

    createDateGridItemTempalte(date){
        return `<button type="button" class="rangepicker__cell" data-value="${date.toJSON()}">${date.getDate()}</button>`;
    }

    createRangePickerElement(){
        const element = document.createElement('div');
        element.innerHTML = this.createRangePickerTemplate();

        return element.firstElementChild;
    }

    render(){
        this.element = this.createRangePickerElement();
        this.subElements = this.getSubElements();

        this.addInputEventListener();
    }

    open(){
        this.addSelectorElementEventListeners();
        this.addDocumentEventListener();

        this.element.classList.toggle('rangepicker_open');
        
        if(!this.isRendered){
            this.subElements.selector.innerHTML = this.createSelectorTemplate(this.from, this.to);
        
            const calendarElements = this.getCalendarElements();
            this.calendarElementsData = {
                left: {
                    element: calendarElements.left,
                    date: new Date(new Date(this.from).setDate(1))
                },
                right: {
                    element: calendarElements.right,
                    date: new Date(new Date(this.to).setDate(1))
                }
            }
            
            this.setTimeInterval(this.from, this.to);
            this.isRendered = true;
        }
    }

    close(){
        this.element.classList.remove('rangepicker_open');
        this.removeSelectorElementEventListeners();
        this.removeDocumentEventListener();
    }

    addSelectorElementEventListeners(){
        this.subElements.selector.addEventListener('click', this.onControlElementClick);
        this.subElements.selector.addEventListener('click', this.onDayElementClick);
    }

    addInputEventListener = () =>{
        this.subElements.input.addEventListener('click', this.onInputElementClick);
    }

    addDocumentEventListener(){
        document.addEventListener('click', this.onDocumentClick, {capture: true});
    }

    removeDocumentEventListener(){
        document.removeEventListener('click', this.onDocumentClick, {capture: true});
    }

    removeInputEventListener(){
        this.subElements.input.removeEventListener('click', this.onInputElementClick);
    }

    removeSelectorElementEventListeners(){
        this.subElements.selector.removeEventListener('click', this.onControlElementClick);
        this.subElements.selector.removeEventListener('click', this.onDayElementClick);
    }

    onDocumentClick = (event) =>{
        const targetElement = event.target;
        
        if(!targetElement.closest('.rangepicker__selector') && !targetElement.closest('[data-element="input"]')){
            this.close();
        }
    }

    onInputElementClick = () =>{
        if(!this.element.classList.contains('rangepicker_open')){
            this.open();
            this.addDocumentEventListener();
        } else {
            this.close();
        }
    }

    onControlElementClick = (event) =>{
        const targetElement = event.target;

        if(targetElement.classList.contains('rangepicker__selector-control-left')){
            this.doCalendarSwitch('left');
        } 
        else if(targetElement.classList.contains('rangepicker__selector-control-right')){
            this.doCalendarSwitch('right');
        }

        this.setTimeInterval(this.from, this.to);
    }

    onDayElementClick = (event) =>{
        const buttonElement = event.target.closest('.rangepicker__cell');
        
        if(!buttonElement) return;
        
        const newDate = new Date(buttonElement.dataset.value);
        
        switch(this.clickCounter){
            case 0:
                this.newDate.push(newDate);
                this.clickCounter++;
                break;
            case 1:
                this.newDate.push(newDate);
                this.clickCounter = 0;
                break;
        }

        if(this.selectedButtonElements){
            this.selectedButtonElements.forEach(element => element.className = 'rangepicker__cell');
        }

        this.selectedButtonElement = [];
        
        if(this.newDate.length == 2){
            this.from = new Date(Math.min(...this.newDate));
            this.to = new Date(Math.max(...this.newDate));
            this.newDate = [];

            this.setTimeInterval(this.from, this.to);
            this.dispatchEvent();
        }        
    }

    doCalendarSwitch(dir){
        const dirToDelete = dir == 'left' ? 'right' : 'left';
        const placeToInsertHTML = dir == 'left' ? 'beforebegin' : 'afterend';
        const newMonth = dir == 'left' ? -1 : 1;
        
        this.calendarElementsData[dirToDelete].element.remove();
        this.calendarElementsData[dirToDelete].element = this.calendarElementsData[dir].element;
        this.calendarElementsData[dirToDelete].date = new Date(this.calendarElementsData[dir].date);
        
        this.calendarElementsData[dir].date = new Date(new Date(this.calendarElementsData[dir].date.setMonth(this.calendarElementsData[dir].date.getMonth() + newMonth)));
        this.calendarElementsData[dirToDelete].element.insertAdjacentHTML(placeToInsertHTML, this.createCalendarTemplate(this.calendarElementsData[dir].date));
        
        switch(dir){
            case 'left':
                this.calendarElementsData[dir].element = this.calendarElementsData[dirToDelete].element.previousSibling.previousSibling;
                break;
            case 'right':
                this.calendarElementsData[dir].element = this.calendarElementsData[dirToDelete].element.nextSibling.nextSibling;
                break;
        }
    }

    getCalendarElements(){
        const elementsArray = this.element.querySelectorAll('.rangepicker__calendar');
        const elementsObj = {
            left: elementsArray[0],
            right: elementsArray[1]
        }

        return elementsObj;
    }

    getSubElements(){
        const subElements = {};
        const elements = this.element.querySelectorAll('[data-element]');
    
        elements.forEach(element => 
            subElements[element.dataset.element] = element);
    
        return subElements;
    }

    validateDates(from, to){
        const dates = [];
        this.element.querySelectorAll('.rangepicker__cell').forEach(element => dates.push(new Date(element.dataset.value)));

        from = new Date(Math.max(from, Math.min(...dates))).toJSON();
        to = new Date(Math.min(to, Math.max(...dates))).toJSON();

        const outOfBounce = dates.find(date => date.toJSON() == from) && dates.find(date => date.toJSON() == to);

        return [from, to, outOfBounce];
    }

    setTimeInterval(from, to){
        this.subElements.from.textContent = from.toLocaleDateString('default');
        this.subElements.to.textContent = to.toLocaleDateString('default');
        
        let outOfBounce = false;
        [from, to, outOfBounce] = this.validateDates(from, to);

        if(!outOfBounce) return;
        
        let date = new Date(from);

        while(date.toJSON() != to){
            const buttonElementToPaint = this.element.querySelector(`[data-value="${date.toJSON()}"]`);
            this.selectedButtonElements.push(buttonElementToPaint);

            buttonElementToPaint.classList.add('rangepicker__selected-between');

            date = new Date(new Date(date).setDate(date.getDate() + 1));
        }

        if(from == this.from.toJSON()){
            const startElement = this.element.querySelector(`[data-value="${from}"]`);
            startElement.className = 'rangepicker__cell rangepicker__selected-from';
        }
        
        if(to == this.to.toJSON()){
            const endElement = this.element.querySelector(`[data-value="${to}"]`);
            endElement.className = 'rangepicker__cell rangepicker__selected-to';
            this.selectedButtonElements.push(endElement);
        }
    }

    dispatchEvent(){
        this.element.dispatchEvent(
          new CustomEvent("date-select", {
            bubbles: true,
            detail: {
                from: this.from,
                to: this.to
            },
          })
        );
    }

    removeUTCOffset(date){
        return new Date(date.setMinutes(date.getMinutes() - date.getTimezoneOffset()));
    }

    daysInMonth(date) {
        return new Date(date.getYear(), date.getMonth() + 1, 0).getDate();
    }

    getFirstDayOfMonth(date){
        let day = new Date(new Date(date).setDate(1)).getDay();
        
        day = day ? day : 7;

        return day; 
    }

    remove(){
        this.element.remove();
        this.removeDocumentEventListener();
        this.removeInputEventListener();
        this.removeSelectorElementEventListeners();
    }
    
    destroy(){
        this.remove();
    }
}
