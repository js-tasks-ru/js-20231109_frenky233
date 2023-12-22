import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart{
    constructor({url = '', range = {from: new Date(), to: new Date()}, data = [], label = '', value = 0, link = '', formatHeading = data => data} = {}){
        this.url = url;
        this.range = range;
        this.from = range.from.toISOString();
        this.to = range.to.toISOString();
        this.data = data;
        this.label = label;
        this.value = value;
        this.link = link;
        this.formatHeading = formatHeading;

        this.chartHeight = 50;

        this.element = this.createElement();
        this.subElements = this.getSubElements();

        this.update(this.from, this.to);
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

    updateData(data){
        this.subElements.body.innerHTML = '';

        if(data.length){
            this.addChartsElements(data, this.subElements.body, this.chartHeight);
            this.element.classList.remove('column-chart_loading');
        }
        else{
            this.setLoading();
        }
    }

    setLoading = () =>{
        this.element.classList.add('column-chart_loading');
    }

    createLinkTemplate(url){
        if(url){
            return `<a href = ${url} class="column-chart__link">View all</a>`;
        }

        return '';
    }

    addChartsElements = (data, parentElem) => {
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

    getSubElements(){
        const subElements = {};
        const elements = this.element.querySelectorAll('[data-element]');

        elements.forEach(element => 
            subElements[element.dataset.element] = element);

        return subElements;
    }

    async update(from, to){
        this.updateData([]);

        const url = new URL(this.url ,BACKEND_URL);
        url.searchParams.set('from', from);
        url.searchParams.set('to', to);

        const data = await fetchJson(url);

        this.updateData(Object.values(data));

        this.subElements.header.textContent = this.formatHeading(Object.values(data).reduce((sum, cur) => sum + cur).toLocaleString('en-US'));
        
        return data;
    }
}
