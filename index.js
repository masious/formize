var Sequelize = require('sequelize');
var cheerio = require('cheerio');

var formize = function(model) {

	this.model = model;
	this.name = model.name;

	this.allFields = [];
	for(var field in this.model.attributes){
		this.allFields.push(field);
	}

	this.fields = this.fields || this.allFields;
};

var Field = function(seqField, val){
	var seqField = seqField;
	var model = seqField.Model;

	var id = seqField.Model.name + '_' + seqField.field;
	var name = seqField.field;
	
	if(typeof val === 'undefined')
		val = '';

	var labelEl = function() {
		var $label = cheerio.load('<label/>')('label')
		.attr('for', id)
		.text(seqField.field);
		return $label;
	}

	var inputEl = function(){
		switch(seqField.type.key) {
			case ('INTEGER'):
				return numberField(id, name, val);
				break;
			case ('TEXT'):
				return textareaField(id, name, val);
				break;
			case ('DATE'):
				return dateField(id, name, val);
				break;
			default:
				return stringField(id, name, val);
				break;
		}
	}

	var wrapperEl = function(){

		return cheerio.load('<div/>')('div')
		.addClass('form-group')
		.append(labelEl())
		.append(inputEl());
		
	}
	return wrapperEl();
}

var numberField = function(id, name, data){
	return stringField(id, name, data)
	.attr('type', 'number');
}

var dateField = function(id, name, data){
	return stringField(id, name, data)
	.attr('type', 'datetime-local');
}

var textareaField = function(id, name, data){
	return cheerio.load('<textarea/>')('textarea')
	.addClass('form-control')
	.attr('id', id)
	.attr('name', name)
	.val(data);
}

var stringField = function(id, name, data){
	return cheerio.load('<input/>')('input')
	.attr('type', 'text')
	.addClass('form-control')
	.attr('id', id)
	.attr('name', name)
	.val(data);
}

formize.prototype.submitButtonEl = function(){
	var $btn = cheerio.load('<input/>')('input')
	.attr('type', 'submit')
	.addClass('btn')
	.addClass('btn-primary')
	.val('Save');
	
	return $btn;
}

formize.prototype.formEl = function(method, action) {
	var $formHolder = cheerio.load('<form/>');

	$formHolder('form')
	.attr('method', method)
	.attr('action', action);

	return $formHolder;
}

formize.prototype.generate = function() {
	var fields = this.fields;

	var $formHolder = this.formEl('post', this.endpoint + '/new');
	var $form = $formHolder('form');
	
	for(var i in fields) {
		field = fields[i];

		this[field] = this.model.attributes[field];

		this[field].dom = new Field(this[field]);
		$form.append(this[field].dom);
	}
	$form.append(this.submitButtonEl());
	return $formHolder;
}

formize.prototype.generateFor = function(instance) {
	var fields = this.fields;

	var $formHolder = this.formEl('post', this.endpoint + '/edit/' + instance.id);
	var $form = $formHolder('form');
	
	for(var i in fields) {
		field = fields[i];

		this[field] = this.model.attributes[field];

		this[field].dom = new Field(this[field], instance[field]);
		$form.append(this[field].dom);
	}
	$form.append(this.submitButtonEl());
	return $formHolder;
}

module.exports = formize;
