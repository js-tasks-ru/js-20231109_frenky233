export default class ColumnChart {
    constructor({data = [], label, value = 0, link = '', formatHeading = data => data} = {}){
        this.data = data;
        this.label = label;
        this.value = value;
        this.link = link;
        this.formatHeading = formatHeading;

        this.chartHeight = 50;

        this.createElement();
        this.initialization(this.data);
    }

    createTemplate(){
        return `
            <div class="column-chart__title">
                Total ${this.label}
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
                <div data-element="body" class="column-chart__chart">
                </div>
            </div>`;
    }

    createElement = () => {
        this.element = document.createElement('DIV');
        this.element.classList.add('column-chart');
        this.element.setAttribute('style', '--chart-height = 50');

        this.element.innerHTML = this.createTemplate();
    }

    initialization = (data) =>{
        const chartTitleElement = this.element.querySelector('.column-chart__title');

        this.createLinkElement(this.link, chartTitleElement);

        this.update(data);
    }

    update = (data) =>{
        const dataChartsElement = this.element.querySelector('[data-element="body"]');

        if(data.length){
            this.addChartsElemnts(data, dataChartsElement, this.chartHeight);
        }
        else{
            this.setLoading();
        }
    }

    setLoading = () =>{
        this.element.classList.add('column-chart_loading')
    }

    createLinkElement(url, parentElem){
        if(url){
            const linkElement = document.createElement('A');
            linkElement.classList.add('column-chart__link');
            linkElement.innerHTML = 'View all';
            linkElement.setAttribute('href', url);

            parentElem.append(linkElement);
        }
    }

    addChartsElemnts = (data, parentElem) => {
        const maxVal = Math.max(...data);
        const heightScale = this.chartHeight / maxVal;

        data.forEach(item => {
            const chart = document.createElement('div');
            chart.setAttribute('style', `--value: ${Math.floor(item * heightScale)}`);
            chart.setAttribute('data-tooltip', `${(item / maxVal *100).toFixed(0)}%`);

            parentElem.append(chart);
        });
    }

    remove = () =>{
        this.destroy();
    }

    destroy = () =>{
        this.element.remove();
    }
}
