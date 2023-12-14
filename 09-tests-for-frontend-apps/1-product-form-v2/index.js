import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import ProductFormV1 from '../../08-forms-fetch-api-part-2/1-product-form-v1/index.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm extends ProductFormV1{
  createImageItemElement(source, url){
    const element = document.createElement('div');
    element.innerHTML = this.createImageItemTemplate(source, url);

    return element.firstElementChild;
  }
  
  setImages(images){
    const imageTemplates = images.map(({source, url}) => this.createImageItemElement(source, url));

    const sortableList = new SortableList({items: imageTemplates});
    
    this.subElements.imageListContainer.append(sortableList.element);
  }
}
