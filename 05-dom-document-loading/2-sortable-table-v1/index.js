export default class SortableTable {
constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.templates = this.getTemplates(headerConfig);
    this.sortingTypes = this.getSortingTypes(headerConfig);
    this.prevSortedHeaderElement = null;

    this.element = this.createTableElement();
    this.subElements = {body: this.element.querySelector('[data-element="body"'), header: this.element.querySelector('[data-element="header"]')};
  }

  getTemplates(config = []){
    return config.map(({id = '', template = this.createCellTemplate}) => ({id, template}));
  }

  getSortingTypes(config = []){
    return config.filter(({sortable}) => sortable).map(({id = '', sortType = ''}) => ({id, sortType}));
  }

  createHeaderItemTemplate(id = '', title = '', sortable = false){
    return`
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
      </div>
    `;
  }

  createHeaderElement(){
    const headerElement = document.createElement('div');
    headerElement.classList.add('sortable-table__header', 'sortable-table__row');
    headerElement.dataset.element = 'header';

    this.headerConfig.forEach(({id, title, sortable}) => headerElement.insertAdjacentHTML('beforeend', this.createHeaderItemTemplate(id, title, sortable)));

    return headerElement.outerHTML;
  }

  createCellTemplate(value = ''){
    return `<div class="sortable-table__cell">${value}</div>`;
  }

  createBodyItemTemplate(data = {}){
    const itemElement = document.createElement('a');
    itemElement.href = `/products/${data.id}`;
    itemElement.classList.add('sortable-table__row');

    this.templates.forEach(({id, template}) => itemElement.insertAdjacentHTML('beforeend',template(data[id])));

    return itemElement.outerHTML;
  }

  createBodyElement(){
    const bodyElement = document.createElement('div');
    bodyElement.classList.add('sortable-table__body');
    bodyElement.dataset.element = 'body';

    this.renderBodyItemsElements(this.data, bodyElement);

    return bodyElement.outerHTML;
  }

  renderBodyItemsElements(data = [], bodyElement){
    bodyElement.innerHTML = '';
    data.forEach(dataItem => bodyElement.insertAdjacentHTML('beforeend', this.createBodyItemTemplate(dataItem)));
  }

  createTableElement(){
    const element = document.createElement('div');
    element.classList.add('products-list__container');
    element.dataset.element = 'productsContainer';

    element.insertAdjacentHTML('beforeend', 
    `<div class="sortable-table">
      ${this.createHeaderElement()} 
      ${this.createBodyElement()}
    </div>`);

    return element;
  }

  createArrowSymbolTemplate(){
      return `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
      </span>`;
  }

  addArrowSymbolElement(targetElement){
    if(targetElement.children.length < 2){
      targetElement.insertAdjacentHTML('beforeend', this.createArrowSymbolTemplate());
      
      if(this.prevSortedHeaderElement && this.prevSortedHeaderElement != targetElement){
        this.prevSortedHeaderElement.querySelector('[data-element="arrow"]').remove();
      }
    }
  }

  updateHeaderElement(headerElement, param){
    this.addArrowSymbolElement(headerElement);

    if(this.prevSortedHeaderElement){
      this.prevSortedHeaderElement.removeAttribute('data-order');
    }
    headerElement.dataset.order = param;

    this.prevSortedHeaderElement = headerElement;
  }

  sortByType(sortBy, sortingType, sortingDir){
    if(sortingType == 'string'){
      this.data.sort((a, b) => sortingDir * a[sortBy].localeCompare(b[sortBy], ['ru', 'en'], {caseFirst: "upper"}));
    }
    else if(sortingType == 'number'){
      this.data.sort((a, b) => sortingDir * (a[sortBy] - b[sortBy]));
    }
  }

  sort = (sortBy, param) =>{
    const sortingDir = param == 'asc' ? 1 : -1;
    const bodyElement = this.element.querySelector('[data-element="body"]');
    const headerElement = this.element.querySelector(`[data-id="${sortBy}"]`);
    const sortingType = this.sortingTypes.find(({id}) => id == sortBy).sortType;

    this.sortByType(sortBy, sortingType, sortingDir)
    this.updateHeaderElement(headerElement, param);
    this.renderBodyItemsElements(this.data, bodyElement);
  }

  destroy(){
    this.element.remove();
  }
}

