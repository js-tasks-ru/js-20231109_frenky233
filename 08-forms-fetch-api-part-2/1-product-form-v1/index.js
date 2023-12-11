import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  categories;
  element;
  subElements;
  
  constructor (productId) {
    this.productId = productId;
    
    this.formElements = {
      title: null,
      description: null,
      subcategory: null,
      price: null,
      discount: null,
      quantity: null,
      status: null,
    };
  }

  createFormTemplate(){
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" id='title' class="form-control" placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" name="description" id='description' data-element="productDescription" placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">
          </div>
          <button type="button" name="uploadImage" id='uploadImage' data-element="uploadImage" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          ${this.createCategoriesElement()}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" id='price' class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" id='discount' class="form-control" placeholder="0">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" name="quantity" id='quantity' placeholder="1">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status" id='status'>
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
    </div>
    `;
  }

  createFormElement(){
    const element = document.createElement('div');
    element.innerHTML = this.createFormTemplate();

    return element.firstElementChild;
  }

  createCategoryItemElement({id, title}, categoryTitle){
    const element = new Option(categoryTitle + ' > ' + title, id);

    return element.outerHTML;
  }

  createCategoriesElement(){
    const element = document.createElement('select');
    element.classList.add('form-control');
    element.setAttribute('name', 'subcategory');
    element.id = "subcategory";
    
    this.categories.forEach(({subcategories, title}) => 
      subcategories.forEach((subCategory) => 
        element.insertAdjacentHTML('beforeend', this.createCategoryItemElement(subCategory, title))));

    return element.outerHTML;
  }

  createImageItemTemplate(source, url){
    return `
    <ul class="sortable-list">
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${url}">
          <span>${source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    </ul>
    `;
  }

  addFormEventListener(){
    this.element.addEventListener('submit', this.onFormSubmit)
  }

  addImageListEventListeners(){
    this.subElements.imageListContainer.addEventListener('click', this.onDeleteImageClick);
    this.subElements.uploadImage.addEventListener('click', this.onUploadImageClick);
  }

  removeImageListEventListeners(){
    this.subElements.imageListContainer.removeEventListener('click', this.onDeleteImageClick);
    this.subElements.uploadImage.removeEventListener('click', this.onUploadImageClick);
  }

  removeFormEventListener(){
    this.element.removeEventListener('submit', this.onFormSubmit)
  }

  async render(){
    this.categories = await this.getCategories();
    this.element = this.createFormElement();
    this.subElements = this.getSubElements();
    this.getFormElements();

    if(this.productId){
      this.productData = await this.getData(this.productId);
      this.editProductCard(this.productData[0]);
    }
    else{
      this.createProductCard();
    }

    this.addFormEventListener();
    this.addImageListEventListeners();

    return this.element;
  }

  createProductCard(){
    this.eventOnSubmit = new CustomEvent('product-saved', {
      bubbles: true,
    });
  }

  editProductCard(data){
    this.setExistValues(data);

    this.eventOnSubmit = new CustomEvent('product-updated', {
      bubbles: true,
    });
  } 

  setExistValues(data){
    for(const [key, element] of Object.entries(this.formElements)){
      element.value = data[key];
    }
    this.setImages(data.images);
  }

  addImageItemElement(source, url){
    this.subElements.imageListContainer.insertAdjacentHTML('beforeend', this.createImageItemTemplate(source, url))
  }

  setImages(images){
    images.forEach(({source, url}) => {
      this.addImageItemElement(source, url)
    });
  }

  getImages(){
    const images = [];
    
    for(const element of this.subElements.imageListContainer.children){
      const data = element.querySelectorAll('[name]');
      images.push({source: escapeHtml(data[0].value), url: escapeHtml(data[1].value)});
    }

    return images;
  }

  checkValueType(key, value){
    switch(typeof this.productData[key]){
      case 'string':
        return value;
        break;
      case 'number':
        return +value;
        break;
    }
  }

  getFormData(){
    const formData = {};
    for(const [key, element] of Object.entries(this.formElements)){
      formData[key] = this.checkValueType(key, element.value);
    }
    
    formData.images = this.getImages();
    formData.id = this.productId;

    return formData;
  }

  onUploadImageClick = () =>{
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.hidden = true;
    
    document.body.append(imageInput);

    imageInput.onchange = async () =>{
      const image = imageInput.files[0];

      if(!image) return;

      const formData = new FormData();
      formData.append('image', image);

      this.subElements.uploadImage.classList.add("is-loading");
      this.subElements.uploadImage.disabled = true;

      try{
        const response = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData
        });

        this.addImageItemElement(escapeHtml(image.name), response.data.link);
      } catch(err){
        throw new err;
      } finally {
        this.subElements.uploadImage.classList.remove("is-loading");
        this.subElements.uploadImage.disabled = false;
        imageInput.remove();
      }
    }

    imageInput.click();
  }

  onDeleteImageClick = (event) =>{
    if('deleteHandle' in event.target.dataset){
      event.target.closest('UL').remove();
    }
  }

  onFormSubmit = (event) =>{
    event.preventDefault();
    this.save()
  }

  save = async () =>{
    const url = new URL('/api/rest/products', BACKEND_URL);

    const formData = this.getFormData();

    await fetchJson(url, {
      method: this.productId ? "PATCH" : "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData)
    });

    this.element.dispatchEvent(this.eventOnSubmit);
  }

  async getCategories(){
    const url = new URL('/api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    const categories = await fetchJson(url);

    return categories;
  }

  async getData(id){
    const url = new URL('/api/rest/products', BACKEND_URL);
    url.searchParams.set('id', id);

    const data = await fetchJson(url);
    
    return data;
  }

  getSubElements(){
    const subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');

    elements.forEach(element => 
        subElements[element.dataset.element] = element);

    return subElements;
  }

  getFormElements(){
    for(const item in this.formElements){
      const element = this.element.querySelector(`[name=${item}]`);
      this.formElements[item] = element;
    }
  }

  remove(){
    this.element.remove();
  }

  destroy(){
    this.removeFormEventListener();
    this.removeImageListEventListeners();

    this.remove();
  }
}