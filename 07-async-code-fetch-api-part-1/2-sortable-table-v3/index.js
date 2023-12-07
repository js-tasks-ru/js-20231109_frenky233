import SortableTableV1 from '../../05-dom-document-loading/2-sortable-table-v1/index.js';
import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable extends SortableTableV1{
  static amountOfProductsToLoad = 25;
  
  constructor(headersConfig, {data = [], url = '', isSortLocally = false, sorted = { id: headersConfig.find((item) => item.sortable).id, order: "asc" }} = {}) {
    super(headersConfig, data)
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.sortingId = sorted.id;
    this.sortingOrder = sorted.order;
    this.from = 0;
    this.to = 20;

    this.templates = this.getTemplates(headersConfig);
    this.sortingTypes = this.getSortingTypes(headersConfig);
    this.render();
  }

  createLoadingPlaceholderTemplate(){
    return '<div data-element="loading" class="loading-line sortable-table__loading-line"></div>';
  }

  createEmptyPlaceholderTemplate(){
    return `
    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
      <div>
        <p>No products satisfies your filter criteria</p>
        <button type="button" class="button-primary-outline">Reset all filters</button>
      </div>
    </div>`
  }

  addLoadingPlaceholderElement(){
    this.tableElement.insertAdjacentHTML('beforeend', this.createLoadingPlaceholderTemplate());
  }

  addEmptyPlaceholderElement(){
    this.tableElement.insertAdjacentHTML('beforeend', this.createEmptyPlaceholderTemplate());
  }

  addHeaderEventListener(){
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
  }

  addWindowEventListener(){
    window.addEventListener('scroll', this.onWindowScroll);
  }

  removeHeaderEventListener(){
    this.subElements.header.removeEventListener('pointerdown', this.onHeaderClick);
  }

  removeWindowEventListener(){
    window.removeEventListener('scroll', this.onWindowScroll);
  }

  onWindowScroll = async () =>{
    if(document.documentElement.getBoundingClientRect().bottom > document.documentElement.clientHeight + 40) return;

    this.removeWindowEventListener();
    await this.sortOnServer(this.sortingId, this.sortingOrder);
    this.addWindowEventListener();
  }

  onHeaderClick = (event) =>{
    const headerElement = event.target.closest('.sortable-table__cell');
    const id = headerElement.dataset.id;
    const order = headerElement.dataset.order;
    this.subElements.body.innerHTML = "";
    
    const param = order == 'asc' ? 'desc' : 'asc';

    this.chooseSortingSide(id, param);
  }

  async chooseSortingSide(id, order){
    if(this.isSortLocally){
      this.sortOnClient(id, order);
    }
    else{
      this.from = 0;
      this.updateHeaderElement(this.subElements.header.querySelector(`[data-id="${id}"]`), order);
      await this.sortOnServer(id, order);
    }

    this.sortingId = id;
    this.sortingOrder = order;
  }

  sortOnClient (id, order) {
    super.sort(id, order);
  }

  async sortOnServer (id, order) {
    this.tableElement.classList.add('sortable-table_loading');

    const data = await this.loadData(id, order);

    this.tableElement.classList.remove('sortable-table_loading');
    
    this.toggleIsEmpty(data.length);
    if(!data.length){
      return;
    }

    this.data.push(...data);
    super.renderBodyItemsElements(data, this.subElements.body);
  }

  async loadData(id, order){
    const url = new URL(this.url ,BACKEND_URL);
    const start = this.from;
    const end = this.from + SortableTable.amountOfProductsToLoad;
    this.from = end;

    url.searchParams.set('_embed', 'subcategory.category');
    url.searchParams.set('_sort', id);
    url.searchParams.set('_order', order);
    url.searchParams.set('_start', start);
    url.searchParams.set('_end', end);

    const data = await fetchJson(url);

    return data;
  }

  async render(){
    this.element = super.createTableElement();
    this.tableElement = this.element.firstElementChild;

    this.subElements = this.getSubElements();

    this.addLoadingPlaceholderElement();
    this.addEmptyPlaceholderElement();
    
    this.addHeaderEventListener();
    this.addWindowEventListener();

    await this.chooseSortingSide(this.sortingId, this.sortingOrder);
  }

  toggleIsEmpty(dataLength){
    if(dataLength > 0){
      this.tableElement.classList.remove('sortable-table_empty');
    }
    else{
      this.tableElement.classList.add('sortable-table_empty');
    }
  }

  getSubElements(){
    const subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');

    elements.forEach(element => 
        subElements[element.dataset.element] = element);

    return subElements;
  }

  destroy(){
    this.removeHeaderEventListener();
    this.removeWindowEventListener();
    this.element.remove();
  }
}
