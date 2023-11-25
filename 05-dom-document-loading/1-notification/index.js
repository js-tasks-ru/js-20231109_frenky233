export default class NotificationMessage {
    static onScreenElement = null;
    
    constructor(message = '', {duration = 0, type = ''} = {}){
        this.message = message;
        this.duration = duration;
        this.type = type;

        this.element = this.createElement();
    }

    createTemplate(){
        return `
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                    ${this.message}
                </div>
            </div>`;
    }

    createElement(){
        const elem = document.createElement('div');
        elem.classList.add('notification');
        if(this.type) {
            elem.classList.add(this.type);
        }
        elem.setAttribute('style', `--value:${this.duration / 1000}s`);
        elem.innerHTML = this.createTemplate();

        return elem;
    }

    show = (target = document.body) =>{
        if(NotificationMessage.onScreenElement){
            NotificationMessage.onScreenElement.destroy();
        }
        NotificationMessage.onScreenElement = this;
        
        target.append(this.element);
        setTimeout(this.destroy, this.duration);
    }

    remove = () =>{
        this.element.remove();
    }

    destroy = () =>{
        this.remove();
        if(NotificationMessage.onScreenElement == this)
        {
            NotificationMessage.onScreenElement = null;
        }
    }
}
