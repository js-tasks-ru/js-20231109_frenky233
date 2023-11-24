export default class ColumnChart {
    constructor({data = [], label = '', value = 0, link = '', formatHeading = data => data} = {}){
        this.data = data;
        this.label = label;
        this.value = value;
        this.link = link;
        this.formatHeading = formatHeading;

        this.chartHeight = 50;

        this.element = this.createElement();
        this.update(this.data);
    }

    createTemplate(){
        return `
            <div class="column-chart__title">
                Total ${this.label}
                ${this.createLinkTemplate(this.link)}
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
                <div data-element="body" class="column-chart__chart">
                </div>
            </div>`;
    }

    createElement = () => {
        const element = document.createElement('DIV');
        element.classList.add('column-chart');
        element.setAttribute('style', '--chart-height = 50');

        element.innerHTML = this.createTemplate();

        return element;
    }

    update = (data) =>{
        const dataChartsElement = this.element.querySelector('[data-element="body"]');
        dataChartsElement.innerHTML = '';

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

    createLinkTemplate(url){
        if(url){
            return `<a href = ${url} class="column-chart__link">View all</a>`;
        }

        return '';
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
