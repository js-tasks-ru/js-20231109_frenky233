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
        const element = document.createElement('div');
        element.classList.add('notification');
        if(this.type) {
            element.classList.add(this.type);
        }
        element.setAttribute('style', `--value:${this.duration / 1000}s`);
        element.innerHTML = this.createTemplate();

        return element;
    }

    show(target = document.body){
        if(NotificationMessage.onScreenElement){
            NotificationMessage.onScreenElement.destroy();
        }
        NotificationMessage.onScreenElement = this;
        
        target.append(this.element);
        this.timerID = setTimeout(this.destroy, this.duration);
    }

    remove = () =>{
        this.element.remove();
    }

    destroy = () =>{
        clearTimeout(this.timerID);

        this.remove();
        if(NotificationMessage.onScreenElement == this)
        {
            NotificationMessage.onScreenElement = null;
        }
    }
}
