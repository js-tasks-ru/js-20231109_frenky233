import SortableTableV1 from "../../05-dom-document-loading/2-sortable-table-v1/index.js";

export default class SortableTable extends SortableTableV1 {
  constructor(headersConfig = [], { data = [], sorted = {id: '', order: ''} } = {}) {
    super(headersConfig, data);

    this.sorted = sorted;
    this.isSortLocally = true;

    this.defaultSorting(this.sorted);
    this.addEventListeners();
  }

  defaultSorting({id, order} = {}){
    if(id || order){
      this.sortOnClient(id, order);
    }
  }

  sortOnClick = (event) =>{
    const headerItemElement = event.target.closest('.sortable-table__cell');

    if(headerItemElement.dataset.sortable == 'false'){
      return;
    }

    this.sorted.id = headerItemElement.dataset.id;
    this.sorted.order = headerItemElement.dataset.order == 'desc' ? 'asc' : 'desc';
    
    if(this.isSortLocally){
      this.sortOnClient(this.sorted.id, this.sorted.order);
    }
    else{
      this.sortOnServer();
    }
  }

  sortOnClient (sortBy, param){
    super.sort(sortBy, param);
  }

  sortOnServer(){
    return;
  }

  addEventListeners(){
    this.subElements.header.addEventListener('pointerdown', this.sortOnClick);
  }

  removeEventListeners(){
    this.subElements.header.removeEventListener('pointerdown', this.sortOnClick);
  }

  destroy = () =>{
    this.removeEventListeners();
    super.destroy();
  }
}
