import RangePicker from "../../08-forms-fetch-api-part-2/2-range-picker/index.js";
import SortableTable from "../../07-async-code-fetch-api-part-1/2-sortable-table-v3/index.js";
import ColumnChart from "../../07-async-code-fetch-api-part-1/1-column-chart/index.js";
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
    element;
    subElements;
    
    constructor(){
        this.to = new Date();
        this.from = new Date(new Date().setMonth(this.to.getMonth() - 1));
    }

    addEventListener(){
        this.element.addEventListener('date-select', this.onDateSelect);
    }

    removeEventListener(){
        this.element.removeEventListener('date-select', this.onDateSelect);
    }
    
    async render(){
        this.element = this.createElement();
        this.subElements = this.getSubElements();
        
        const range = {from: this.from, to: this.to}
        
        this.rangePicker = new RangePicker(range);
        this.subElements.rangePicker.append(this.rangePicker.element);

        this.ordersChart = new ColumnChart({
            url: 'api/dashboard/orders',
            range,
            label: 'orders',
            link: '#'
        });
        this.subElements.ordersChart.append(this.ordersChart.element);

        this.salesChart = new ColumnChart({
            url: 'api/dashboard/sales',
            range,
            label: 'sales',
            formatHeading: data => `$${data}`,
        });
        this.subElements.salesChart.append(this.salesChart.element);

        this.customersChart = new ColumnChart({
            url: 'api/dashboard/customers',
            range,
            label: 'customers',
        });
        this.subElements.customersChart.append(this.customersChart.element);

        this.sortableTable = new SortableTable(header,{
            url: 'api/dashboard/bestsellers',
            isSortLocally: true,
            from: range.from,
            to: range.to,
        })
        this.subElements.sortableTable.append(this.sortableTable.element);
        this.sortableTable.update(range.from, range.to);

        this.addEventListener();

        return this.element;
    }

    onDateSelect = (event) =>{
        let { from, to } = event.detail;
        from = from.toJSON();
        to = to.toJSON();

        this.ordersChart.update(from, to);
        this.salesChart.update(from, to);
        this.customersChart.update(from, to);
        this.sortableTable.update(new Date(from), new Date(to));
    }

    createTemplate(){
        return `
        <div class="dashboard">
            <div class="content__top-panel">
                <h2 class="page-title">Dashboard</h2>
                <!-- RangePicker component -->
                <div data-element="rangePicker"></div>
            </div>
            <div data-element="chartsRoot" class="dashboard__charts">
                <!-- column-chart components -->
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
            </div>

            <h3 class="block-title">Best sellers</h3>

            <div data-element="sortableTable">
                <!-- sortable-table component -->
            </div>
        </div>
        `;
    }
    
    createElement(){
        const element = document.createElement('div');
        element.innerHTML = this.createTemplate();

        return element.firstElementChild;
    }

    getSubElements(){
        const subElements = {};
        const elements = this.element.querySelectorAll('[data-element]');
    
        elements.forEach(element => 
            subElements[element.dataset.element] = element);
    
        return subElements;
    }

    remove(){
        this.element.remove();
    }
    
    destroy(){
        this.removeEventListener();
        this.remove();
    }
}
