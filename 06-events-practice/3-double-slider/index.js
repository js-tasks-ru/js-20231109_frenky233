export default class DoubleSlider {
    constructor({min = 0, max = 0, formatValue = value => value, selected = {from: min, to: max}} = {}){
        this.min = min;
        this.max = max;
        this.formatValue = formatValue;
        this.selected = selected;

        this.addDocumentEventListeners();

        this.element = this.createElement();
        this.element.ondragstart = () => false;
        
        this.thumbDir = '';
        this.sliderInnerElement = this.element.querySelector('.range-slider__inner');
        this.sliderProgressBarElement = this.element.querySelector('.range-slider__progress');
        this.sliderThumbLeftElement = this.element.querySelector('.range-slider__thumb-left');
        this.sliderThumbRightElement = this.element.querySelector('.range-slider__thumb-right');
        this.leftValueElement = this.element.querySelector('[data-element="from"]');
        this.rightValueElement = this.element.querySelector('[data-element="to"]');

        this.doDefaultSelection(selected);
    }

    createTemplate(){
        return `
        <div class="range-slider">
            <span data-element="from">${this.formatValue(this.min)}</span>
            <div class="range-slider__inner">
                <span class="range-slider__progress"></span>
                <span class="range-slider__thumb-left"></span>
                <span class="range-slider__thumb-right"></span>
            </div>
            <span data-element="to">${this.formatValue(this.max)}</span>
        </div>`;
    }

    createElement(){
        const element = document.createElement('div');
        element.innerHTML = this.createTemplate();

        return element.firstElementChild;
    }

    addSlidersEventListeners = () =>{
        document.addEventListener('pointermove', this.onPointerMove);
        document.addEventListener('pointerup', this.onPointerUp);
    }

    addDocumentEventListeners = () =>{
        document.addEventListener('pointerdown', this.onPointerDown);
    }

    removeSlidersEventListeners = () =>{
        document.removeEventListener('pointermove', this.onPointerMove);
        document.removeEventListener('pointerup', this.onPointerUp);
    }

    removeDocumentEventListeners = () =>{
        document.removeEventListener('pointerdown', this.onPointerDown);
    }

    onPointerDown = (event) =>{
        const targetElement = event.target.closest('span');
        
        if(targetElement){
            if(targetElement.classList.contains('range-slider__thumb-left')){
                this.thumbDir = 'left';
                this.addSlidersEventListeners();
            }
            else if(targetElement.classList.contains('range-slider__thumb-right')){
                this.thumbDir = 'right';
                this.addSlidersEventListeners();
            }
        }
    }

    onPointerUp = () =>{
        this.removeSlidersEventListeners();
        this.generateEvent(this.selected);
    }

    onPointerMove = (event) =>{
        const x = event.clientX - this.sliderInnerElement.getBoundingClientRect().left;
        const shift = (x / this.sliderInnerElement.getBoundingClientRect().width) * 100;
        this.moveThumb(shift, this.thumbDir);
    }

    generateEvent = ({from, to}) =>{
        const event = new CustomEvent('range-select', {
            bubbles: true,
            detail: {
                from: from,
                to: to
            }
        });

        this.element.dispatchEvent(event);
    }

    moveThumb = (shift, dir) =>{
        switch (dir){
            case 'left':
                shift = this.validateShift(shift, 0, this.calcShiftFromSliderValue(this.selected.to));
                
                this.sliderThumbLeftElement.style.left = shift + '%';
                this.sliderProgressBarElement.style.left = shift + '%';
                
                this.selected.from = this.calcSliderValueFromShift(shift);
                this.changeSliderValue(this.selected.from, dir);
                break;
            case 'right':
                shift = this.validateShift(shift, this.calcShiftFromSliderValue(this.selected.from), 100);
                
                this.sliderThumbRightElement.style.right = 100 - shift + '%';
                this.sliderProgressBarElement.style.right = 100 - shift + '%';
                
                this.selected.to = this.calcSliderValueFromShift(shift);
                this.changeSliderValue(this.selected.to, dir);
                break;
        }
    }

    calcShiftFromSliderValue = (value) =>{
        return (value - this.min) / (this.max - this.min) * 100;
    }

    calcSliderValueFromShift = (shift) =>{
        return Math.round(shift / 100 * (this.max - this.min) + this.min);
    }

    changeSliderValue = (value, postition) =>{
        switch (postition){
            case 'left':
                this.leftValueElement.textContent = this.formatValue(value);
                break;
            case 'right':
                this.rightValueElement.textContent = this.formatValue(value);
                break;
        }
    }

    doDefaultSelection = ({from, to}) =>{
        this.moveThumb(this.calcShiftFromSliderValue(from), 'left');
        this.moveThumb(this.calcShiftFromSliderValue(to), 'right');
    }
    
    validateShift(value, min, max){
        if(value > max){
            return max;
        }
        if(value < min){
            return min;
        }
        return value;
    }

    destroy = () =>{
        this.element.remove();
        this.removeSlidersEventListeners();
        this.removeDocumentEventListeners();
    }
}
