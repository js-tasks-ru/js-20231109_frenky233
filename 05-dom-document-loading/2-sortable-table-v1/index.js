export default class SortableTable {
  static sortingTitleElement = null;
  
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.templates = this.getTemplates(headerConfig);
    this.sortingTypes = this.getSortingTypes(headerConfig);

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
    const header = document.createElement('div');
    header.classList.add('sortable-table__header', 'sortable-table__row');
    header.dataset.element = 'header';

    this.headerConfig.forEach(({id, title, sortable}) => header.insertAdjacentHTML('beforeend', this.createHeaderItemTemplate(id, title, sortable)));

    return header.outerHTML;
  }

  createCellTemplate(value = ''){
    return `<div class="sortable-table__cell">${value}</div>`;
  }

  createBodyItemTemplate(data = {}){
    const item = document.createElement('a');
    item.href = `/products/${data.id}`;
    item.classList.add('sortable-table__row');

    this.templates.forEach(({id, template}) => item.insertAdjacentHTML('beforeend',template(data[id])));

    return item.outerHTML;
  }

  createBodyElement(){
    const body = document.createElement('div');
    body.classList.add('sortable-table__body');
    body.dataset.element = 'body';

    this.renderBodyItemsElements(this.data, body);

    return body.outerHTML;
  }

  renderBodyItemsElements(data = [], body){
    body.innerHTML = '';
    data.forEach(item => body.insertAdjacentHTML('beforeend', this.createBodyItemTemplate(item)));
  }

  createTableElement(){
    const elem = document.createElement('div');
    elem.classList.add('products-list__container');
    elem.dataset.element = 'productsContainer';

    elem.insertAdjacentHTML('beforeend', 
    `<div class="sortable-table">
      ${this.createHeaderElement()} 
      ${this.createBodyElement()}
    </div>`);

    return elem;
  }

  addArrowSymbolElement(target){
    target.insertAdjacentHTML('beforeend',
      `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
      </span>`);
  }

  sort = (sortBy, param) =>{
    const sortingDir = param == 'asc' ? 1 : -1;
    const bodyElement = this.element.querySelector('[data-element="body"]');
    const headerElement = this.element.querySelector(`[data-id="${sortBy}"]`);
    const sortingType = this.sortingTypes.find(({id}) => id == sortBy).sortType;

    if(SortableTable.sortingTitleElement == headerElement){
      headerElement.querySelector('[data-element="arrow"]').remove();
    }else if(SortableTable.sortingTitleElement){
      SortableTable.sortingTitleElement.querySelector('[data-element="arrow"]').remove();
    }

    SortableTable.sortingTitleElement = headerElement;
    this.addArrowSymbolElement(headerElement);

    headerElement.dataset.order = param;

    if(sortingType == 'string'){
      console.log(11);
      this.data.sort((a, b) => sortingDir * a[sortBy].localeCompare(b[sortBy], ['ru', 'en'], {caseFirst: "upper"}));
    }
    else if(sortingType == 'number'){
      console.log(22);
      this.data.sort((a, b) => sortingDir * a[sortBy] - b[sortBy]);
    }

    this.renderBodyItemsElements(this.data, bodyElement);
  }

  destroy(){
    this.element.remove();
  }
}

