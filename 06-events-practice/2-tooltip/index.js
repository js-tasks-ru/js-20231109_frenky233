class Tooltip {
  static instance;

  constructor(){
    if(Tooltip.instance){
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initialize () {
    document.body.addEventListener('pointerover', this.show);
  }

  show = (event) =>{ 
    this.targetElement = event.target.closest('[data-tooltip]');

    if(this.targetElement){
      this.render(this.targetElement.dataset.tooltip);
    
      document.body.addEventListener('pointermove', this.move);
      this.targetElement.addEventListener('pointerout', this.hide);
    }
  }
  
  move = (event) =>{
    const shift = 10;
    const x = shift + event.clientX;
    const y = shift + event.clientY;

    this.element.style.top = y + 'px';
    this.element.style.left = x + 'px';
  }

  hide = () =>{
    document.body.removeEventListener('pointermove', this.move);

    if(this.targetElement){
      this.targetElement.removeEventListener('pointerout', this.hide);
    }
    
    this.element.remove();
  }

  render(text){
    this.element = this.createElement(text);
    document.body.append(this.element);
  }

  createTemplate(text){
    return `<div class = "tooltip">${text}</div>`;
  }

  createElement(html){
    const element = document.createElement('div');
    element.innerHTML = this.createTemplate(html);

    return element.firstElementChild;
  }

  destroy = () =>{
    document.body.removeEventListener('pointerover', this.show);

    if(this.element){
      this.hide();
    }
  }
}

export default Tooltip;
